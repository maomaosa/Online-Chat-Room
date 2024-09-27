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

const maomao = {
  username: "maomao",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
};

test("non-state-updating integration tests for share status checking", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);
});

test("state-updating integration tests for share status updating", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const changeStatus = await agent
    .put("/shareStatuses/currentUser")
    .send({ status: 1 })
    .set("Cookie", "token=" + response.body.token);
  expect(changeStatus.body.share_status).toBe(1);
});
