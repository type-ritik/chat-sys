// Description: Services for handling chat operations
const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");
const { isValidUUID } = require("../utils/user.config");

// On Click Send Messages
async function sendMessage(_, { chatRoomId, text }, context) {
  const userId = context.user.userId;

  if (!isValidUUID(chatRoomId)) {
    throw new Error("Invalid UUID");
  }

  // Create the new record for chatmessage
  const messagePayload = await prisma.chatRoomMessage.create({
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
  delete chatRoomPayload.friendship.friendId;
  delete chatRoomPayload.friendship.userId;
  delete chatRoomPayload.friendship.status;
  delete chatRoomPayload.createdAt;
  delete chatRoomPayload.friendshipId;
  delete chatRoomPayload.id;

  console.log("chatRoomPayload ", chatRoomPayload);
  // Record the notification about friend send you a message

  const notification = await prisma.message.create({
    data: {
      content: `You got a message from ${
        userId === chatRoomPayload.friendship.user.id
          ? chatRoomPayload.friendship.user.username
          : chatRoomPayload.friendship.friend.username
      }`,
      senderId: userId,
      requestedId: chatRoomId,
      receiverId:
        userId === chatRoomPayload.friendship.user.id
          ? chatRoomPayload.friendship.friend.id
          : chatRoomPayload.friendship.user.id,
    },
  });

  // Publish the new chat message event to Redis for live chat
  if (userId === chatRoomPayload.friendship.friend.id) {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendship.user.id}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendship.user.id}`, {
      subNotify: notification,
    });
  } else {
    pubsub.publish(`CHATMSG:${chatRoomPayload.friendship.friend.id}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${chatRoomPayload.friendship.friend.id}`, {
      subNotify: notification,
    });
  }

  // Return true payload to say its send
  return true;
}

async function chatRoomCell(_, { friendshipId }, context) {
  if (!isValidUUID(friendshipId)) {
    throw new Error("Invalid UUID");
  }

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
  const rooms = await prisma.chatRoom.findMany({
    where: {
      friendship: {
        OR: [{ userId: userId }, { friendId: userId }],
      },
    },
    include: {
      friendship: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: { id: true, isActive: true, avatarUrl: true },
              },
            },
          },
          friend: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: { id: true, isActive: true, avatarUrl: true },
              },
            },
          },
        },
      },
      // Get only the most recent message for each room
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (rooms.length === 0) throw new Error("Zero ChatRoom");

  // 2. Transform the data for the UI
  const roomListWithLastMsg = rooms.map((room) => {
    const { friendship, messages } = room;

    // Determine who the "other" person is
    const otherUser =
      friendship.userId === userId ? friendship.friend : friendship.user;

    return {
      id: room.id,
      otherUser,
      lastMsg: messages[0] || null, // Handle rooms with no messages
    };
  });

  // console.log("Chat room list", roomListWithLastMsg);

  return roomListWithLastMsg;
}

async function chatMessageList(_, { chatRoomId }, context) {
  if (!isValidUUID(chatRoomId)) {
    throw new Error("Invalid UUID");
  }

  const msgList = await prisma.chatRoomMessage.findMany({
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

  if (!isValidUUID(chatRoomId)) {
    throw new Error("Invalid UUID");
  }
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    select: {
      id: true,
      friendship: {
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: { id: true, isActive: true, avatarUrl: true },
              },
            },
          },
          friend: {
            select: {
              id: true,
              name: true,
              username: true,
              profile: {
                select: { id: true, isActive: true, avatarUrl: true },
              },
            },
          },
        },
      },
    },
  });

  if (!chatRoom) return null;

  // Determine who the "other" person is
  const { friendship } = chatRoom;
  const otherUser =
    friendship.userId === userId ? friendship.friend : friendship.user;

  // Return a clean object
  const chatCellData = {
    chatRoomId: chatRoom.id,
    otherUser,
  };

  console.log("ChatCellData", chatCellData);
  return chatCellData;
}

module.exports = {
  sendMessage,
  chatRoomCell,
  chatRoomList,
  chatMessageList,
  chatCellData,
};
