import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import UserService from "../Backend/service/userService.js";
import SpeedTestService from "../Backend/service/speedTestService.js";
import UserData from "../Backend/model/UserData.js";

import { Server as SocketIOServer } from "socket.io";

import supertest from "supertest";
const agent = supertest(app);
let user1LoginResponse;
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
  user1LoginResponse = await agent.put("/users/online").send(admin);

  SpeedTestService.performanceTestRunning = false;
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

test("Succeed: tests for user register", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);
});

test("Fail: tests for existing user register", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const reregisterResponse = await agent.post("/users").send(maomao);
  expect(reregisterResponse.status).toBe(400);
  expect(reregisterResponse.text).toBe("User already exists");
});

test("Succeed: tests for user login", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const logoutresponse = await agent.put("/users/online").send(maomao);
  expect(logoutresponse.status).toBe(200);
});

test("Fail: tests for user login with wrong password", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const tempUserInfo = {
    username: "maomao",
    passwordHash: "",
    isRelogin: false,
  };
  const logoutresponse = await agent.put("/users/online").send(tempUserInfo);
  expect(logoutresponse.status).toBe(200);
});

test("Succeed: tests for user logout", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const logoutresponse = await agent
    .put("/users/currentUser/offline")
    .set("Cookie", "token=" + response.body.token);
  expect(logoutresponse.status).toBe(200);
  expect(logoutresponse.text).toBe("succeed");
});

test("Succeed: tests for getting user info", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const gettingResponse = await agent.get("/users/maomao");
  expect(gettingResponse.status).toBe(200);
  expect(gettingResponse.body.data.username).toBe("maomao");
});

test("Succeed: tests for getting current user info", async () => {
  //user register (set share status)
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  UserService.socket = {
    join(username) {},
  };
  const getCurrentUserInfoResponse = await agent
    .get("/users/currentUser/info")
    .set("Cookie", "token=" + response.body.token);
  expect(getCurrentUserInfoResponse.status).toBe(200);
  expect(getCurrentUserInfoResponse.body.username).toBe("maomao");
});

test("Succeed: tests for updating user profile", async () => {
  const updatedUserProfile = {
    username: "maomao",
    gender: 2,
    phoneNumber: "6666666666",
  };
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const updateResponse = await agent
    .put("/users/profiles")
    .set("Cookie", "token=" + user1LoginResponse.body.token)
    .send(updatedUserProfile);
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.phone_number).toBe("6666666666");
});

test("Fail: tests for updating user profile invalid phone number", async () => {
  const updatedUserProfile = {
    username: "maomao",
    gender: 2,
    phoneNumber: "66666",
  };

  const updateResponse = await agent
    .put("/users/profiles")
    .set("Cookie", "token=" + user1LoginResponse.body.token)
    .send(updatedUserProfile);
  expect(updateResponse.status).toBe(400);
  expect(updateResponse.text).toBe("Phone number must be 10 digits.");
});

test("Succeed: tests for changing user acknowledge status", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);
  expect(response.body.share_status).toBe(0);

  const updateResponse = await agent
    .put("/users/currentUser/acknowledgeStatus")
    .set("Cookie", "token=" + response.body.token)
    .send(response.body.id);
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.user_id).toBe(2);
});

test("Succeed: tests for getting all user info", async () => {
  const gettingResponse = await agent
    .get("/users/profiles")
    .set("Cookie", "token=" + user1LoginResponse.body.token);
  expect(gettingResponse.status).toBe(200);
});

test("Fail: tests for user register during speed test", async () => {
  SpeedTestService.performanceTestRunning = true;
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(401);
  expect(response.text).toBe("Speed test is running. You cannot register.");
});

test("Fail: tests for user login during speed test", async () => {
  SpeedTestService.performanceTestRunning = true;
  const response = await agent.put("/users/online").send(maomao);
  expect(response.status).toBe(400);
  expect(response.text).toBe("Speed test is running. You cannot login.");
});

test("Fail: tests for getting user info during speed test", async () => {
  SpeedTestService.performanceTestRunning = true;
  const gettingresponse = await agent.get("/users/maomao");
  expect(gettingresponse.status).toBe(401);
  expect(gettingresponse.text).toBe("Speed test is running.");
});

test("Fail: update user profile without admin in system", async () => {
  const loginResponse = await agent.put("/users/online").send(admin);

  const updateUserInfo = {
    user_id: 1,
    username: "ESNAdmin",
    passwordHash: "b0baee9d279d34fa1dfd71aadb908222",
    privilege_level: 1,
    account_status: 1,
  };
  const updateResponse = await agent
    .put("/users/userId")
    .set("Cookie", "token=" + loginResponse.body.token)
    .send(updateUserInfo);
  expect(updateResponse.status).toBe(451);
});
