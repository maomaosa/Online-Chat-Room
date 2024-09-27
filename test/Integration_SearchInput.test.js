import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import { Server as SocketIOServer } from "socket.io";
const io = new SocketIOServer(httpServer);

import supertest from "supertest";
let user1LoginResponse;

const agent = supertest(app);
const admin = {
  username: "ESNAdmin",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
};
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

  INSERT INTO esn_user (username, password_hash, acknowledge_status, privilege_level) VALUES ('ESNAdmin', 'b0baee9d279d34fa1dfd71aadb908c3f', 1, 2);    
  INSERT INTO esn_directory (user_id, username, online_status) VALUES (1, 'ESNAdmin', 0);    COMMIT;

  COMMIT;
  `;
  await DatabaseManager.db.query(resetQuery);

  user1LoginResponse = await agent.put("/users/online").send(admin);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await redisClient.quit();
  await userRedisClient.quit();
  await httpServer.close();
});

const maomao2 = { username: "maomao2", passwordHash: "maomao2" };

test("Succeed: filtered public message", async () => {
  const message1 = {
    content: "mss1",
    messageStatus: 0,
  };
  const message2 = {
    content: "ms2",
    messageStatus: 0,
  };
  const message1Response = await agent
    .post("/messages/public")
    .send(message1)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message1Response.status).toBe(201);
  const message2Response = await agent
    .post("/messages/public")
    .send(message2)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message2Response.status).toBe(201);

  const getAllPublicMessageResponse = await agent
    .get("/messages/public")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(getAllPublicMessageResponse.status).toBe(200);
  expect(getAllPublicMessageResponse.body.length).toBe(2);

  const searchSelectedPublicMessageResponse = await agent
    .get("/messages/public/criteriaContent/mss")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(searchSelectedPublicMessageResponse.status).toBe(200);
  expect(searchSelectedPublicMessageResponse.body.length).toBe(1);
});

test("Fail: filtered public message with banned word", async () => {
  const searchSelectedPublicMessageResponse = await agent
    .get("/messages/public/criteriaContent/able")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(searchSelectedPublicMessageResponse.status).toBe(200);
  expect(searchSelectedPublicMessageResponse.text).toBe(
    "Searching Word is banned!"
  );
});

test("Succeed: filtered private message", async () => {
  const user2RegisterResponse = await agent.post("/users").send(maomao2);
  expect(user2RegisterResponse.status).toBe(201);

  const message1 = {
    content: "mss1",
    messageStatus: 0,
    receiverId: 2,
    receiverUsername: "maomao2",
  };

  const message2 = {
    content: "ms2",
    messageStatus: 0,
    receiverId: 2,
    receiverUsername: "maomao2",
  };

  const messageResponse = await agent
    .post("/messages/private")
    .send(message1)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(messageResponse.status).toBe(201);

  const message2Response = await agent
    .post("/messages/private")
    .send(message2)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message2Response.status).toBe(201);

  const getAllPrivateMessagesResponse = await agent
    .get("/messages/private/1/")
    .set("Cookie", "token=" + user2RegisterResponse.body.token);
  expect(getAllPrivateMessagesResponse.status).toBe(200);
  expect(getAllPrivateMessagesResponse.body.length).toBe(2);

  const getUnreadPrivateMessagesResponse = await agent
    .get("/messages/unread")
    .set("Cookie", "token=" + user2RegisterResponse.body.token);
  expect(getUnreadPrivateMessagesResponse.status).toBe(200);
  expect(getUnreadPrivateMessagesResponse.body.length).toBe(0);

  const searchSelectedPrivateMessageResponse = await agent
    .get("/messages/private/1/criteriaContent/mss")
    .set("Cookie", "token=" + user2RegisterResponse.body.token);
  expect(searchSelectedPrivateMessageResponse.status).toBe(200);
  expect(searchSelectedPrivateMessageResponse.body.length).toBe(1);
});

test("Fail: filtered private message with banned word", async () => {
  const searchSelectedPrivateMessageResponse = await agent
    .get("/messages/private/1/criteriaContent/able")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(searchSelectedPrivateMessageResponse.status).toBe(200);
  expect(searchSelectedPrivateMessageResponse.text).toBe(
    "Searching Word is banned!"
  );
});

test("Succeed: filtered announcement", async () => {
  const message1 = {
    content: "mss1",
  };
  const message2 = {
    content: "mss2",
  };
  const message3 = {
    content: "ms3",
  };
  const message1Response = await agent
    .post("/messages/announcement")
    .send(message1)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message1Response.status).toBe(201);
  const message2Response = await agent
    .post("/messages/announcement")
    .send(message2)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message2Response.status).toBe(201);
  const message3Response = await agent
    .post("/messages/announcement")
    .send(message3)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(message3Response.status).toBe(201);

  const getAllAnnouncementResponse = await agent
    .get("/messages/announcement")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(getAllAnnouncementResponse.status).toBe(200);
  expect(getAllAnnouncementResponse.body.length).toBe(3);

  const searchSelectedAnnouncementResponse = await agent
    .get("/messages/announcement/criteriaContent/mss")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(searchSelectedAnnouncementResponse.status).toBe(200);
  expect(searchSelectedAnnouncementResponse.body.length).toBe(2);
});

test("Fail: filtered announcement with banned word", async () => {
  const searchSelectedAnnouncementResponse = await agent
    .get("/messages/announcement/criteriaContent/able")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(searchSelectedAnnouncementResponse.status).toBe(200);
  expect(searchSelectedAnnouncementResponse.text).toBe(
    "Searching Word is banned!"
  );
});
