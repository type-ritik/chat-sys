const { prisma } = require("../data/prisma");

async function retrieveNotification(_, obj, context) {
  const userId = context.user.userId;
  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const notiPayload = await prisma.message
    .findMany({
      where: {
        receiver: {
          status: "ACTIVE",
        },
        sender: {
          status: "ACTIVE",
        },
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
    })
    .catch((error) => {
      console.error("Error fetching notifications:", error.message);
      throw new Error("Error fetching notifications");
    });

  if (notiPayload.length < 0) {
    console.log("Notification Error");
    throw new Error("Notification Error");
  }

  return notiPayload;
}

module.exports = { retrieveNotification };
