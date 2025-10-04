const { prisma } = require("../data/prisma");

async function exploreFriends(_, { username }, context) {
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
  // Find friendship exist of user with friends username
  const user = await prisma.friendship.findFirst({
    where: {
      OR: [
        {
          userId: userId,
          friend: {
            username: username,
          },
        },
        {
          friendId: userId,
          user: {
            username: username,
          },
        },
      ],
    },
  });

  // If not throw error
  if (!user) {
    throw new Error(`You don't have a friend name ${username}.`);
  }

  // Return the friendship payload
  return user;
}

async function friendList(_, obj, context) {
  const userId = context.user.userId;
  const friends = await prisma.friendship.findMany({
    where: {
      OR: [{ userId: userId }, { friendId: userId }],
      AND: [{ status: "ACCEPTED" }],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  if (friends.length <= 0) {
    throw new Error("Don't have any friends");
  }

  return friends;
}

async function friendRequestList(_, obj, context) {
  const userId = context.user.userId;
  const friendsReq = await prisma.friendship.findMany({
    where: {
      friendId: userId,
      status: "PENDING",
    },
    include: {
      user: true,
    },
  });

  if (friendList.length <= 0) {
    throw new Error("Don't have any request");
  }
  return friendsReq;
}

module.exports = { exploreFriends, exploreChatFriend, friendList, friendRequestList };
