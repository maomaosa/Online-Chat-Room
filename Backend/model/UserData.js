import DatabaseManager from "../data/DatabaseManager.js";

class UserData {
  static async insertUser(username, passwordHash) {
    try {
      const sqlQuery =
        "INSERT INTO esn_user (username, password_hash ) VALUES ($1, $2) RETURNING *";
      const values = [username, passwordHash];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      const insertedUser = result.rows[0];
      return { statusCode: 201, data: insertedUser };
    } catch (error) {
      console.error("Error inserting user", error);
      throw new Error("Error inserting user");
    }
  }

  static async getUserByUsername(username) {
    try {
      const sqlQuery = "SELECT * FROM esn_user WHERE username = $1";
      const values = [username];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return { statusCode: 200, data: user };
      } else {
        return { statusCode: 400, data: null };
      }
    } catch (error) {
      console.error("Error selecting user by username", error);
      throw new Error("Error selecting user by username");
    }
  }

  static async changeAcknowledgeStatus(userId) {
    const sqlQuery =
      "UPDATE esn_user SET acknowledge_status = 1 WHERE user_id = $1";
    const values = [userId];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return { statusCode: 200, message: "User updated" };
    } catch (error) {
      console.error("Error updating user", error);
      throw new Error("Error updating user: " + error.message);
    }
  }
  static async updateUserProfile(gender, phoneNumber, username) {
    const sqlQuery =
      "UPDATE esn_user SET gender = $1, phone_number = $2 WHERE username = $3 RETURNING *";
    const values = [gender, phoneNumber, username];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      const updatedUser = result.rows[0];
      return { statusCode: 200, data: updatedUser };
    } catch (error) {
      console.error("Error updating user profile", error);
      return { statusCode: 500, data: "Error updating user profile" };
    }
  }

  static async getAllUserInfo() {
    // get username, user password, user privilege level and user active status
    const sqlQuery =
      "SELECT user_id, username, privilege_level, account_status FROM esn_user ORDER BY username ASC";
    try {
      const result = await DatabaseManager.getDb().query(sqlQuery);
      return { statusCode: 200, data: result.rows };
    } catch (error) {
      console.error("Error fetching all user info", error);
      return { statusCode: 500, data: "Error fetching all user info" };
    }
  }

  static async updatePassword(user_id, passwordHash) {
    const sqlQuery =
      "UPDATE esn_user SET password_hash = $1 WHERE user_id = $2 RETURNING *";
    const values = [passwordHash, user_id];
    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      const updatedUser = result.rows[0];
      return { statusCode: 200, data: updatedUser };
    } catch (error) {
      console.error("Error updating user password", error);
      return { statusCode: 500, data: "Error updating user password" };
    }
  }

  static async updateUserProfileById(
    user_id,
    username,
    privilege_level,
    account_status
  ) {
    const sqlQuery =
      "UPDATE esn_user SET username = $1, privilege_level = $2, account_status = $3 WHERE user_id = $4 RETURNING *";
    const values = [username, privilege_level, account_status, user_id];
    try {
      await DatabaseManager.getDb().query("BEGIN");
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      const isAtLeastOneAdminSatisfied = await UserData.checkAtLeastOneAdmin();

      if (isAtLeastOneAdminSatisfied) {
        await DatabaseManager.getDb().query("COMMIT");
        const updatedUser = result.rows[0];
        return { statusCode: 200, data: updatedUser };
      } else {
        await DatabaseManager.getDb().query("ROLLBACK");
        return { statusCode: 451, data: "At least one admin is required" };
      }
    } catch (error) {
      console.error("Error updating user profile", error);
      return { statusCode: 500, data: "Error updating user profile" };
    }
  }

  static async checkAtLeastOneAdmin() {
    const sqlQuery =
      "SELECT COUNT(*) FROM esn_user WHERE privilege_level = 2 AND account_status = 0";
    try {
      const result = await DatabaseManager.getDb().query(sqlQuery);
      return result.rows[0].count > 0;
    } catch (error) {
      console.error("Error checking at least one admin", error);
      return false;
    }
  }
}

export default UserData;
