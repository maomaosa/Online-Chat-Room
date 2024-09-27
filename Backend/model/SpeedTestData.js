import DatabaseManager from "../data/DatabaseManager.js";

class SpeedTestData {


   static async switchToTestDB() {
    try {
        await DatabaseManager.connectToDatabase("esn_test");
        console.log("Switched to test database");
    } catch (error) {
        console.error("Error switching to test database:", error);
        throw new Error("Error switching to test database");
    }
   }

   static async swithcBackToMainDB() {
    try {
        await DatabaseManager.connectToDatabase("esndb");
        console.log("Switched to main database");
    } catch (error) {
        console.error("Error switching to main database:", error);
        throw new Error("Error switching to main database");
    }
   }

   static async getDatabase() {
        try {
             const db = await DatabaseManager.getDb();
             return db;
        } catch (error) {
             console.error("Error getting database:", error);
             throw new Error("Error getting database");
        }
   }

}

export default SpeedTestData;