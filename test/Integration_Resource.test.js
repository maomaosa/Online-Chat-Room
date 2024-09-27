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
  TRUNCATE TABLE esn_resource RESTART IDENTITY CASCADE;
  TRUNCATE TABLE esn_resource_request RESTART IDENTITY CASCADE;

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

const maomao2 = {
  username: "maomao2",
  passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
};

const newResource1 = {
  type: 1,
  title: "High-Quality Office Chairs",
  content:
    "we have several high-quality, ergonomic office chairs that are no longer needed. These chairs are designed to provide excellent support during long working hours, featuring adjustable heights. They’re in excellent condition and would be a perfect fit for any startup, small business, or home o!ce looking to enhance workspace.",
  address: {
    longitude: -6.236688,
    latitude: 53.339688,
  },
  amount: 1,
};

const newResource2 = {
  type: 3,
  title: "Unused Kettle",
  content:
    "I recently purchased a new electric kettle, making these two spare kettles unnecessary. They works perfectly, boils water quickly, and are ideal for everyday use, whether it's for making tea, coffee, or cooking noodles.",
  address: {
    longitude: -6.236688,
    latitude: 53.339688,
  },
  amount: 2,
};

const resourceRequest1 = {
  resourceId: 1,
  amount: 1,
};

const resourceRequest2 = {
  resourceId: 1,
  amount: 1,
};

test("non-state-updating integration tests for post resource", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.status).toBe(201);

  const addResourceResponse = await agent
    .post("/resources/")
    .send(newResource1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);
  expect(addResourceResponse.body.title).toBe("High-Quality Office Chairs");
});

test("state-updating integration tests for delete resource", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resources/")
    .send(newResource1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);
  const resourceId = addResourceResponse.body.id;

  const deleteResourceNotExistResponse = await agent
    .delete(`/resources/66`)
    .set("Cookie", "token=" + response.body.token);
  expect(deleteResourceNotExistResponse.status).toBe(404);

  const deleteResourceResponse = await agent
    .delete(`/resources/${resourceId}`)
    .set("Cookie", "token=" + response.body.token);
  expect(deleteResourceResponse.status).toBe(200);
  expect(deleteResourceResponse.body.title).toBe("High-Quality Office Chairs");
});

test("state-updating integration tests for getting resources", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resources/")
    .send(newResource1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);

  const addResource2Response = await agent
    .post("/resources/")
    .send(newResource2)
    .set("Cookie", "token=" + response.body.token);
  expect(addResource2Response.status).toBe(201);

  const getResourceListResponse = await agent
    .get("/resources/")
    .set("Cookie", "token=" + response.body.token);
  expect(getResourceListResponse.status).toBe(200);
  expect(getResourceListResponse.body.data.length).toBe(2);
});

test("state-updating integration tests for getting current user resources", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resources/")
    .send(newResource1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);

  const response2 = await agent.post("/users").send(maomao2);
  expect(response2.body.share_status).toBe(0);
  const addResource2Response = await agent
    .post("/resources/")
    .send(newResource2)
    .set("Cookie", "token=" + response2.body.token);
  expect(addResource2Response.status).toBe(201);

  const getResourceListResponse = await agent
    .get("/resources/currentUser")
    .set("Cookie", "token=" + response.body.token);
  expect(getResourceListResponse.status).toBe(200);
  expect(getResourceListResponse.body.length).toBe(1);
});

test("state-updating integration tests for post resource request", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resourceRequests/")
    .send(resourceRequest1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);
  expect(addResourceResponse.body.resource_id).toBe(1);
});

test("state-updating integration tests for getting current user resource request", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resourceRequests/")
    .send(resourceRequest1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);

  const addResourceResponse2 = await agent
    .post("/resourceRequests/")
    .send(resourceRequest2)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse2.status).toBe(201);

  const getResourceResponse = await agent
    .get("/resourceRequests/currentUser")
    .set("Cookie", "token=" + response.body.token);
  expect(getResourceResponse.status).toBe(200);
  expect(getResourceResponse.body.length).toBe(2);
});

test("state-updating integration tests for changing resource request status", async () => {
  const response = await agent.post("/users").send(maomao);
  expect(response.body.share_status).toBe(0);

  const addResourceResponse = await agent
    .post("/resourceRequests/")
    .send(resourceRequest1)
    .set("Cookie", "token=" + response.body.token);
  expect(addResourceResponse.status).toBe(201);
  expect(addResourceResponse.body.status).toBe(0);

  const updateResourceResponse = await agent
    .put(`/resourceRequests/${addResourceResponse.body.id}/status/2`)
    .set("Cookie", "token=" + response.body.token);
  expect(updateResourceResponse.status).toBe(200);
  expect(updateResourceResponse.body.status).toBe(2);
});
