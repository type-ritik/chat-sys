const { prisma } = require("../data/prisma");
const { isValidUsername, isSuspended } = require("../utils/user.config");

async function exploreFriends(_, { username }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  if (!isValidUsername(username)) {
    throw new Error("Invalid username");
  }
  // Find the user by username
  const isfriendExist = await prisma.user.findUnique({
    where: { username },
  });

  // Check if the user exists
  if (!isfriendExist) {
    throw new Error("User not found");
  }

  delete isfriendExist.password; // Remove password before returning user data

  // Find the friend user details
  const friend = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: {
        select: {
          id: true,
          avatarUrl: true,
        },
      }, // Include the profile relation
    },
  });

  // Return the friend payload
  return friend;
}

async function exploreChatFriend(_, { username }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  if (!isValidUsername(username)) {
    throw new Error("Invalid username");
  }

  // Find friendship exist of user with friends username
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED", // Ensure they are actually friends
      OR: [
        { userId: userId, friend: { username: username } },
        { friendId: userId, user: { username: username } },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      friendId: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          profile: {
            select: { id: true, isActive: true, avatarUrl: true },
          },
        },
      },
      friend: {
        select: {
          id: true,
          name: true,
          username: true,
          profile: {
            select: { id: true, isActive: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!friendship) {
    throw new Error(`You don't have a friend named ${username}.`);
  }

  // Extract the "other" person using a simple ternary
  const isInitiator = userId === friendship.userId;
  const targetUser = isInitiator ? friendship.friend : friendship.user;

  const payload = {
    id: friendship.id,
    userId: targetUser.id,
    name: targetUser.name,
    username: targetUser.username,
    profile: {
      id: targetUser.profile.id,
      avatarUrl: targetUser.profile.avatarUrl,
    },
  };

  return payload;
}

async function friendList(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ userId: userId }, { friendId: userId }],
    },
    select: {
      // Only select what you actually need to reduce payload size
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { id: true, avatarUrl: true } },
        },
      },
      friend: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { id: true, avatarUrl: true } },
        },
      },
    },
  });

  // Transform the data so the UI doesn't have to guess who the friend is
  const friends = friendships.map((f) =>
    f.user.id === userId ? f.friend : f.user,
  );

  // console.log("Friendlist", friends);

  if (friends.length <= 0) {
    throw new Error("Don't have any friends");
  }

  return friends;
}

async function friendRequestList(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  const requests = await prisma.friendship.findMany({
    where: { friendId: userId, status: "PENDING" },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { id: true, avatarUrl: true } },
        },
      },
    },
  });

  // Immediately flatten the response for the UI
  // const requesterList = requests.map((req) => req.user);

  // console.log("RequesterList", requesterList);

  if (friendList.length <= 0) {
    throw new Error("Don't have any request");
  }
  return requests;
}

module.exports = {
  exploreFriends,
  exploreChatFriend,
  friendList,
  friendRequestList,
};
