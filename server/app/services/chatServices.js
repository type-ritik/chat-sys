// Description: Services for handling chat operations
const { GraphQLError } = require("graphql");
const { prisma } = require("../data/prisma");
const { pubsub } = require("../data/pubsub");
const validator = require("../utils/validator");

const MESSAGE_STATE = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  FAILED: "FAILED",
};

// On Click Send Messages - Now Stateful
async function sendMessage(_, { chatRoomId, text }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  try {
    // Step 1: Create the new record for chatmessage with DRAFT status
    console.log(
      `[Message State] Creating message with status: ${MESSAGE_STATE.DRAFT}`,
    );

    let messagePayload = await prisma.chatRoomMessage
      .create({
        data: {
          userId: userId,
          message: text,
          chatRoomId: chatRoomId,
          status: MESSAGE_STATE.DRAFT,
        },
      })
      .catch((error) => {
        console.error(
          `[Message State] Failed to create message: ${error.message}`,
        );
        throw new Error(`Failed to create message: ${error.message}`);
      });

    // Step 2: Retrieve the chatRoom payload data for friend and user ids
    const chatRoomPayload = await prisma.chatRoom
      .findFirst({
        where: {
          id: chatRoomId,
          friendship: {
            friend: {
              status: "ACTIVE",
            },
            user: {
              status: "ACTIVE",
            },
          },
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
      })
      .catch((error) => {
        console.error(
          `[Message State] Failed to retrieve chat room data: ${error.message}`,
        );
        throw new Error(`Failed to retrieve chat room data: ${error.message}`);
      });

    const receiverId =
      userId === chatRoomPayload.friendship.friend.id
        ? chatRoomPayload.friendship.user.id
        : chatRoomPayload.friendship.friend.id;

    // Remove unwanted payload from chatRoomPayload
    // delete chatRoomPayload.friendship.friendId;
    // delete chatRoomPayload.friendship.userId;
    // delete chatRoomPayload.friendship.status;
    // delete chatRoomPayload.createdAt;
    // delete chatRoomPayload.friendshipId;
    // delete chatRoomPayload.id;

    // Step 3: Record the notification about friend sending you a message
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

    // Step 4: Publish the new chat message event to Redis for live chat
    const recipientId =
      userId === chatRoomPayload.friendship.friend.id
        ? chatRoomPayload.friendship.user.id
        : chatRoomPayload.friendship.friend.id;

    pubsub.publish(`CHATMSG:${recipientId}`, {
      chatMsg: messagePayload,
    });

    pubsub.publish(`NOTIFICATIONS:${recipientId}`, {
      subNotify: notification,
    });

    // Step 5: Update message status to SENT after successful operations
    console.log(
      `[Message State] Updating message status to: ${MESSAGE_STATE.SENT}`,
    );

    messagePayload = await prisma.chatRoomMessage.update({
      where: { id: messagePayload.id },
      data: { status: MESSAGE_STATE.SENT },
    });

    console.log(
      `[Message State] Message sent successfully with status: ${messagePayload.status}`,
    );

    // Return the complete message object with status
    return {
      success: true,
      message: messagePayload,
      timestamp: messagePayload.createdAt,
    };
  } catch (error) {
    console.error(`[Message State] Error sending message: ${error.message}`);

    // Try to find and update the message to FAILED status if it was created
    try {
      const failedMessage = await prisma.chatRoomMessage.findFirst({
        where: {
          chatRoomId: chatRoomId,
          userId: userId,
          message: text,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      if (!failedMessage) {
        console.log(
          `[Message State] Updating message status to: ${MESSAGE_STATE.FAILED}`,
        );
        await prisma.chatRoomMessage.update({
          where: { id: failedMessage.id },
          data: { status: MESSAGE_STATE.FAILED },
        });
      }
    } catch (updateError) {
      console.error(
        `[Message State] Failed to update message status to FAILED:`,
        updateError,
      );
    }

    throw new Error(`Failed to send message: ${error.message}`);
  }
}

async function chatRoomCell(_, { friendId }, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  if (!validator.isUUID(friendId)) {
    throw new Error("Invalid friendId");
  }

  // Find you are friend with userB
  const friend = await prisma.friendship
    .findFirst({
      where: {
        status: "ACCEPTED",
        user: {
          status: "ACTIVE",
        },
        friend: {
          status: "ACTIVE",
        },
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    })
    .catch((error) => {
      console.error(`Failed to find friendship: ${error.message}`);
      throw new Error(`Failed to find friendship: ${error.message}`);
    });

  // If not throw error

  // Check the chatRoom is exist using friendship id
  let chatRoom = await prisma.chatRoom.findFirst({
    where: {
      friendshipId: friend.id,
    },
  });

  // If not exists chatRoom
  if (!chatRoom) {
    // Create new ChatRoom
    chatRoom = await prisma.chatRoom.create({
      data: {
        friendshipId: friend.id,
      },
    });
  }

  // Return ChatRoomPaylaod to user
  return chatRoom;
}

async function chatRoomList(_, obj, context) {
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const rooms = await prisma.chatRoom.findMany({
    where: {
      friendship: {
        user: {
          status: "ACTIVE",
        },
        friend: {
          status: "ACTIVE",
        },
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
  const userId = context.user.userId;

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  if (!validator.isUUID(chatRoomId)) {
    throw new Error("Invalid chatRoomId");
  }

  const msgList = await prisma.chatRoomMessage.findMany({
    where: {
      chatRoomId: chatRoomId,
      user: {
        status: "ACTIVE",
      },
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

  if (!userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  if (!validator.isUUID(chatRoomId)) {
    throw new Error("Invalid chatroom UUID");
  }

  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: chatRoomId,
      friendship: {
        user: {
          status: "ACTIVE",
        },
        friend: {
          status: "ACTIVE",
        },
      },
    },
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

  // console.log("ChatCellData", chatCellData);
  return chatCellData;
}

module.exports = {
  sendMessage,
  chatRoomCell,
  chatRoomList,
  chatMessageList,
  chatCellData,
};
