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

  // Find friends of the user

  return friend;
}

async function exploreChatFriend(_, { userId, username }, context) {
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

  if (!user) {
    throw new Error(`You don't have a friend name ${username}.`);
  }

  return user;
}

module.exports = { exploreFriends, exploreChatFriend };
