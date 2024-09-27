import DatabaseManager from "../data/DatabaseManager.js";

class UserProfileData {
  // Retrieve profiles by job type
  static async getProfilesByJobType(jobType) {
    const sqlQuery = `
    SELECT eupp.*, eu.username
    FROM esn_user_profession_profile eupp
    INNER JOIN esn_user eu ON eupp.user_id = eu.user_id
    WHERE eupp.job_type = $1
`;
    const values = [jobType];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      return result.rows;
    } catch (error) {
      throw new Error("Error fetching profiles by job type: " + error.message);
    }
  }
  static async getUserAndProfileByUsername(username) {
    const sqlQuery = `
    SELECT 
      u.user_id,
      u.username,
      u.password_hash,
      u.acknowledge_status,
      u.gender,
      u.phone_number,
      upp.job_type,
      upp.message_content,
      a.id AS appointment_id,
      a.reserver_id,
      a.reservee_id,
      a.start_schedule_date,
      a.end_schedule_date
    FROM 
      esn_user u
      LEFT JOIN esn_user_profession_profile upp ON u.user_id = upp.user_id
      LEFT JOIN esn_appointment a ON u.user_id = a.reservee_id
    WHERE 
      u.username = $1
    ORDER BY 
      a.start_schedule_date;
  `;

    const values = [username];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      if (result.rows.length > 0) {
        const uniqueAppointments = {};
        result.rows.forEach((row) => {
          if (row.appointment_id && !uniqueAppointments[row.appointment_id]) {
            uniqueAppointments[row.appointment_id] = {
              appointment_id: row.appointment_id,
              reserver_id: row.reserver_id,
              start_schedule_date: row.start_schedule_date,
              end_schedule_date: row.end_schedule_date,
            };
          }
        });
        const appointments = Object.values(uniqueAppointments);

        const user = {
          user_id: result.rows[0].user_id,
          username: result.rows[0].username,
          password_hash: result.rows[0].password_hash,
          acknowledge_status: result.rows[0].acknowledge_status,
          gender: result.rows[0].gender,
          phone_number: result.rows[0].phone_number,
          job_type: result.rows[0].job_type,
          message_content: result.rows[0].message_content,
          appointments: appointments,
        };
        return { statusCode: 200, data: user };
      } else {
        return { statusCode: 404, data: null };
      }
    } catch (error) {
      console.error("Error fetching user and profile by username", error);
      return {
        statusCode: 500,
        data: "Error fetching user and profile by username",
      };
    }
  }

  static async insertUserProfile(userId, profileData) {
    const { jobType, messageContent, isPosted } = profileData;
    const sqlQuery = `
      INSERT INTO esn_user_profession_profile (user_id, job_type, message_content, isPosted) 
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [userId, jobType, messageContent, isPosted];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error inserting user profile: " + error.message);
    }
  }

  static async deleteUserProfile(userId) {
    const sqlQuery =
      "DELETE FROM esn_user_profession_profile WHERE user_id = $1";
    const values = [userId];

    try {
      await DatabaseManager.getDb().query(sqlQuery, values);
      return { message: "Profile deleted successfully" };
    } catch (error) {
      throw new Error("Error deleting user profile: " + error.message);
    }
  }

  // static async updateUserProfile(updatedProfileData) {
  //   const { jobType, messageContent,user_id } = updatedProfileData;
  //   const sqlQuery = `
  //   INSERT INTO esn_user_profession_profile (user_id, job_type, message_content)
  //   VALUES ($1, $2, $3)
  //   ON CONFLICT (user_id)
  //   DO UPDATE SET job_type = EXCLUDED.job_type, message_content = EXCLUDED.message_content
  //   RETURNING *;
  // `;

  //   const values = [user_id,jobType, messageContent];

  //   try {
  //     const result = await DatabaseManager.getDb().query(sqlQuery, values);
  //     return result.rows[0];
  //   } catch (error) {
  //     throw new Error("Error updating user profile: " + error.message);
  //   }
  // }
  static async updateUserProfile(updatedProfileData) {
    const { jobType, messageContent, user_id } = updatedProfileData;

    const checkQuery = `SELECT 1 FROM esn_user_profession_profile WHERE user_id = $1`;
    try {
      const checkResult = await DatabaseManager.getDb().query(checkQuery, [
        user_id,
      ]);

      if (checkResult.rows.length === 0) {
        const insertQuery = `
          INSERT INTO esn_user_profession_profile (user_id, job_type, message_content)
          VALUES ($1, $2, $3)
          RETURNING *;
        `;
        const insertValues = [user_id, jobType, messageContent];
        const insertResult = await DatabaseManager.getDb().query(
          insertQuery,
          insertValues
        );
        return insertResult.rows[0];
      } else {
        const updateQuery = `
          UPDATE esn_user_profession_profile
          SET job_type = $2, message_content = $3
          WHERE user_id = $1
          RETURNING *;
        `;
        const updateValues = [user_id, jobType, messageContent];
        const updateResult = await DatabaseManager.getDb().query(
          updateQuery,
          updateValues
        );
        return updateResult.rows[0];
      }
    } catch (error) {
      throw new Error("Error updating user profile: " + error.message);
    }
  }
}

export default UserProfileData;
