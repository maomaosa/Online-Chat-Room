import { PRIVILEGE_LEVEL } from "../CONST.js";

const coordinatorBannedFunctions = [
  "updateUserProfile",
  "getAllUserInfo",
  "resumeNormalOperation",
  "stopPerformanceTest",
  "startPerformanceTest",
];

const userBannedFunctions = ["postAnnouncement"];

export function isPrivilegePermitted(functionName, privilegeLevel) {
  switch (privilegeLevel) {
    case PRIVILEGE_LEVEL.ADMIN:
      return true;
    case PRIVILEGE_LEVEL.COORDINATOR:
      if (coordinatorBannedFunctions.includes(functionName)) return false;
      else return true;
    case PRIVILEGE_LEVEL.USER:
      if (
        coordinatorBannedFunctions.includes(functionName) ||
        userBannedFunctions.includes(functionName)
      )
        return false;
      else return true;
  }
}
