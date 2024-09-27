import MessageData from "../Backend/model/MessageData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("MessageData", () => {
  beforeEach(() => {
    DatabaseManager.getDb.mockReturnValue({
      query: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("insertMessage", () => {
    const message = {
      senderId: 1,
      receiverId: 2,
      content: "Hello, World!",
      messageStatus: "sent",
      timestamp: new Date(),
      isRead: false,
      type: "text"
    };

    it("should successfully insert a message", async () => {
      const mockResult = { rows: [message] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await MessageData.insertMessage(message);
      expect(result).toEqual({ statusCode: 201, data: message });
    });

    it("should handle errors during insertion", async () => {
      const errorMessage = "Insertion error";
      DatabaseManager.getDb().query.mockRejectedValue(new Error(errorMessage));

      await expect(MessageData.insertMessage(message))
        .rejects
        .toThrow(`Error inserting message: ${errorMessage}`);
    });

    describe("getMessagesByType", () => {
        const messageType = "public";
        const filteredPublicMessageContent = "hello";
    
        it("should retrieve public messages of a specific type", async () => {
          const mockResult = { rows: [{ id: 1, content: "Hello, public!" }] };
          DatabaseManager.getDb().query.mockResolvedValue(mockResult);
    
          const result = await MessageData.getMessagesByType(filteredPublicMessageContent, messageType);
          expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
        });
    
        it("should handle errors when retrieving messages", async () => {
          const errorMessage = "Retrieval error";
          DatabaseManager.getDb().query.mockRejectedValue(new Error(errorMessage));
    
          await expect(MessageData.getMessagesByType(filteredPublicMessageContent, messageType))
            .rejects
            .toThrow(`Error getting messages: ${errorMessage}`);
        });
      });
    
  });

  describe("getMessagesBetween", () => {
    const p1 = 1;
    const p2 = 2;
    const filteredPrivateMessageContent = "secret";

    it("should retrieve messages between two users", async () => {
      const mockResult = { rows: [{ id: 1, content: "Secret message" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await MessageData.getMessagesBetween(p1, p2, filteredPrivateMessageContent);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

    it("should handle errors during retrieval between users", async () => {
      const errorMessage = "Retrieval error between users";
      DatabaseManager.getDb().query.mockRejectedValue(new Error(errorMessage));

      await expect(MessageData.getMessagesBetween(p1, p2, filteredPrivateMessageContent))
        .rejects
        .toThrow(`Error getting messages between users: ${errorMessage}`);
    });
  });

  describe("updateMessagesReadBetween", () => {
    const receiverId = 1;
    const senderId = 2;

    it("should update messages as read between two users", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await MessageData.updateMessagesReadBetween(receiverId, senderId);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

    it("should handle errors during updating messages as read", async () => {
      const errorMessage = "Update error";
      DatabaseManager.getDb().query.mockRejectedValue(new Error(errorMessage));

      await expect(MessageData.updateMessagesReadBetween(receiverId, senderId))
        .rejects
        .toThrow("Error updating messages: Update error");
    });
  });

  describe("getUserUnreadMessages", () => {
    const userId = 1;

    it("should retrieve unread messages for a user", async () => {
      const mockResult = { rows: [{ id: 1, content: "Unread message" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await MessageData.getUserUnreadMessages(userId);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

    it("should handle errors during retrieval of unread messages", async () => {
      const errorMessage = "Retrieval error";
      DatabaseManager.getDb().query.mockRejectedValue(new Error(errorMessage));

      await expect(MessageData.getUserUnreadMessages(userId))
        .rejects
        .toThrow(`Error fetching unread messages: ${errorMessage}`);
    });
  });



});
