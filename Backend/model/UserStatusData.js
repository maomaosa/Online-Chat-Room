import DatabaseManager from "../data/DatabaseManager.js";

class UserStatusData {
  static async getUserShareStatus(userId) {
    const sqlQuery =
      "SELECT share_status FROM esn_user_share_status WHERE user_id = $1";
    const values = [userId];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      if (result.rows.length > 0) {
        const shareStatus = result.rows[0].share_status;
        return { statusCode: 200, data: shareStatus };
      } else {
        return {
          statusCode: 400,
          data: "Share status not found for the user",
        };
      }
    } catch (error) {
      console.error("Error fetching share status", error);
      throw new Error("Error fetching share status");
    }
  }

  static async updateUserShareStatus(userId, status) {
    const sqlQuery =
      "UPDATE esn_user_share_status SET share_status = $2 WHERE user_id = $1";
    const values = [userId, status];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return {
        statusCode: 200,
        message: "User share status updated successfully",
      };
    } catch (error) {
      console.error("Error updating share status", error);
      throw new Error("Error updating share status");
    }
  }

  static async addUserShareStatus(userId) {
    const sqlQuery =
      "INSERT INTO esn_user_share_status (user_id, share_status) VALUES ($1, 0)";
    const values = [userId];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return {
        statusCode: 201,
        data: "User share status added successfully",
      };
    } catch (error) {
      console.error("Error adding share status", error);
      throw new Error("Error adding share status");
    }
  }

  static async addUserStatusHistory(messageHistory) {
    const sqlQuery =
      "INSERT INTO esn_user_share_status_history (user_id, share_status, timestamp) VALUES ($1, $2, $3)";
    const values = [
      messageHistory.userId,
      messageHistory.status,
      messageHistory.timestamp,
    ];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return {
        statusCode: 201,
        data: "User share status history added successfully",
      };
    } catch (error) {
      console.error("Error adding share status history", error);
      throw new Error("Error adding share status history");
    }
  }

  static async getTenLatestShareStatusHistory(userId) {
    const sqlQuery =
      "SELECT * FROM esn_user_share_status_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10;";
    const values = [userId];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      const historyData = result.rows;
      return {
        statusCode: 200,
        data: historyData,
      };
    } catch (error) {
      console.error("Error getting user share status error", error);
      throw new Error("Error getting user share status error");
    }
  }
}

export default UserStatusData;
