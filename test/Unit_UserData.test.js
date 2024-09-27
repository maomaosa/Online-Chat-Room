import UserData from "../Backend/model/UserData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("UserData", () => {
  beforeEach(() => {
    DatabaseManager.getDb.mockReturnValue({
      query: jest.fn(),
      transaction: jest.fn().mockReturnThis(), // For handling transaction start, commit, and rollback
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("insertUser", () => {
    it("should insert a user and return the user data", async () => {
      const mockUser = { username: "john", password_hash: "hashedpwd123" };
      const mockResult = { rows: [mockUser] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await UserData.insertUser("john", "hashedpwd123");
      expect(result).toEqual({ statusCode: 201, data: mockUser });
    });

    it("should handle database errors during user insertion", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Database error"));
      await expect(UserData.insertUser("john", "hashedpwd123"))
        .rejects
        .toThrow("Error inserting user");
    });
  });

  describe("getUserByUsername", () => {
    it("should return user data if the user exists", async () => {
      const mockUser = { username: "john" };
      const mockResult = { rows: [mockUser] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await UserData.getUserByUsername("john");
      expect(result).toEqual({ statusCode: 200, data: mockUser });
    });

    it("should return 400 if no user is found", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await UserData.getUserByUsername("john");
      expect(result).toEqual({ statusCode: 400, data: null });
    });

    it("should handle errors when fetching user by username", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Database error"));
      await expect(UserData.getUserByUsername("john"))
        .rejects
        .toThrow("Error selecting user by username");
    });
  });

  describe("changeAcknowledgeStatus", () => {
    it("should update acknowledge status successfully", async () => {
      DatabaseManager.getDb().query.mockResolvedValue();

      const result = await UserData.changeAcknowledgeStatus(1);
      expect(result).toEqual({ statusCode: 200, message: "User updated" });
    });

    it("should handle errors during status update", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Database error"));
      await expect(UserData.changeAcknowledgeStatus(1))
        .rejects
        .toThrow("Error updating user: Database error");
    });
  });

  describe("updateUserProfile", () => {
    it("should update a user profile and return the updated data", async () => {
      const mockUser = { gender: "male", phone_number: "1234567890" };
      const mockResult = { rows: [mockUser] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await UserData.updateUserProfile("male", "1234567890", "john");
      expect(result).toEqual({ statusCode: 200, data: mockUser });
    });
  });

  describe("getAllUserInfo", () => {

    it("should return all user info", async () => {
      const mockResult = { rows: [{ user_id: 1, username: "john", privilege_level: 1, account_status: 1 }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await UserData.getAllUserInfo();
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

  });

});
