import ESNDirectoryData from "../Backend/model/ESNDirectoryData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("ESNDirectoryData", () => {
  beforeEach(() => {
    DatabaseManager.getDb.mockReturnValue({
      query: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getESNDirectory", () => {
    it("should fetch directory data by username", async () => {
      const mockResult = { rows: [{ user_id: 1, username: "JohnDoe" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ESNDirectoryData.getESNDirectory("username", "JohnDoe");
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
      expect(DatabaseManager.getDb().query).toHaveBeenCalledWith(expect.any(String), ["%JohnDoe%"]);
    });

    it("should fetch directory data by shareStatus", async () => {
      const mockResult = { rows: [{ user_id: 1, share_status: "Active" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ESNDirectoryData.getESNDirectory("shareStatus", "Active");
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
      expect(DatabaseManager.getDb().query).toHaveBeenCalledWith(expect.any(String), ["Active"]);
    });

    it("should handle errors", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Database error"));
      await expect(ESNDirectoryData.getESNDirectory("username", "JohnDoe"))
        .rejects
        .toThrow("Error getting ESN Directory: Database error");
    });
  });

  describe("insertESNDirectory", () => {
    it("should insert a directory entry and return the inserted data", async () => {
      const mockDirectory = { user_id: 1, username: "JohnDoe" };
      const mockResult = { rows: [mockDirectory] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ESNDirectoryData.insertESNDirectory(1, "JohnDoe");
      expect(result).toEqual({ statusCode: 201, data: mockDirectory });
    });

    it("should handle insertion failures", async () => {
      DatabaseManager.getDb().query.mockResolvedValue({ rows: [] });
      await expect(ESNDirectoryData.insertESNDirectory(1, "JohnDoe"))
        .rejects
        .toThrow("Error inserting ESN Directory");
    });
  });
  describe("updateESNDirectory", () => {
    it("should update a directory entry", async () => {
      DatabaseManager.getDb().query.mockResolvedValue();
      const result = await ESNDirectoryData.updateESNDirectory(1, "Online");
      expect(result).toEqual({ statusCode: 200, data: "Update ESN Directory succeed!" });
    });

    it("should handle update failures", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Update error"));
      await expect(ESNDirectoryData.updateESNDirectory(1, "Online"))
        .rejects
        .toThrow("Error updating ESN Directory");
    });
  });

  describe("getESNDirectoryByUserId", () => {
    it("should retrieve directory data by user ID", async () => {
      const mockResult = { rows: [{ user_id: 1, username: "JohnDoe" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ESNDirectoryData.getESNDirectoryByUserId(1);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });
  });
  describe("setAllUsersOffline", () => {
    it("should set all users offline", async () => {
      DatabaseManager.getDb().query.mockResolvedValue();
      const result = await ESNDirectoryData.setAllUsersOffline();
      expect(result).toEqual({ statusCode: 200, data: "Offline all users succeed!" });
    });

    it("should handle errors when setting offline", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Offline error"));
      await expect(ESNDirectoryData.setAllUsersOffline())
        .rejects
        .toThrow("Error offline all users");
    });
  });


});
