import UserService from "../Backend/service/userService.js";
import ESNDirectoryService from "../Backend/service/esnDirectoryService.js";
import ESNDirectoryData from "../Backend/model/ESNDirectoryData.js";
import UserData from "../Backend/model/UserData.js";
import { ACCOUNT_STATUS } from "../Backend/CONST.js";
import { userRedisClient } from "../Backend/service/userService.js";

jest.mock("../Backend/model/ESNDirectoryData.js", () => ({
  getESNDirectoryByUserId: jest.fn(),
}));

UserService.io = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};
ESNDirectoryService.io = {
  emit: jest.fn(),
};

jest.mock("../Backend/model/UserData", () => ({
  getUserByUsername: jest.fn(),
}));

describe("check user login with changed accout status", () => {
  test("Fail: user 'INACTIVE' login", async () => {
    const req = {
      body: {
        username: "test_user",
        passwordHash: "password_hash",
        isRelogin: false,
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    UserData.getUserByUsername.mockResolvedValue({
      statusCode: 200,
      data: {
        username: "test_user",
        account_status: ACCOUNT_STATUS.INACTIVE,
      },
    });

    await UserService.login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith("Account is inactive");
  });
  afterAll(async () => {
    await userRedisClient.quit();
  });
});

describe("check esn directory change while account status change", () => {
  test("Succeed: user 'INACTIVE' remove from esn directory", async () => {
    ESNDirectoryService.esnDirectory = [
      { user_id: 1, username: "aaaa" },
      { user_id: 2, username: "bbbb" },
    ];

    await ESNDirectoryService.updateESNDirectoryByUserAccountStatus(
      1,
      ACCOUNT_STATUS.INACTIVE
    );
    expect(ESNDirectoryService.esnDirectory.length).toBe(1);
  });

  test("Succeed: user 'ACTIVE' add to esn directory", async () => {
    ESNDirectoryData.getESNDirectoryByUserId.mockResolvedValue({
      statusCode: 200,
      data: [{ user_id: 3, username: "cccc" }],
    });
    ESNDirectoryService.esnDirectory = [
      { user_id: 1, username: "aaaa" },
      { user_id: 2, username: "bbbb" },
    ];

    await ESNDirectoryService.updateESNDirectoryByUserAccountStatus(
      3,
      ACCOUNT_STATUS.ACTIVE
    );
    expect(ESNDirectoryService.esnDirectory.length).toBe(3);
  });

  afterAll(async () => {
    await userRedisClient.quit();
  });
});

describe("check socket update and esn directory change calls while account status change", () => {
  test('Succeed: (INACTIVE) should emit "inactiveAccount" event and update ESNDirectory', () => {
    const updateESNDirectoryMock = jest.spyOn(
      ESNDirectoryService,
      "updateESNDirectoryByUserAccountStatus"
    );
    UserService.accountStatusChangePerformance(
      1,
      "test_user",
      ACCOUNT_STATUS.INACTIVE
    );

    expect(UserService.io.to).toHaveBeenCalledWith("test_user");
    expect(UserService.io.emit).toHaveBeenCalledWith(
      "inactiveAccount",
      "Your account is inavtivated by administrator."
    );
    expect(
      ESNDirectoryService.updateESNDirectoryByUserAccountStatus
    ).toHaveBeenCalledWith(1, ACCOUNT_STATUS.INACTIVE);
    updateESNDirectoryMock.mockRestore();
  });

  test("Succee: (ACTIVE) should update ESNDirectory", () => {
    const updateESNDirectoryMock = jest.spyOn(
      ESNDirectoryService,
      "updateESNDirectoryByUserAccountStatus"
    );
    UserService.accountStatusChangePerformance(
      2,
      "test_user",
      ACCOUNT_STATUS.ACTIVE
    );
    expect(
      ESNDirectoryService.updateESNDirectoryByUserAccountStatus
    ).toHaveBeenCalledWith(2, ACCOUNT_STATUS.ACTIVE);
    updateESNDirectoryMock.mockRestore();
  });

  afterAll(async () => {
    await userRedisClient.quit();
  });
});
