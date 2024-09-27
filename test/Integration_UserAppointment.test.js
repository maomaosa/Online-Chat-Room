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
  TRUNCATE TABLE esn_appointment RESTART IDENTITY CASCADE;
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

test("Succeed: schedule appointment", async () => {
  const response = await agent.post("/users").send(maomao);

  const appointment = {
    time: "12:00-14:00 01/Jan/2024",
    receiver_id: 1,
    receivee_id: 2,
  };
  const scheduleAppointmentResponse = await agent
    .post("/userProfileAppointments")
    .send(appointment)
    .set("Cookie", "token=" + response.body.token);
  expect(scheduleAppointmentResponse.status).toBe(201);
});

test("Fail: schedule appointment", async () => {
  const response = await agent.post("/users").send(maomao);

  const appointment = {
    time: "12:00-14:00",
    receiver_id: 1,
    receivee_id: 2,
  };
  const scheduleAppointmentResponse = await agent
    .post("/userProfileAppointments")
    .send(appointment)
    .set("Cookie", "token=" + response.body.token);
  expect(scheduleAppointmentResponse.status).toBe(400);
  expect(scheduleAppointmentResponse.text).toBe("format not match");
});
