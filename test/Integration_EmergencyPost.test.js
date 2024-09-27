import DatabaseManager from "../Backend/data/DatabaseManager.js";
import { app, httpServer, ioSettings } from "../Backend/app.js";
import { redisClient } from "../Backend/util/middleware.js";
import { userRedisClient } from "../Backend/service/userService.js";
import { Server as SocketIOServer } from "socket.io";
import EmergencyPostService from "../Backend/service/emergencyPostService.js";
const io = new SocketIOServer(httpServer);
import supertest from "supertest";
const agent = supertest(app);

const maomao = { username: "maomao", passwordHash: "maomao" };
const maomao2 = { username: "maomao2", passwordHash: "maomao2" };
let user1RegisterResponse;

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
        TRUNCATE TABLE esn_emergency_post RESTART IDENTITY CASCADE;
        TRUNCATE TABLE esn_post_comment RESTART IDENTITY CASCADE;
        TRUNCATE TABLE esn_post_cleared RESTART IDENTITY CASCADE;
        TRUNCATE TABLE esn_post_can_help RESTART IDENTITY CASCADE;
    
        COMMIT;
    `;
  await DatabaseManager.db.query(resetQuery);

  //user1 register
  user1RegisterResponse = await agent.post("/users").send(maomao);

  //post a new post
  const emergencyPostContent = {
    type: "test",
    title: "test",
    address: "123st",
    content: "test content",
    fileurl: "123.com",
  };
  const postEmergencyPostResponse = await agent
    .post("/emergencyposts")
    .send(emergencyPostContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  const commentContent = {
    content: "test comment",
    postid: 1,
  };
  const postCommentResponse = await agent
    .post(`/emergencyposts/${1}/comments`)
    .send(commentContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await redisClient.quit();
  await userRedisClient.quit();
  await httpServer.close();
});

test("state-updating integration tests for publish an emergency post", async () => {
  const emergencyPostContent = {
    type: "Natural Accident",
    title: "Urgent: Fire in Downtown",
    address: "123 Main St, Downtown",
    content: "A fire has broken out at 123 Main St. Please avoid the area.",
    fileurl: "",
  };

  const postEmergencyPostResponse = await agent
    .post("/emergencyposts")
    .send(emergencyPostContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(postEmergencyPostResponse.status).toBe(201);

  const getEmergencyPostsResponse = await agent
    .get("/emergencyposts")
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(getEmergencyPostsResponse.status).toBe(201);

  const posts = getEmergencyPostsResponse.body.data;
  expect(posts.length).toBe(2);
});

test("non-state-updating integration tests for get published post", async () => {
  const getEmergencyPostsResponse = await agent
    .get("/emergencyposts")
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(getEmergencyPostsResponse.status).toBe(201);

  const posts = getEmergencyPostsResponse.body.data;
  expect(posts.length).toBe(1);
  expect(posts[0].accident_category).toBe("test");
  expect(posts[0].title).toBe("test");
  expect(posts[0].address).toBe("123st");
  expect(posts[0].content).toBe("test content");
  expect(posts[0].picture_url).toBe("123.com");
});

test("state-updating integration tests for post a comment", async () => {
  const commentContent = {
    content: "test comment",
    postid: 1,
  };

  const postCommentResponse = await agent
    .post(`/emergencyposts/${1}/comments`)
    .send(commentContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(postCommentResponse.status).toBe(201);

  const getCommentsResponse = await agent
    .get(`/emergencyposts/${1}/comments`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(getCommentsResponse.status).toBe(201);
  expect(getCommentsResponse.body.data.length).toBe(2);
});

test("non-state-updating integration tests for get comments", async () => {
  const getCommentsResponse = await agent
    .get(`/emergencyposts/${1}/comments`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(getCommentsResponse.status).toBe(201);
  expect(getCommentsResponse.body.data.length).toBe(1);
  expect(getCommentsResponse.body.data[0].comment_content).toBe("test comment");
});

test("non-state-updating integration tests for get single post", async () => {
  const getSingleEmergencyPostResponse = await agent
    .get(`/emergencyposts/${1}`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(getSingleEmergencyPostResponse.status).toBe(201);
  expect(getSingleEmergencyPostResponse.body.data.length).toBe(1);
  expect(getSingleEmergencyPostResponse.body.data[0].title).toBe("test");
});

test("state-updating integration tests for help a post", async () => {
  const helpEmergencyPostResponse = await agent
    .post(`/emergencyposts/${1}/help`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(helpEmergencyPostResponse.status).toBe(201);

  const getHelpListResponse = await agent
    .get(`/emergencyposts/${1}/help`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(getHelpListResponse.status).toBe(201);
  expect(getHelpListResponse.body.data.length).toBe(1);
});

test("state-updating integration tests for clear a post", async () => {
  const clearEmergencyPostResponse = await agent
    .post(`/emergencyposts/${1}/clear`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(clearEmergencyPostResponse.status).toBe(201);

  const getClearListResponse = await agent
    .get(`/emergencyposts/${1}/clear`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(getClearListResponse.status).toBe(201);
  expect(getClearListResponse.body.data.length).toBe(1);
});

test("failure to post an emergency post without a title", async () => {
  const emergencyPostContent = {
    type: "Natural Accident",
    address: "123 Main St, Downtown",
    content: "A fire has broken out at 123 Main St. Please avoid the area.",
    fileurl: "",
  };

  const postEmergencyPostResponse = await agent
    .post("/emergencyposts")
    .send(emergencyPostContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(postEmergencyPostResponse.status).toBe(400);
});

test("failure to post a comment without content", async () => {
  const commentContent = {
    postid: 1,
  };

  const postCommentResponse = await agent
    .post(`/emergencyposts/${1}/comments`)
    .send(commentContent)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);

  expect(postCommentResponse.status).toBe(400);
});

test("Succeed: delete help", async () => {
  const helpEmergencyPostResponse = await agent
    .post(`/emergencyposts/${1}/help`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(helpEmergencyPostResponse.status).toBe(201);

  const deleteHelpEmergencyPostResponse = await agent
    .delete(`/emergencyposts/${1}/help`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(deleteHelpEmergencyPostResponse.status).toBe(201);
  expect(deleteHelpEmergencyPostResponse.text).toBe(`${1}`);
});

test("Succeed: delete clear", async () => {
  const clearEmergencyPostResponse = await agent
    .post(`/emergencyposts/${1}/clear`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(clearEmergencyPostResponse.status).toBe(201);

  const deleteClearEmergencyPostResponse = await agent
    .delete(`/emergencyposts/${1}/clear`)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(deleteClearEmergencyPostResponse.status).toBe(201);
  expect(deleteClearEmergencyPostResponse.text).toBe(`${1}`);
});

test ("Succeed: unsubscribe to certain post", async () => {
  const mockGet = jest.spyOn(EmergencyPostService.io.sockets.sockets, 'get').mockReturnValue({
    emit: jest.fn(),
    on: jest.fn(),
    id: 'mocked-socket-id',
  });

  const socketid = "mocked-socket-id";
  const body = { socketid };
  const subscribeResponse = await agent
    .put(`/emergencyposts/${1}/subscribe`)
    .send(body)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(subscribeResponse.status).toBe(201);

  const unsubscribeResponse = await agent
    .put(`/emergencyposts/${1}/unsubscribe`)
    .send(body)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(unsubscribeResponse.status).toBe(201);

  mockGet.mockRestore();
});

test ("Succeed: subscribe to certain post", async () => {
  const mockGet = jest.spyOn(EmergencyPostService.io.sockets.sockets, 'get').mockReturnValue({
    emit: jest.fn(),
    on: jest.fn(),
    id: 'mocked-socket-id',
  });

  const socketid = "mocked-socket-id";
  const body = { socketid };
  const subscribeResponse = await agent
    .put(`/emergencyposts/${1}/subscribe`)
    .send(body)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(subscribeResponse.status).toBe(201);

  mockGet.mockRestore();
});

test ("failure: subscribe to certain post with invalid socketid", async () => {
  const socketid = "fakeid";
  const body = { socketid };
  const subscribeResponse = await agent
    .put(`/emergencyposts/${1}/subscribe`)
    .send(body)
    .set("Cookie", "token=" + user1RegisterResponse.body.token);
  expect(subscribeResponse.status).toBe(400);
});
