// Description: Services for handling chat operations
const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");

async function sendMessage(_, { chatRoomId, text }, context) {
  const userId = context.user.userId;
  // Create the new record for chatmessage
  const messagePayload = await prisma.chatMessages.create({
    data: {
      userId: userId,
      message: text,
      chatRoomId: chatRoomId,
    },
  });

  // Retrieve the chatRoom payload data for friend and user ids
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

  // Remove unwanted payload from chatRoomPayload
  delete chatRoomPayload.createdAt;
  delete chatRoomPayload.friendShipId;
  delete chatRoomPayload.id;

  // Record the notification about friend send you a message
  const notification = await prisma.message.create({
    data: {
      content: `You got a message from ${chatRoomPayload.friendshp.user.username}`,
      sender: userId,
      requestedId: chatRoomId,
    },
  });

  // Publish the new chat message event to Redis for live chat
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

  // Return true payload to say its send
  return true;
}

async function chatRoomCell(_, { friendshipId }, context) {
  // Find you are friend with userB
  const friend = await prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
  });

  // If not throw error
  if (!friend) {
    throw new Error("Friend is not found");
  }

  // Check the chatRoom is exist using friendship id
  let chatRoom = await prisma.chatRoom.findFirst({
    where: {
      friendShipId: friendshipId,
    },
  });

  // If not exists chatRoom
  if (!chatRoom) {
    // Create new ChatRoom
    chatRoom = await prisma.chatRoom.create({
      data: {
        friendShipId: friendshipId,
      },
    });
  }

  // Return ChatRoomPaylaod to user
  return chatRoom;
}

async function chatRoomList(_, obj, context) {
  const userId = context.user.userId;
  const roomList = await prisma.chatRoom.findMany({
    where: {
      friendshp: {
        OR: [{ userId: userId }, { friendId: userId }],
      },
    },
  });

  if (roomList <= 0) {
    throw new Error("Zero ChatRoom");
  }

  return roomList;
}

async function chatMessageList(_, { chatRoomId }, context) {
  const msgList = await prisma.chatMessages.findMany({
    where: {
      chatRoomId: chatRoomId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (msgList.length <= 0) {
    throw new Error("Not Enough messages");
  }

  return msgList;
}

module.exports = {
  sendMessage,
  chatRoomCell,
  chatRoomList,
  chatMessageList,
};
