import { isPrivilegePermitted } from "../Backend/util/permissionUtil.js";
import { PRIVILEGE_LEVEL } from "../Backend/CONST.js";

describe("check priviledge level", () => {
  it("Succeed: citizen post message", async () => {
    let result = isPrivilegePermitted(
      "postPublicMessage",
      PRIVILEGE_LEVEL.USER
    );
    expect(result).toBe(true);
  });

  it("Succeed: coordinator post announcement", async () => {
    let result = isPrivilegePermitted(
      "postAnnouncement",
      PRIVILEGE_LEVEL.COORDINATOR
    );
    expect(result).toBe(true);
  });

  it("Succeed: admin speed test", async () => {
    let result1 = isPrivilegePermitted(
      "startPerformanceTest",
      PRIVILEGE_LEVEL.ADMIN
    );
    expect(result1).toBe(true);

    let result2 = isPrivilegePermitted(
      "stopPerformanceTest",
      PRIVILEGE_LEVEL.ADMIN
    );
    expect(result2).toBe(true);
  });

  it("Fail: citizen post announcement", async () => {
    let result = isPrivilegePermitted("postAnnouncement", PRIVILEGE_LEVEL.USER);
    expect(result).toBe(false);
  });

  it("Fail: citizen perform speed test", async () => {
    let result1 = isPrivilegePermitted(
      "startPerformanceTest",
      PRIVILEGE_LEVEL.USER
    );
    expect(result1).toBe(false);

    let result2 = isPrivilegePermitted(
      "stopPerformanceTest",
      PRIVILEGE_LEVEL.USER
    );
    expect(result2).toBe(false);
  });

  it("Fail: coordinator perform speed test", async () => {
    let result1 = isPrivilegePermitted(
      "startPerformanceTest",
      PRIVILEGE_LEVEL.COORDINATOR
    );
    expect(result1).toBe(false);

    let result2 = isPrivilegePermitted(
      "stopPerformanceTest",
      PRIVILEGE_LEVEL.COORDINATOR
    );
    expect(result2).toBe(false);
  });
});
