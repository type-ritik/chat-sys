const { prisma } = require("../data/prisma");

async function retrieveNotification(_, obj, context) {
  const userId = context.user.userId;
  if (!userId) {
    console.log("UserId Error");
    throw new Error("UserId is not found");
  }

  const notiPayload = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (notiPayload.length < 0) {
    console.log("Notification Error");
    throw new Error("Notification Error");
  }

  return notiPayload;
}

module.exports = { retrieveNotification };
