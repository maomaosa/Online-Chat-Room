//extend database interface, adapt it to Postgres
import pkg from "pg";
import DatabaseInterface from "./DatabaseInterface.js";

class PostgresAdaptor extends DatabaseInterface {
  constructor(connectionString) {
    super();
    this.client = new pkg.Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async connect() {
    await this.client
      .connect()
      .then(() => {})
      .catch((error) => {
        console.error("Error connecting to PostgreSQL:", error);
        throw error;
      });
  }

  async disconnect() {
    await this.client
      .end()
      .then(() => {})
      .catch((error) => {
        console.error("Error disconnecting from PostgreSQL:", error);
        throw error;
      });
  }

  async query(sqlQuery, values) {
    try {
      const response = await this.client.query(sqlQuery, values);
      return response;
    } catch (error) {
      console.error("Error querying PostgreSQL:", error);
      throw error;
    }
  }
}

export default PostgresAdaptor;
