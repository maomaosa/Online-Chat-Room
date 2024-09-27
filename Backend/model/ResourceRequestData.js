import DatabaseManager from "../data/DatabaseManager.js";

class ResourceRequestData {
  static async insertResourceRequest(resourceRequest) {
    try {
      const sqlQuery = `
        INSERT INTO esn_resource_request 
        (resource_id, user_id, amount, timestamp) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`;
      const values = [
        resourceRequest.resourceId,
        resourceRequest.userId,
        resourceRequest.amount,
        resourceRequest.timestamp,
      ];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      const insertedResourceRequest = result.rows[0];
      return { statusCode: 201, data: insertedResourceRequest };
    } catch (error) {
      console.error("Error inserting resource request", error);
      throw new Error("Error inserting resource request");
    }
  }

  static async updateResourceRequestState(resourceRequestId, status) {
    try {
      const sqlQuery = `
      UPDATE esn_resource_request 
      SET status = $2
      WHERE id = $1 
      RETURNING *`;
      const values = [resourceRequestId, status];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const updatedResource = result.rows[0];
        return { statusCode: 200, data: updatedResource };
      } else {
        return { statusCode: 404, data: {} };
      }
    } catch (error) {
      console.error("Error updating resource", error);
      throw new Error("Error updating resource");
    }
  }

  static async getResourceRequestsByResourceId(resourceId) {
    try {
      const sqlQuery = `
      SELECT * FROM esn_resource_request 
      WHERE resource_id = $1`;
      const values = [resourceId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const resources = result.rows;
        return { statusCode: 200, data: resources };
      } else {
        return { statusCode: 404, data: [] };
      }
    } catch (error) {
      console.error("Error retrieving resource requests by resource ID", error);
      throw new Error("Error retrieving resource requests by resource ID");
    }
  }

  static async countApprovedAmount(resourceId) {
    try {
      const sqlQuery = `
            SELECT SUM(amount) AS approved_amount
            FROM esn_resource_request
            WHERE resource_id = $1
            AND status = 1;
        `;
      const values = [resourceId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows[0]["approved_amount"]) {
        const approvedAmount = result.rows[0]["approved_amount"];
        return approvedAmount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error counting approved amount", error);
      throw new Error("Error counting approved amount");
    }
  }

  static async getRequestsByResourceId(resourceId) {
    try {
      const sqlQuery = `
        SELECT rr.*, u.username 
        FROM esn_resource_request AS rr
        JOIN esn_user AS u ON rr.user_id = u.user_id
       WHERE rr.resource_id = $1;
      
      `;
      const values = [resourceId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const requests = result.rows;
        return requests;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error getting requests by resource id", error);
      throw new Error("Error getting requests by resource id");
    }
  }

  static async getRequestsByUserId(userId) {
    try {
      const sqlQuery = `
        SELECT * 
        FROM esn_resource_request
        WHERE user_id = $1;
      
      `;
      const values = [userId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const requests = result.rows;
        return { statusCode: 200, data: requests };
      } else {
        return { statusCode: 200, data: [] };
      }
    } catch (error) {
      console.error("Error getting requests by user id", error);
      throw new Error("Error getting requests by user id");
    }
  }
}

export default ResourceRequestData;
