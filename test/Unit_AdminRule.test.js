import UserData from "../Backend/model/UserData.js";
import UserService from "../Backend/service/userService.js";
import { userRedisClient } from "../Backend/service/userService.js";

jest.mock("../Backend/data/DatabaseManager.js", () => ({
  getDb: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({
      rows: [{ count: 0 }],
    }),
  }),
}));

describe("checkAtLeastOneAdmin", () => {
  it("Fail: no active administrator exist", async () => {
    const hasAdmin = await UserData.checkAtLeastOneAdmin();
    expect(hasAdmin).toBe(false);
  });
});

describe("checkInitialAdminRule", () => {
  const user = {
    user_id: 1,
    username: "ESNAdmin",
    privilege_level: 2,
  };
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoibWljaGVsbGUiLCJ0aW1lc3RhbXAiOiJBcHJpbCAyMXN0IDIwMjQsIDEwOjQ4OjQzIHBtIiwiaWF0IjoxNzEzNzY0OTIzLCJleHAiOjE3MTM3Njg1MjN9.woMDRVetxCy1WuKNL01to5sweZqnNeKbfo3vrJb3aN4";

  it("should store user info in Redis", async () => {
    UserService.storeUserInfoToRedis(token, user);

    let redisVal = await new Promise((resolve, reject) => {
      userRedisClient.get(token, (err, result) => {
        if (err) {
          console.error("Error:", err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
    userRedisClient.quit();

    expect(redisVal).toBe(
      '{"userId":1,"username":"ESNAdmin","privilegeLevel":2}'
    );
  });
});
