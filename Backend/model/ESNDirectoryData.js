import DatabaseManager from "../data/DatabaseManager.js";
class ESNDirectoryData {
  static async getESNDirectory(criteriaType, criteriaContent) {
    let sqlQuery =
      "SELECT esn_directory.*, esn_user_share_status.share_status FROM esn_directory LEFT JOIN esn_user u ON esn_directory.user_id = u.user_id LEFT JOIN esn_user_share_status ON esn_directory.user_id = esn_user_share_status.user_id WHERE u.account_status = 0";

    let params = [];

    if (criteriaType === "username") {
      sqlQuery += " AND esn_directory.username LIKE $1";
      params.push("%" + criteriaContent + "%");
    } else if (criteriaType === "shareStatus") {
      sqlQuery += " AND esn_user_share_status.share_status = $1";
      params.push(criteriaContent);
    }

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, params);
      return { statusCode: 200, data: result.rows };
    } catch (error) {
      console.error("Error getting ESN Directory:", error);
      throw new Error("Error getting ESN Directory: " + error.message);
    }
  }

  static async insertESNDirectory(userId, username) {
    try {
      const sqlQuery =
        "INSERT INTO esn_directory (user_id, username) VALUES ($1, $2) RETURNING *";
      const values = [userId, username];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const insertedDirectory = result.rows[0];
        return { statusCode: 201, data: insertedDirectory };
      } else {
        throw new Error("Error inserting ESN Directory: No rows returned");
      }
    } catch (error) {
      console.error("Error inserting ESN Directory:", error);
      throw new Error("Error inserting ESN Directory");
    }
  }

  static async updateESNDirectory(userId, status) {
    const sqlQuery =
      "UPDATE esn_directory SET online_status=$2 WHERE user_id=$1";
    const values = [userId, status];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return { statusCode: 200, data: "Update ESN Directory succeed!" };
    } catch (error) {
      console.error("Error updating ESN Directory", error);
      throw new Error("Error updating ESN Directory");
    }
  }

  static async getESNDirectoryByUserId(userId) {
    const sqlQuery = "SELECT * FROM esn_directory WHERE user_id = $1";
    const values = [userId];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      return { statusCode: 200, data: result.rows };
    } catch (error) {
      console.error("Error getting directory by user id", error);
    }
  }

  static async setAllUsersOffline() {
    const sqlQuery = "UPDATE esn_directory SET online_status = 0";
    try {
      await DatabaseManager.getDb().query(sqlQuery);
      return { statusCode: 200, data: "Offline all users succeed!" };
    } catch (error) {
      console.error("Error offline all users", error);
      throw new Error("Error offline all users");
    }
  }
}

export default ESNDirectoryData;
