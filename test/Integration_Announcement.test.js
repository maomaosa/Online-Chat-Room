import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import { Server as SocketIOServer } from "socket.io";
const io = new SocketIOServer(httpServer);

import supertest from "supertest";
const agent = supertest(app);
let user1LoginResponse;
const admin = {
  username: "ESNAdmin",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
};
const announcementContent = {
  content: "announcement",
  messageStatus: 0,
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

  await agent
    .post("/messages/announcement")
    .send(announcementContent)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await redisClient.quit();
  await userRedisClient.quit();
  await httpServer.close();
});

test("state-updating integration tests for post announcement checking", async () => {
  const announcement = {
    content: "announcement",
    messageStatus: 0,
  };
  const announcementResponse = await agent
    .post("/messages/announcement")
    .send(announcement)
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(announcementResponse.status).toBe(201);
  expect(announcementResponse.body.content).toBe("announcement");

  //check if announcement is posted
  const getAnnouncementsResponse = await agent
    .get("/messages/announcement")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(getAnnouncementsResponse.status).toBe(200);
  expect(getAnnouncementsResponse.body[1].content).toBe("announcement");
});

test("non-state-updating integration tests for announcement checking", async () => {
  //check if there is an announcement
  const getAnnouncementsResponse = await agent
    .get("/messages/announcement")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(getAnnouncementsResponse.status).toBe(200);
  expect(getAnnouncementsResponse.body[0].content).toBe("announcement");
});
