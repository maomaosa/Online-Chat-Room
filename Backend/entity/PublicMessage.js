import Message from "./Message.js";

class PublicMessage extends Message {
  constructor(senderId, content, messageStatus, isRead, receiverId) {
    super(senderId, content, messageStatus, isRead, receiverId);
    this.type = 0;
  }
}

export default PublicMessage;
