import DatabaseManager from "../data/DatabaseManager.js";

class MessageData {
  static async insertMessage(message) {
    const sqlQuery =
      "WITH inserted_message AS (INSERT INTO esn_message (sender_id, receiver_id, content, message_status, timestamp, is_read,type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *) SELECT inserted_message.*, esn_user.username as sender_username FROM inserted_message LEFT JOIN esn_user ON inserted_message.sender_id = esn_user.user_id";

    const values = [
      message.senderId,
      message.receiverId,
      message.content,
      message.messageStatus,
      message.timestamp,
      message.isRead,
      message.type,
    ];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      const insertedMessage = result.rows[0];
      return { statusCode: 201, data: insertedMessage };
    } catch (error) {
      console.error("Error inserting message:", error);
      throw new Error("Error inserting message: " + error.message);
    }
  }

  static async getMessagesByType(filteredPublicMessageContent, messageType) {
    let sqlQuery =
      "SELECT m.*, u.username as sender_username FROM esn_message m LEFT JOIN esn_user u ON m.sender_id = u.user_id WHERE m.receiver_id = 0 AND m.type = $1 AND u.account_status = 0";

    let params = [messageType];

    if (filteredPublicMessageContent !== null) {
      sqlQuery += " AND LOWER(m.content) LIKE LOWER($2)";
      params.push(`%${filteredPublicMessageContent}%`);
    }

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, params);
      const messageHistory = result.rows;
      return { statusCode: 200, data: messageHistory };
    } catch (error) {
      console.error("Error getting messages:", error);
      throw new Error("Error getting messages: " + error.message);
    }
  }

  static async getMessagesBetween(p1, p2, filteredPrivateMessageContent) {
    let sqlQuery =
      "SELECT m.*, u.username as sender_username FROM esn_message m LEFT JOIN esn_user u ON m.sender_id = u.user_id WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))  AND u.account_status = 0";
    let params = [p1, p2];

    if (filteredPrivateMessageContent !== null) {
      sqlQuery += " AND LOWER(m.content) LIKE LOWER($3)";
      params.push(`%${filteredPrivateMessageContent}%`);
    }

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, params);
      const messageHistory = result.rows;
      return { statusCode: 200, data: messageHistory };
    } catch (error) {
      console.error("Error getting messages between users:", error);
      throw new Error("Error getting messages between users: " + error.message);
    }
  }

  static async updateMessagesReadBetween(receiverId, senderId) {
    const sqlQuery =
      "UPDATE esn_message SET is_read = 1 WHERE receiver_id = $2 AND sender_id = $1";
    const values = [receiverId, senderId];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      const { statusCode, data } = await MessageData.getUserUnreadMessages(
        senderId
      );
      if (statusCode === 500) {
        throw new Error("Error fetching unread messages");
      }
      return { statusCode: 200, data: data };
    } catch (error) {
      console.error("Error updating messages:", error);
      throw new Error("Error updating messages: " + error.message);
    }
  }

  static async getUserUnreadMessages(userId) {
    const sqlQuery =
      "SELECT esn_message.*, esn_user.username AS sender_username FROM esn_message LEFT JOIN esn_user ON esn_user.user_id = esn_message.sender_id WHERE receiver_id = $1 AND esn_message.is_read = 0 ";
    const values = [userId];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      const unreadMessages = result.rows;
      return { statusCode: 200, data: unreadMessages };
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      throw new Error("Error fetching unread messages: " + error.message);
    }
  }
}

export default MessageData;
