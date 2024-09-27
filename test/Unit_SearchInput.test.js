import DatabaseManager from "../Backend/data/DatabaseManager.js";
import MessageService from "../Backend/service/messageService.js";
import { userRedisClient } from "../Backend/service/userService.js";
import MessageData from "../Backend/model/MessageData.js";
import ESNDirectoryService from "../Backend/service/esnDirectoryService.js";
import ESNDirectoryData from "../Backend/model/ESNDirectoryData.js";

MessageData.getMessagesByType = jest.fn();
ESNDirectoryData.getESNDirectory = jest.fn();
beforeAll(async () => {
  await DatabaseManager.connectToDatabase("esn_test");
});

afterEach(async () => {
  const resetQuery = `
    BEGIN;

    TRUNCATE TABLE esn_user RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_directory RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_message RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status_history RESTART IDENTITY CASCADE;

    COMMIT;
    `;
  await DatabaseManager.db.query(resetQuery);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await userRedisClient.quit();
});

// Test cases for Stop Words Rule
test("test stop words", () => {
  const result1 = MessageService.isStopWords("because");
  expect(result1).toBe(true);
  const result2 = MessageService.isStopWords("who");
  expect(result2).toBe(true);
});

test("test stop words case sensitive", async () => {
  const result1 = MessageService.isStopWords("BecAuse");
  expect(result1).toBe(true);
  const result2 = MessageService.isStopWords("WHO");
  expect(result2).toBe(true);
});

// Test cases for Search Rule
test("test search rule public message with stop word", async () => {
  const req = {
    params: {
      criteriaContent: "who",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  await MessageService.getFilteredPublicMessages(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith("Searching Word is banned!");
});

test("test search rule public message basic case with one word", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        message_id: 84,
        sender_id: 4,
        receiver_id: 0,
        content: "mss",
        timestamp: "1711173088070",
        message_status: 1,
        is_read: 1,
        type: 0,
        sender_username: "pongki",
      },
    ],
  };
  MessageData.getMessagesByType.mockResolvedValue(response);
  const req = {
    params: {
      criteriaContent: "mss",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await MessageService.getFilteredPublicMessages(req, res);
  expect(res.status).toHaveBeenCalledWith(response.statusCode);
  expect(res.send).toHaveBeenCalledWith(response.data);
});

test("test search rule public message basic case with more words", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        message_id: 84,
        sender_id: 4,
        receiver_id: 0,
        content: "who are you",
        timestamp: "1711173088070",
        message_status: 1,
        is_read: 1,
        type: 0,
        sender_username: "pongki",
      },
    ],
  };
  MessageData.getMessagesByType.mockResolvedValue(response);
  const req = {
    params: {
      criteriaContent: "who_are_you",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await MessageService.getFilteredPublicMessages(req, res);
  expect(res.status).toHaveBeenCalledWith(response.statusCode);
  expect(res.send).toHaveBeenCalledWith(response.data);
});

test("test search rule private message with stop word", async () => {
  const req = {
    params: {
      receiverId: 2,
      userId: 4,
      criteriaContent: "who",
    },
    userInfo: {
      userId: 4,
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  await MessageService.getFilteredPrivateMessages(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith("Searching Word is banned!");
});

test("test search rule private message basic case with one word", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        message_id: 86,
        sender_id: 4,
        receiver_id: 2,
        content: "hi",
        timestamp: "1711173610232",
        message_status: 1,
        is_read: 1,
        type: 1,
        sender_username: "pongki",
      },
    ],
  };

  MessageData.getMessagesBetween = jest.fn().mockResolvedValue(response);

  const req = {
    params: {
      receiverId: 2,
      userId: 4,
      criteriaContent: "hi",
    },
    userInfo: {
      userId: 4,
    },
  };

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await MessageService.getFilteredPrivateMessages(req, res);

  expect(MessageData.getMessagesBetween).toHaveBeenCalledWith(2, 4, "hi");
  expect(res.status).toHaveBeenCalledWith(response.statusCode);
  expect(res.send).toHaveBeenCalledWith(response.data);
});

test("test search rule private message basic case with more words", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        message_id: 86,
        sender_id: 4,
        receiver_id: 2,
        content: "who are you",
        timestamp: "1711173610232",
        message_status: 1,
        is_read: 1,
        type: 1,
        sender_username: "pongki",
      },
    ],
  };

  MessageData.getMessagesBetween = jest.fn().mockResolvedValue(response);

  const req = {
    params: {
      receiverId: 2,
      userId: 4,
      criteriaContent: "who_are_you",
    },
    userInfo: {
      userId: 4,
    },
  };

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await MessageService.getFilteredPrivateMessages(req, res);

  expect(MessageData.getMessagesBetween).toHaveBeenCalledWith(
    2,
    4,
    "who are you"
  );
  expect(res.status).toHaveBeenCalledWith(response.statusCode);
  expect(res.send).toHaveBeenCalledWith(response.data);
});

test("test search rule announcement message with stop word", async () => {
  const req = {
    params: {
      criteriaContent: "who",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  await MessageService.getFilteredAnnouncement(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith("Searching Word is banned!");
});

test("test search rule announcement message basic case", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        message_id: 333,
        sender_id: 5,
        receiver_id: 0,
        content: "mss3",
        timestamp: "1711484152290",
        message_status: 0,
        is_read: 1,
        type: 2,
        sender_username: "adan",
      },
      {
        message_id: 332,
        sender_id: 5,
        receiver_id: 0,
        content: "mss2",
        timestamp: "1711484146846",
        message_status: 0,
        is_read: 1,
        type: 2,
        sender_username: "adan",
      },
      {
        message_id: 331,
        sender_id: 5,
        receiver_id: 0,
        content: "mss1",
        timestamp: "1711484145236",
        message_status: 0,
        is_read: 1,
        type: 2,
        sender_username: "adan",
      },
    ],
  };
  MessageData.getMessagesByType.mockResolvedValue(response);
  const req = {
    params: {
      criteriaContent: "mss",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await MessageService.getFilteredAnnouncement(req, res);

  expect(res.status).toHaveBeenCalledWith(response.statusCode);
  expect(res.send).toHaveBeenCalledWith(response.data);
});

test("test search rule esn directory basic case with username", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        id: 26,
        user_id: 26,
        username: "aa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 25,
        user_id: 25,
        username: "aaj",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 21,
        user_id: 21,
        username: "aaron2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 23,
        user_id: 23,
        username: "aaron3",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 5,
        user_id: 5,
        username: "adan",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 28,
        user_id: 28,
        username: "adult",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 12,
        user_id: 12,
        username: "buckytest",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 14,
        user_id: 14,
        username: "hjl",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 15,
        user_id: 15,
        username: "lvcha",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 1,
        user_id: 1,
        username: "maomao",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 19,
        user_id: 19,
        username: "maomaosa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 22,
        user_id: 22,
        username: "maomaosa2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 29,
        user_id: 29,
        username: "te",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 27,
        user_id: 27,
        username: "test",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 17,
        user_id: 17,
        username: "yhx",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 24,
        user_id: 24,
        username: "aaron1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 16,
        user_id: 16,
        username: "hongcha",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 20,
        user_id: 20,
        username: "maomaosa1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 11,
        user_id: 11,
        username: "test-this",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 3,
        user_id: 3,
        username: "xuzhongyu",
        online_status: 0,
        share_status: 0,
      },
    ],
  };
  ESNDirectoryData.getESNDirectory.mockResolvedValue(response);
  const req = {
    params: {
      criteriaType: "Username",
      criteriaContent: "xuzhongyu",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await ESNDirectoryService.getFilteredESNDirectory(req, res);

  expect(res.status).toHaveBeenCalledWith(response.statusCode);
});
test("test search rule esn directory basic case with part of username", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        id: 26,
        user_id: 26,
        username: "aa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 25,
        user_id: 25,
        username: "aaj",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 21,
        user_id: 21,
        username: "aaron2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 23,
        user_id: 23,
        username: "aaron3",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 5,
        user_id: 5,
        username: "adan",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 28,
        user_id: 28,
        username: "adult",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 12,
        user_id: 12,
        username: "buckytest",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 14,
        user_id: 14,
        username: "hjl",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 15,
        user_id: 15,
        username: "lvcha",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 1,
        user_id: 1,
        username: "maomao",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 19,
        user_id: 19,
        username: "maomaosa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 22,
        user_id: 22,
        username: "maomaosa2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 29,
        user_id: 29,
        username: "te",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 27,
        user_id: 27,
        username: "test",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 17,
        user_id: 17,
        username: "yhx",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 24,
        user_id: 24,
        username: "aaron1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 16,
        user_id: 16,
        username: "hongcha",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 20,
        user_id: 20,
        username: "maomaosa1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 11,
        user_id: 11,
        username: "test-this",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 3,
        user_id: 3,
        username: "xuzhongyu",
        online_status: 0,
        share_status: 0,
      },
    ],
  };
  ESNDirectoryData.getESNDirectory.mockResolvedValue(response);
  const req = {
    params: {
      criteriaType: "Username",
      criteriaContent: "aar",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await ESNDirectoryService.getFilteredESNDirectory(req, res);

  expect(res.status).toHaveBeenCalledWith(response.statusCode);
});

test("test search rule esn directory basic case with shareStatus", async () => {
  const response = {
    statusCode: 200,
    data: [
      {
        id: 26,
        user_id: 26,
        username: "aa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 25,
        user_id: 25,
        username: "aaj",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 21,
        user_id: 21,
        username: "aaron2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 23,
        user_id: 23,
        username: "aaron3",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 5,
        user_id: 5,
        username: "adan",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 28,
        user_id: 28,
        username: "adult",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 12,
        user_id: 12,
        username: "buckytest",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 14,
        user_id: 14,
        username: "hjl",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 15,
        user_id: 15,
        username: "lvcha",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 1,
        user_id: 1,
        username: "maomao",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 19,
        user_id: 19,
        username: "maomaosa",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 22,
        user_id: 22,
        username: "maomaosa2",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 29,
        user_id: 29,
        username: "te",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 27,
        user_id: 27,
        username: "test",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 17,
        user_id: 17,
        username: "yhx",
        online_status: 1,
        share_status: 0,
      },
      {
        id: 24,
        user_id: 24,
        username: "aaron1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 16,
        user_id: 16,
        username: "hongcha",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 20,
        user_id: 20,
        username: "maomaosa1",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 11,
        user_id: 11,
        username: "test-this",
        online_status: 0,
        share_status: 0,
      },
      {
        id: 3,
        user_id: 3,
        username: "xuzhongyu",
        online_status: 0,
        share_status: 0,
      },
    ],
  };
  ESNDirectoryData.getESNDirectory.mockResolvedValue(response);
  const req = {
    params: {
      criteriaType: "shareStatus",
      criteriaContent: "ok",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  await ESNDirectoryService.getFilteredESNDirectory(req, res);

  expect(res.status).toHaveBeenCalledWith(response.statusCode);
});
