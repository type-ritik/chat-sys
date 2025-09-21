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
          avatarUrl: true
        }
      }, // Include the profile relation
    },
  });

  console.log("User found:", friend);

  // Find friends of the user

  return friend;
}

module.exports = { exploreFriends };
