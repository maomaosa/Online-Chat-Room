import PublicMessage from "./PublicMessage.js";
import PrivateMessage from "./PrivateMessage.js";
import AnnouncementMessage from "./AnnouncementMessage.js";

class MessageFactory {
  static createMessage(
    type,
    content,
    senderId,
    messageStatus,
    isRead = 0,
    receiverId = 0
  ) {
    switch (type) {
      case "public":
        return new PublicMessage(
          senderId,
          content,
          messageStatus,
          1,
          receiverId
        );
      case "private":
        return new PrivateMessage(
          senderId,
          content,
          messageStatus,
          isRead,
          receiverId
        );
      case "announcement":
        return new AnnouncementMessage(
          senderId,
          content,
          messageStatus,
          1,
          receiverId
        );
      default:
        throw new Error("Invalid message type");
    }
  }
}
export default MessageFactory;
