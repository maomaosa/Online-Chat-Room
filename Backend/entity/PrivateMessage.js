import Message from "./Message.js";

class PrivateMessage extends Message {
  constructor(senderId, content, messageStatus, isRead, receiverId) {
    super(senderId, content, messageStatus, isRead, receiverId);
    this.type = 1;
  }
}

export default PrivateMessage;
