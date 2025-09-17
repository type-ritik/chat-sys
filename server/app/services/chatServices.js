// Description: Services for handling chat operations
const { db } = require("../data/db");
const { pubsub } = require("../data/pubsub");

async function sendMessage(userId, text) {
  const message = await db.message.create({ data: { userId, text } });

  //   Publish the new message event to Redis for subscriptions
  pubsub.publish("NEW_MESSAGE", { newMessage: message });

  return message;
}

module.exports = { sendMessage };
