class Chat {
  messageState = Object.freeze({
    DRAFT: "DRAFT",
    SENT: "SENT",
    FAILED: "FAILED",
  });

  currentState = this.messageState.DRAFT;

  constructor() {}

  //   Chat Message State
  setCurrentState(state) {
    this.currentState = state;
  }

  getCurrentState() {
    return this.currentState;
  }
}
