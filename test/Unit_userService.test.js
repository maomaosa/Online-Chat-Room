import DatabaseManager from "../Backend/data/DatabaseManager.js";
import UserService from "../Backend/service/userService.js";
import UserData from "../Backend/model/UserData.js";
import { userRedisClient } from "../Backend/service/userService.js";

UserService.generateJWTToken = jest.fn();
UserData.getUserByUsername = jest.fn();
UserService.updateESNDirectoryOnline = jest.fn();

beforeAll(async () => {});

beforeEach(async () => {});

afterAll(async () => {
  await userRedisClient.quit();
  jest.clearAllMocks();
});

test("Successful login with acknowledged user", async () => {
  UserData.getUserByUsername.mockResolvedValue({
    statusCode: 200,
    data: {
      username: "maomao",
      password_hash: "b0baee9d279d34fa1dfd71aadb908c3f",
    },
  });
  UserService.generateJWTToken.mockReturnValue("fakeToken");
  UserService.updateESNDirectoryOnline.mockResolvedValue({ statusCode: 200 });

  const req = {
    body: {
      username: "maomao",
      passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn(),
  };
  await UserService.login(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
});

test("Unsuccessful login with user not found", async () => {
  UserData.getUserByUsername.mockResolvedValue({
    statusCode: 400,
    data: null,
  });
  UserService.generateJWTToken.mockReturnValue("fakeToken");
  UserService.updateESNDirectoryOnline.mockResolvedValue({ statusCode: 200 });

  const req = {
    body: {
      username: "maomao",
      passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
    },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn(),
  };
  await UserService.login(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
});
