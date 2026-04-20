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

  if (friendId === userId) {
    throw new Error("You cannot follow yourself.");
  }

  try {
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            userId: userId,
            friendId: friendId,
            friend: {
              status: "ACTIVE",
            },
            user: {
              status: "ACTIVE",
            },
          },
          {
            userId: friendId,
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
    });

    if (existingFriendship) {
      throw new Error("You already have a follow relationship with this user.");
    }

    // Check if both users exist

    const follow = await prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // console.log("Friendship record created:", follow);

    //   Notify the friend about the follow request (implementation depends on your notification system)
    const notification = await prisma.message.create({
      data: {
        content: `${follow.user.username} has sent you a follow request.`,
        senderId: follow.userId,
        receiverId: follow.friendId,
        requestedId: follow.id,
        isSeen: false,
      },
    });

    // console.log("Notification record created:", notification);

    // Publish the notification to subscribers (if using subscriptions)
    pubsub.publish(`NOTIFICATIONS:${follow.friendId}`, {
      subNotify: notification,
    });

    // console.log("Notification is live-on user:", sender.username);

    return true;
  } catch (error) {
    console.error("Error in followFriend:", error);
    throw new Error(
      error.message || "An error occurred while trying to follow the user.",
    );
  }
}

// Everything related to following friends
async function followResponse(_, { friendshipId, status }, context) {
  const userId = context.user.userId;

  // Check if friend record is valid
  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const friends = await prisma.friendship
    .update({
      where: {
        id: friendshipId,
        user: {
          status: "ACTIVE",
        },
        friend: {
          status: "ACTIVE",
        },
      },
      data: {
        status: status,
      },

      include: {
        friend: {
          select: {
            username: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    })
    .catch((error) => {
      console.error("Error fetching friendship record:", error.message);
      throw new Error("Error fetching friendship record");
    });

  // Create notification for Sender for request update
  const notify = await prisma.message.create({
    data: {
      content: `${friends.friend.username} has ${status} your follow request.`,
      senderId: userId,
      requestedId: friends.id,
      receiverId: friends.userId,
      isSeen: false,
    },
  });

  // Publish Notification to Sender
  pubsub.publish(`NOTIFICATIONS:${friends.userId}`, {
    subNotify: notify,
  });

  console.log(
    "Notification sent to user: ",
    friends.user.username,
    "Successfully.",
  );

  return true;
}

module.exports = { followFriend, followResponse };
