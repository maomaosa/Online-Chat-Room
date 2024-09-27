import Message from "./Message.js";

class AnnouncementMessage extends Message {
  constructor(senderId, content, messageStatus, isRead, receiverId) {
    super(senderId, content, messageStatus, isRead, receiverId);
    this.type = 2;
  }
}

export default AnnouncementMessage;
