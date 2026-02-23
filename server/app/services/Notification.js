const { prisma } = require("../data/prisma");
const { isSuspended } = require("../utils/user.config");

async function retrieveNotification(_, obj, context) {
  const userId = context.user.userId;
  if (!userId) {
    console.log("UserId Error");
    throw new Error("UserId is not found");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  const notiPayload = await prisma.message.findMany({
    where: {
      OR: [{ receiverId: userId }],
    },
    orderBy: {
      timestamp: "desc",
    },
    include: {
      sender: {
        select: {
          username: true,
          name: true,
          profile: {
            select: {
              avatarUrl: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (notiPayload.length < 0) {
    console.log("Notification Error");
    throw new Error("Notification Error");
  }

  return notiPayload;
}

module.exports = { retrieveNotification };
