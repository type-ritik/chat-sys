const { prisma } = require("../data/prisma");
const { isValidUsername, isSuspended } = require("../utils/user.config");
const validator = require("../utils/validator");

async function exploreFriends(_, { username }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  if (!validator.isAlphanumeric(username)) {
    throw new Error("Invalid username");
  }

  // Find the user by username
  const friend = await prisma.user
    .findUnique({
      where: { username, status: "ACTIVE" },
      include: {
        profile: {
          select: {
            id: true,
            avatarUrl: true,
          },
        },
      },
    })
    .catch((error) => {
      console.error("Error fetching user:", error.message);
      throw new Error("Error fetching user");
    });

  delete friend.password; // Remove password before returning user data

  // Return the friend payload
  return friend;
}

async function exploreChatFriend(_, { username }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  if (!isValidUsername(username)) {
    throw new Error("Invalid username");
  }

  try {
    // Find friendship exist of user with friends username
    const friendship = await prisma.friendship
      .findFirst({
        where: {
          status: "ACCEPTED", // Ensure they are actually friends
          OR: [
            {
              userId: userId,
              user: {
                status: "ACTIVE",
              },
              friend: { username: username, status: "ACTIVE" },
            },
            {
              friendId: userId,
              friend: {
                status: "ACTIVE",
              },
              user: { username: username, status: "ACTIVE" },
            },
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
              status: true,
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
              status: true,
              profile: {
                select: { id: true, isActive: true, avatarUrl: true },
              },
            },
          },
        },
      })
      .catch((error) => {
        console.error("Error fetching friendship:", error.message);
        throw new Error("Error fetching friendship");
      });

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
  } catch (error) {
    console.error("Error exploring chat friend:", error.message);
    throw new Error("Error exploring chat friend");
  }
}

async function friendList(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const friendships = await prisma.friendship
    .findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          {
            userId: userId,
            user: {
              status: "ACTIVE",
            },
            friend: {
              status: "ACTIVE",
            },
          },
          {
            friendId: userId,
            friend: {
              status: "ACTIVE",
            },
            user: {
              status: "ACTIVE",
            },
          },
        ],
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
    })
    .catch((error) => {
      console.error("Error fetching friendships:", error.message);
      throw new Error("Error fetching friendships");
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

  const requests = await prisma.friendship.findMany({
    where: {
      friendId: userId,
      status: "PENDING",
      friend: {
        status: "ACTIVE",
      },
      user: {
        status: "ACTIVE",
      },
    },
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
