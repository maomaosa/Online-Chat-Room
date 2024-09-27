import DatabaseManager from "../data/DatabaseManager.js";

class ResourceData {
  static async insertResource(resource) {
    try {
      const sqlQuery = `
        INSERT INTO esn_resource 
        (user_id, type, title, content, address, amount) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`;

      const values = [
        resource.userId,
        resource.type,
        resource.title,
        resource.content,
        ResourceData.transferAddress(resource.address),
        resource.amount,
      ];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      const insertedResource = result.rows[0];
      return { statusCode: 201, data: insertedResource };
    } catch (error) {
      console.error("Error inserting resource", error);
      throw new Error("Error inserting resource");
    }
  }

  static async deleteResource(resourceId) {
    try {
      const sqlQuery = `
      DELETE FROM esn_resource 
      WHERE id = $1 
      RETURNING *`;
      const values = [resourceId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const deletedResource = result.rows[0];
        return { statusCode: 200, data: deletedResource };
      } else {
        return { statusCode: 404, data: {} };
      }
    } catch (error) {
      console.error("Error deleting resource", error);
      throw new Error("Error deleting resource");
    }
  }

  static async updateResource(resource) {
    try {
      const sqlQuery = `
      UPDATE esn_resource 
      SET type = $2, title = $3, content = $4, amount = $5
      WHERE id = $1 
      RETURNING *`;
      const values = [
        resource.id,
        resource.type,
        resource.title,
        resource.content,
        resource.amount,
      ];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      const updatedResource = result.rows[0];
      return { statusCode: 200, data: updatedResource };
    } catch (error) {
      console.error("Error updating resource", error);
      throw new Error("Error updating resource");
    }
  }

  static async getFilteredResourcesPagination(filters) {
    try {
      const page = filters.page || 1;
      const pageSize = 5;
      const offset = (page - 1) * pageSize;

      let sqlQuery = `
        SELECT r.*, u.username
        FROM esn_resource AS r
        LEFT JOIN esn_user AS u ON r.user_id = u.user_id
      `;

      let values = [];

      if (filters.category) {
        sqlQuery += " WHERE type=$1";
        values.push(filters.category);
      }

      if (filters.title) {
        sqlQuery += " WHERE LOWER(title) LIKE LOWER($1)";
        values.push(`%${filters.title}%`);
      }

      if (filters.content) {
        sqlQuery += " WHERE LOWER(content) LIKE LOWER($1)";
        values.push(`%${filters.content}%`);
      }

      if (filters.distance && filters.userLocation) {
        const [userLongitude, userLatitude] = filters.userLocation.split(",");
        sqlQuery += `
        WHERE ST_Distance(r.address, ST_SetSRID(ST_MakePoint(${userLongitude}, ${userLatitude}), 4326)) <= $1
        `;
        values.push(filters.distance);
      }

      sqlQuery += " ORDER BY SUBSTRING(title, 1, 1) ASC";
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const resources = result.rows.slice(offset, offset + pageSize);
        const totalCount = result.rows.length;
        return {
          statusCode: 200,
          data: { data: resources, totalCount: totalCount },
        };
      } else {
        return { statusCode: 200, data: { data: [], totalCount: 0 } };
      }
    } catch (error) {
      console.error("Error retrieving filtered resources pagination", error);
      throw new Error("Error retrieving filtered resources pagination");
    }
  }

  static async getResourcesByUserId(currentUserId) {
    try {
      const sqlQuery = `
      SELECT * FROM esn_resource 
      WHERE user_id = $1`;
      const values = [currentUserId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length > 0) {
        const resources = result.rows;
        return { statusCode: 200, data: resources };
      } else {
        return { statusCode: 200, data: [] };
      }
    } catch (error) {
      console.error("Error retrieving resources by user ID", error);
      throw new Error("Error retrieving resources by user ID");
    }
  }

  static async getResourceById(resourceId) {
    try {
      let sqlQuery = `
        SELECT r.*, u.username
        FROM esn_resource AS r
        LEFT JOIN esn_user AS u ON r.user_id = u.user_id
        WHERE r.id = $1
      `;

      let values = [resourceId];
      const result = await DatabaseManager.getDb().query(sqlQuery, values);

      if (result.rows.length === 0) {
        return {};
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error retrieving filtered resources pagination", error);
      throw new Error("Error retrieving filtered resources pagination");
    }
  }

  static transferAddress(address) {
    const longitude = address.longitude;
    const latitude = address.latitude;
    const pointValue = `(${longitude}, ${latitude})`;

    return pointValue;
  }
}

export default ResourceData;
