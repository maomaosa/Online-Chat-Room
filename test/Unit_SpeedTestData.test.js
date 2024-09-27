import SpeedTestData from "../Backend/model/SpeedTestData";
import DatabaseManager from "../Backend/data/DatabaseManager";

// Mock the DatabaseManager module
jest.mock("../Backend/data/DatabaseManager");

describe("SpeedTestData", () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    describe("switchToTestDB", () => {
        it("should switch to the test database successfully", async () => {
            // Setup
            DatabaseManager.connectToDatabase.mockResolvedValue();

            // Act
            await SpeedTestData.switchToTestDB();

            // Assert
            expect(DatabaseManager.connectToDatabase).toHaveBeenCalledWith("esn_test");
            expect(DatabaseManager.connectToDatabase).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the database connection fails", async () => {
            // Setup
            const error = new Error("Database connection failed");
            DatabaseManager.connectToDatabase.mockRejectedValue(error);

            // Act & Assert
            await expect(SpeedTestData.switchToTestDB()).rejects.toThrow("Error switching to test database");
        });
    });

    describe("swithcBackToMainDB", () => {
        it("should switch back to the main database successfully", async () => {
            // Setup
            DatabaseManager.connectToDatabase.mockResolvedValue();

            // Act
            await SpeedTestData.swithcBackToMainDB();  // Note: Consider renaming the function to `switchBackToMainDB` for correct spelling.

            // Assert
            expect(DatabaseManager.connectToDatabase).toHaveBeenCalledWith("esndb");
            expect(DatabaseManager.connectToDatabase).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the database connection fails", async () => {
            // Setup
            const error = new Error("Database connection failed");
            DatabaseManager.connectToDatabase.mockRejectedValue(error);

            // Act & Assert
            await expect(SpeedTestData.swithcBackToMainDB()).rejects.toThrow("Error switching to main database");
        });
    });

    describe("getDatabase", () => {
        it("should retrieve the database instance successfully", async () => {
            // Setup
            const mockDbInstance = {};
            DatabaseManager.getDb.mockResolvedValue(mockDbInstance);

            // Act
            const db = await SpeedTestData.getDatabase();

            // Assert
            expect(db).toBe(mockDbInstance);
            expect(DatabaseManager.getDb).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if getting the database instance fails", async () => {
            // Setup
            const error = new Error("Failed to get database instance");
            DatabaseManager.getDb.mockRejectedValue(error);

            // Act & Assert
            await expect(SpeedTestData.getDatabase()).rejects.toThrow("Error getting database");
        });
    });
});
