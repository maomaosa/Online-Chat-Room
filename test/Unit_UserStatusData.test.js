import UserStatusData from "../Backend/model/UserStatusData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("UserStatusData", () => {
  const userId = 123;
  const status = "online";
  const messageHistory = { userId, status, timestamp: new Date() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserShareStatus", () => {
    it("returns share status if found", async () => {
      const mockDbResponse = {
        rows: [{ share_status: status }]
      };
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue(mockDbResponse)
      });

      const result = await UserStatusData.getUserShareStatus(userId);
      expect(result).toEqual({ statusCode: 200, data: status });
    });

    it("returns a 400 status if share status is not found", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue({ rows: [] })
      });

      const result = await UserStatusData.getUserShareStatus(userId);
      expect(result).toEqual({
        statusCode: 400,
        data: "Share status not found for the user"
      });
    });

    it("throws an error when the database query fails", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockRejectedValue(new Error("Query failed"))
      });

      await expect(UserStatusData.getUserShareStatus(userId))
        .rejects
        .toThrow("Error fetching share status");
    });
  });

  describe("updateUserShareStatus", () => {
    it("successfully updates share status", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue()
      });

      const result = await UserStatusData.updateUserShareStatus(userId, status);
      expect(result).toEqual({
        statusCode: 200,
        message: "User share status updated successfully"
      });
    });

    it("throws an error when the update fails", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockRejectedValue(new Error("Update failed"))
      });

      await expect(UserStatusData.updateUserShareStatus(userId, status))
        .rejects
        .toThrow("Error updating share status");
    });
  });

  describe("addUserShareStatus", () => {
    it("successfully adds a user share status", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue()
      });

      const result = await UserStatusData.addUserShareStatus(userId);
      expect(result).toEqual({
        statusCode: 201,
        data: "User share status added successfully"
      });
    });

    it("throws an error when adding fails", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockRejectedValue(new Error("Add failed"))
      });

      await expect(UserStatusData.addUserShareStatus(userId))
        .rejects
        .toThrow("Error adding share status");
    });
  });

  describe("addUserStatusHistory", () => {
    it("successfully adds a user status history", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue()
      });

      const result = await UserStatusData.addUserStatusHistory(messageHistory);
      expect(result).toEqual({
        statusCode: 201,
        data: "User share status history added successfully"
      });
    });

    it("throws an error when adding history fails", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockRejectedValue(new Error("History add failed"))
      });

      await expect(UserStatusData.addUserStatusHistory(messageHistory))
        .rejects
        .toThrow("Error adding share status history");
    });
  });

  describe("getTenLatestShareStatusHistory", () => {
    it("returns the last ten share statuses", async () => {
      const mockDbResponse = {
        rows: [messageHistory, messageHistory]  // Assuming there are two history items
      };
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockResolvedValue(mockDbResponse)
      });

      const result = await UserStatusData.getTenLatestShareStatusHistory(userId);
      expect(result).toEqual({
        statusCode: 200,
        data: [messageHistory, messageHistory]
      });
    });

    it("throws an error when fetching history fails", async () => {
      DatabaseManager.getDb.mockReturnValue({
        query: jest.fn().mockRejectedValue(new Error("Fetch failed"))
      });

      await expect(UserStatusData.getTenLatestShareStatusHistory(userId))
        .rejects
        .toThrow("Error getting user share status error");
    });
  });
});
