const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");

async function followFriend(_, { userId, friendId }, context) {
  // Check if both users exist
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const friend = await prisma.user.findUnique({ where: { id: friendId } });

  if (!user || !friend) {
    throw new Error("Invalid Credential");
  }

  // Create a follow relationship
  const follow = await prisma.friendship.create({
    data: {
      userId: userId,
      friendId: friendId,
      status: "PENDING",
    },
  });

  console.log("Friendship record created:", follow);

  //   Notify the friend about the follow request (implementation depends on your notification system)
  const notification = await prisma.message.create({
    data: {
      content: `${user.username} has sent you a follow request.`,
      sender: user.username,
      requestedId: follow.id,
      isSeen: false,
    },
  });

  console.log("Notification record created:", notification);

  // Publish the notification to subscribers (if using subscriptions)
  pubsub.publish(`NOTIFICATIONS:${friendId}`, {
    subNotify: notification,
  });

  console.log("Notification is live-on user:", friend.username);

  return true;
}

// Everything related to following friends
async function followResponse(_, { friendshipId, status }, context) {
  // Check if friend record is valid
  const friend = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  // If record is invalid
  if (!friend) {
    console.log(`Invalid Credential`);
    throw new Error("Invalid Credential");
  }

  // Update the friend record Status - ["ACCEPTED", "REJECTED"]
  if (status !== "ACCEPTED") {
    await prisma.friendship.delete({
      where: {
        id: friendshipId,
      },
    });
  } else {
    await prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      data: {
        status: status,
      },
    });
  }

  console.log("Friendship record is updated");

  // Retrieve Friend Record include Sender record
  const friendPayload = await prisma.user.findUnique({
    where: {
      id: friend.userId,
    },
  });

  console.log("User record is retrieved");

  // Create notification for Sender for request update
  const notify = await prisma.message.create({
    data: {
      content: `${friendPayload.username} has ${status} your follow request.`,
      sender: friendPayload.username,
      requestedId: friendPayload.id,
      isSeen: false,
    },
  });

  console.log("Notification is record is created");

  // Publish Notification to Sender
  pubsub.publish(`NOTIFICATIONS:${friendPayload.id}`, {
    subNotify: notify,
  });

  console.log(
    "Notification sent to user: ",
    friendPayload.username,
    "Successfully."
  );

  return true;
}

module.exports = { followFriend, followResponse };
