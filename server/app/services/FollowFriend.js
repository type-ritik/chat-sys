const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");

async function followFriend(_, { userId, friendId }, context) {
  // Check if both users exist
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const friend = await prisma.user.findUnique({ where: { id: friendId } });

  if (!user || !friend) {
    throw new Error("User or Friend not found");
  }

  // Create a follow relationship
  const follow = await prisma.friendship.create({
    data: {
      userId: userId,
      friendId: friendId,
      status: "PENDING",
    },
  });

  console.log("Follow relationship created:", follow);

  //   Notify the friend about the follow request (implementation depends on your notification system)
  const notification = await prisma.message.create({
    data: {
      content: `${user.username} has sent you a follow request.`,
      sender: user.username,
      requestedId: friendId,
      isSeen: false,
    },
  });

    console.log("Notification sent:", notification);

    // Publish the notification to subscribers (if using subscriptions)
    pubsub.publish(`NOTIFICATION_SENT_TO:${friendId}`, { notificationSent: notification });

  return follow;
}

// Everything related to following friends

module.exports = { followFriend };
