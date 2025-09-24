// Description: Services for handling chat operations
const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");

async function sendMessage(_, { userId, chatRoomId, text }) {
  const messagePayload = await prisma.chatMessages.create({
    data: {
      userId: userId,
      message: text,
      chatRoomId: chatRoomId,
    },
  });

  const chatRoomPayload = await prisma.chatRoom.findFirst({
    where: {
      id: chatRoomId,
    },
    include: {
      friendshp: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          friend: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  delete chatRoomPayload.createdAt;
  delete chatRoomPayload.friendShipId;
  delete chatRoomPayload.id;

  const notification = await prisma.message.create({
    data: {
      content: `You got a message from ${chatRoomPayload.friendshp.user.username}`,
      sender: userId,
      requestedId: chatRoomId,
    },
  });

  //   Publish the new chat message event to Redis for subscriptions
  if (userId === chatRoomPayload.friendshp.friendId) {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendshp.userId}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendshp.userId}`, {
      subNotify: notification,
    });
  } else {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendshp.friendId}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendshp.friendId}`, {
      subNotify: notification,
    });
  }

  return true;
}

async function chatRoomCell(_, { friendshipId }, context) {

  const friend = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  if (!friend) {
    throw new Error("Friend is not found");
  }

  let chatRoom = await prisma.chatRoom.findFirst({
    where: {
      friendShipId: friendshipId,
    },
  });

  if (!chatRoom) {
    chatRoom = await prisma.chatRoom.create({
      data: {
        friendShipId: friendshipId,
      },
    });
  }

  return chatRoom;
}

module.exports = {
  sendMessage,
  chatRoomCell,
};
