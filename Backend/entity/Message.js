class Message {
  constructor(senderId, content, messageStatus, isRead, receiverId) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = Date.now();
    this.messageStatus = messageStatus;
    this.isRead = isRead;
  }
}
export default Message;
