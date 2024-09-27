import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import { Server as SocketIOServer } from "socket.io";
const io = new SocketIOServer(httpServer);

import supertest from "supertest";
const agent = supertest(app);

beforeAll(async () => {
  await DatabaseManager.connectToDatabase("esn_test");
  ioSettings();
});

beforeEach(async () => {
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
  await redisClient.quit();
  await userRedisClient.quit();
  await httpServer.close();
});

const maomao = { username: "maomao", passwordHash: "maomao" };
const maomao2 = { username: "maomao2", passwordHash: "maomao2" };

test("non-state-updating integration tests for private chat checking", async () => {
  //user1 register
  const user1RegisterResponse = await agent.post("/users").send(maomao);
  expect(user1RegisterResponse.status).toBe(201);

  const message = {
    content: "hello",
    messageStatus: 0,
    receiverId: 2,
    receiverUsername: "maomao2",
  };
  const messageResponse = await agent
    .post("/messages/private")
    .send(message)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(messageResponse.status).toBe(201);
  expect(messageResponse.body.content).toBe("hello");
});

test("non-state-updating integration tests for private chat checking", async () => {
  //user1 register
  const user1RegisterResponse = await agent.post("/users").send(maomao);
  expect(user1RegisterResponse.status).toBe(201);
  //user2 register
  const user2RegisterResponse = await agent.post("/users").send(maomao2);
  expect(user2RegisterResponse.status).toBe(201);

  //user1 send to user2
  const message = {
    content: "hello",
    messageStatus: 0,
    receiverId: 2,
    receiverUsername: "maomao2",
  };
  const messageResponse = await agent
    .post("/messages/private")
    .send(message)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(messageResponse.status).toBe(201);
  expect(messageResponse.body.content).toBe("hello");

  //user2 check messages
  const getMessageResponse = await agent
    .get("/messages/unread")
    .set("Cookie", "token=" + user2RegisterResponse.body.token);
  expect(getMessageResponse.status).toBe(200);
  expect(getMessageResponse.body[0].content).toBe("hello");
});

test("state-updating integration tests for private chat updating", async () => {
  //user1 register
  const user1RegisterResponse = await agent.post("/users").send(maomao);
  expect(user1RegisterResponse.status).toBe(201);
  //user2 register
  const user2RegisterResponse = await agent.post("/users").send(maomao2);
  expect(user2RegisterResponse.status).toBe(201);

  //user1 send to user2
  const message = {
    content: "hello",
    messageStatus: 1,
    receiverId: 2,
    receiverUsername: "maomao2",
  };
  const messageResponse = await agent
    .post("/messages/private")
    .send(message)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(messageResponse.status).toBe(201);
  expect(messageResponse.body.content).toBe("hello");

  //user2 check messages
  const getMessageResponse = await agent
    .get("/messages/private/1")
    .set("Cookie", "token=" + user2RegisterResponse.body.token);
  expect(getMessageResponse.status).toBe(200);
  expect(getMessageResponse.body[0].content).toBe("hello");
  expect(getMessageResponse.body[0].message_status).toBe(1);
});
