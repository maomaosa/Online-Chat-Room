import DatabaseConfig from "./DatabaseConfig.js";

class DatabaseManager {
  static db = null;

  static async connectToDatabase(databaseName) {
    if (DatabaseManager.db) {
      await DatabaseManager.db.disconnect();
    }
    DatabaseManager.db = DatabaseConfig.createDatabase(databaseName);
    await DatabaseManager.db.connect();
  }

  static getDb() {
    if (!DatabaseManager.db) {
      throw new Error("Database not connected");
    }
    return DatabaseManager.db;
  }

  static async closeDatabase() {
    if (DatabaseManager.db) {
      await DatabaseManager.db.disconnect();
      DatabaseManager.db = null;
    }
  }
}

export default DatabaseManager;
