// Description: Services for handling chat operations
const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");

// On Click Send Messages
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
      friendship: {
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
  delete chatRoomPayload.friendshipId;
  delete chatRoomPayload.id;

  // Record the notification about friend send you a message
  const notification = await prisma.message.create({
    data: {
      content: `You got a message from ${chatRoomPayload.friendship.user.username}`,
      sender: userId,
      requestedId: chatRoomId,
    },
  });

  // Publish the new chat message event to Redis for live chat
  if (userId === chatRoomPayload.friendship.friendId) {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendship.userId}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendship.userId}`, {
      subNotify: notification,
    });
  } else {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendship.friendId}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendship.friendId}`, {
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
      friendshipId: friendshipId,
    },
  });

  // If not exists chatRoom
  if (!chatRoom) {
    // Create new ChatRoom
    chatRoom = await prisma.chatRoom.create({
      data: {
        friendshipId: friendshipId,
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
      friendship: {
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

async function chatCellData(_, { chatRoomId }, context) {
  const userId = context.user.userId;

  const chatCellPayload = await prisma.chatRoom.findFirst({
    where: { id: chatRoomId },
    include: {
      friendship: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: {
                  id: true,
                  isActive: true,
                  avatarUrl: true,
                },
              },
            },
          },
          friend: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: {
                  id: true,
                  isActive: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (chatCellPayload.friendship.userId === userId) {
    delete chatCellPayload.friendship.user;
  } else {
    delete chatCellPayload.friendship.friend;
  }

  console.log(chatCellPayload);

  return chatCellPayload;
}

module.exports = {
  sendMessage,
  chatRoomCell,
  chatRoomList,
  chatMessageList,
  chatCellData,
};
