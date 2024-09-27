import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";

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

test("Succeed: tests for getting esn directory", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const updateResponse = await agent
    .get("/directories/")
    .set("Cookie", "token=" + response.body.token);
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.length).toBe(2);
});

test("Succeed: tests for getting filtered esn directory by username", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const updateResponse = await agent
    .get("/directories/criteriaType/username/criteriaContent/mao")
    .set("Cookie", "token=" + response.body.token);
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.length).toBe(1);
});

test("Succeed: tests for getting filtered esn directory by username", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const updateResponse = await agent
    .get("/directories/criteriaType/shareStatus/criteriaContent/1")
    .set("Cookie", "token=" + response.body.token);
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.length).toBe(0);
});
