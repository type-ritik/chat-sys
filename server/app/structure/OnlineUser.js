class OnlineUser {
  constructor() {
    this.users = new Set();
  }

  addUser(userId) {
    this.users.add(userId);
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  findUser(userId) {
    return this.users.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.users);
  }
}

const onlineUsers = new OnlineUser();

module.exports = { onlineUsers };
