import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import { Server as SocketIOServer } from "socket.io";
const io = new SocketIOServer(httpServer);
import supertest from "supertest";
const agent = supertest(app);
const maomao = {
  username: "maomao",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
};
const pongki = {
  username: "pongki",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
  user_id: "4",
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
  TRUNCATE TABLE esn_user_profession_profile RESTART IDENTITY CASCADE;

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

test("Succeed: get files by job type", async () => {
  const response = await agent.post("/users").send(maomao);

  const Nresponse = await agent
    .get("/userProfiles/jobType/0")
    .set("Cookie", "token=" + response.body.token);
  expect(Nresponse.status).toBe(200);
  expect(Nresponse.body.jobType).toBe("Null");

  const Docresponse = await agent
    .get("/userProfiles/jobType/1")
    .set("Cookie", "token=" + response.body.token);
  expect(Docresponse.status).toBe(200);
  expect(Docresponse.body.jobType).toBe("Doctor");

  const Denresponse = await agent
    .get("/userProfiles/jobType/2")
    .set("Cookie", "token=" + response.body.token);
  expect(Denresponse.status).toBe(200);
  expect(Denresponse.body.jobType).toBe("Dentist");

  const Nurresponse = await agent
    .get("/userProfiles/jobType/3")
    .set("Cookie", "token=" + response.body.token);
  expect(Nurresponse.status).toBe(200);
  expect(Nurresponse.body.jobType).toBe("Nurse");

  const Psyresponse = await agent
    .get("/userProfiles/jobType/4")
    .set("Cookie", "token=" + response.body.token);
  expect(Psyresponse.status).toBe(200);
  expect(Psyresponse.body.jobType).toBe("Psychologist");

  const Polresponse = await agent
    .get("/userProfiles/jobType/5")
    .set("Cookie", "token=" + response.body.token);
  expect(Polresponse.status).toBe(200);
  expect(Polresponse.body.jobType).toBe("Police");

  const FFresponse = await agent
    .get("/userProfiles/jobType/6")
    .set("Cookie", "token=" + response.body.token);
  expect(FFresponse.status).toBe(200);
  expect(FFresponse.body.jobType).toBe("FireFighter");
});

test("Fail: get files by invalid job type", async () => {
  const response = await agent.post("/users").send(maomao);
  const jobType = 21;

  const response2 = await agent
    .get(`/userProfiles/jobType/${jobType}`)
    .set("Cookie", "token=" + response.body.token);
  expect(response2.status).toBe(400);
  expect(response2.text).toBe("Invalid jobType");
});

test("Fail: post invalid files", async () => {
  const response = await agent.post("/users").send(maomao);

  const profileData = {
    id: 1,
  };

  const postProfileResponse = await agent
    .post("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(postProfileResponse.status).toBe(400);

  expect(postProfileResponse.text).toBe("null user_id");
});

test("Succeed: post files to profile wall", async () => {
  const response = await agent.post("/users").send(maomao);

  const profileData = {
    id: 1,
    user_id: "1",
    job_type: 1,
    message_content: "Hello",
    isposted: true,
  };

  const response2 = await agent
    .post("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(response2.status).toBe(201);

  expect(response.body.user_id).toBe(1);

  const getProfileResponse = await agent
    .get("/userProfiles/maomao")
    .set("Cookie", "token=" + response.body.token);
  expect(getProfileResponse.status).toBe(200);
  expect(response.body.username).toBe("maomao");
});

test("Fail: delete files from profile wall not current user", async () => {
  const response = await agent.post("/users").send(pongki);

  const profileData = {
    user_id: "2",
  };

  const response2 = await agent
    .delete("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(response2.status).toBe(400);

  expect(response.body.user_id).toBe(1);
});

test("Succeed: delete files from profile wall", async () => {
  const response = await agent.post("/users").send(pongki);

  const profileData = {
    id: 1,
    user_id: "1",
    job_type: 1,
    message_content: "Hello",
    isposted: true,
  };

  const postResponse = await agent
    .post("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(postResponse.status).toBe(201);

  const deleteResponse = await agent
    .delete("/userProfiles/currentUser")
    .send({ userId: 1 })
    .set("Cookie", "token=" + response.body.token);
  expect(deleteResponse.status).toBe(200);

  expect(deleteResponse.body.message).toBe("Profile deleted successfully");
});

test("Succeed: update files from profile wall", async () => {
  const response = await agent.post("/users").send(maomao);

  const profileData = {
    id: 1,
    user_id: "1",
    job_type: 3,
    message_content: "Hello",
  };

  const response2 = await agent
    .put("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(response2.status).toBe(200);

  expect(response2.body.user_id).toBe(1);

  const anotherUpdateResponse = await agent
    .put("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(anotherUpdateResponse.status).toBe(200);

  expect(anotherUpdateResponse.body.user_id).toBe(1);
});
test("update files from profile wall without user", async () => {
  const response = await agent.post("/users").send(maomao);

  const profileData = {
    id: 1,
    user_id: null,
    job_type: 3,
    message_content: "Hello",
  };

  const response2 = await agent
    .put("/userProfiles/currentUser")
    .send(profileData)
    .set("Cookie", "token=" + response.body.token);
  expect(response2.status).toBe(400);

  expect(response.body.user_id).toBe(1);
});
