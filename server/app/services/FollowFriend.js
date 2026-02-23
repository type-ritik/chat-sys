const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");
const {
  isValidUUID,
  findUserById,
  isSuspended,
} = require("../utils/user.config");

async function followFriend(_, { friendId }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  if (!isValidUUID(friendId)) {
    throw new Error("Invalid UUID");
  }

  const isUserSuspend = await isSuspended(userId);

  if (isUserSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  const isFriendSuspend = await isSuspended(friendId);

  if (isFriendSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  if (friendId === userId) {
    throw new Error("You cannot follow yourself.");
  }

  // Check if both users exist
  const sender = await findUserById(userId);
  const receiver = await findUserById(friendId);

  // const sender = await prisma.user.findUnique({ where: { id: userId } }); // Sender
  // const receiver = await prisma.user.findUnique({ where: { id: friendId } }); // Receiver

  // if (!sender || !receiver) {
  //   // Are both valid id
  //   throw new Error("Invalid Credential");
  // }

  // Create a follow relationship
  const follow = await prisma.friendship.create({
    data: {
      userId: sender.id,
      friendId: receiver.id,
      status: "PENDING",
    },
  });

  // console.log("Friendship record created:", follow);

  //   Notify the friend about the follow request (implementation depends on your notification system)
  const notification = await prisma.message.create({
    data: {
      content: `${sender.username} has sent you a follow request.`,
      senderId: sender.id,
      receiverId: receiver.id,
      requestedId: follow.id,
      isSeen: false,
    },
    include: {
      sender: {
        select: {
          username: true,
          name: true,
        },
      },
      receiver: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  // console.log("Notification record created:", notification);

  // Publish the notification to subscribers (if using subscriptions)
  pubsub.publish(`NOTIFICATIONS:${receiver.id}`, {
    subNotify: notification,
  });

  // console.log("Notification is live-on user:", sender.username);

  return true;
}

// Everything related to following friends
async function followResponse(_, { friendshipId, status }, context) {
  const userId = context.user.userId;
  // Check if friend record is valid

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const isSuspend = await isSuspended(userId);

  if (isSuspend) {
    throw new Error("Suspicious activity detected. Please try again later.");
  }

  if (!isValidUUID(friendshipId)) {
    throw new Error("Invalid UUID");
  }
  const friend = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  // console.log("Friend: ", friend);

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
    console.log("Rejected here!");
  } else {
    await prisma.friendship.update({
      where: {
        id: friendshipId,
      },
      data: {
        status: status,
      },
    });
    console.log("Accepted here!");
  }

  console.log("Friendship record is updated");

  // Retrieve Friend Record include Sender record
  const friendPayload = await prisma.user.findUnique({
    where: {
      id: friend.userId,
    },
  });

  const userPayload = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  console.log("User record is retrieved");

  // Create notification for Sender for request update
  const notify = await prisma.message.create({
    data: {
      content: `${userPayload.username} has ${status} your follow request.`,
      senderId: userId,
      requestedId: userPayload.id,
      receiverId: friendPayload.id,
      isSeen: false,
    },
    include: {
      sender: {
        select: {
          username: true,
          name: true,
        },
      },
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
    "Successfully.",
  );

  return true;
}

module.exports = { followFriend, followResponse };
