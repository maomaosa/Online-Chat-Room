import UserData from "../Backend/model/UserData.js";
import UserService from "../Backend/service/userService.js";
import { userRedisClient } from "../Backend/service/userService.js";

jest.mock("../Backend/model/UserData.js", () => ({
  updatePassword: jest.fn(),
  updateUserProfileById: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const mockRequest = (data) => ({
  body: { ...data },
});

UserService.accountStatusChangePerformance = jest.fn();

describe("update user profile", () => {
  it("Succeed: update user profile successfully", async () => {
    const req = mockRequest({
      user_id: 1,
      username: "michelle",
      passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
      privilege_level: 2,
      account_status: 0,
    });
    const res = mockResponse();

    UserData.updateUserProfileById.mockResolvedValue({
      statusCode: 200,
      data: { message: "Update successful" },
    });

    await UserService.updateUserProfileById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Update successful" });
  });

  it("Fail: username check fails", async () => {
    const req = mockRequest({
      user_id: 1,
      username: "java",
      passwordHash: "b0baee9d279d34fa1dfd71aadb908c3f",
      privilege_level: 1,
      account_status: 0,
    });
    const res = mockResponse();

    await UserService.updateUserProfileById(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "Username banned! Please set another."
    );
  });

  it("Fail: handle errors during user profile update", async () => {
    const req = mockRequest({
      user_id: 1,
      username: "newUsername",
      passwordHash: "validHashWith32Length",
      privilege_level: 1,
      account_status: 0,
    });
    const res = mockResponse();

    UserData.updateUserProfileById.mockRejectedValue(
      new Error("Database error")
    );

    await UserService.updateUserProfileById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
  });

  it("Fail: profile update with not allowed param", async () => {
    const req = mockRequest({
      user_id: 1,
      username: "newUsername",
      passwordHash: "validHashWith32Length",
      privilege_level: 1,
      account_status: 0,
      status: 1,
    });
    const res = mockResponse();

    await UserService.updateUserProfileById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Unauthorized field modifications attempted: status"
    );
  });

  afterAll(async () => {
    await userRedisClient.quit();
  });
});
