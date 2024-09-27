import SpeedTestData from "../model/SpeedTestData.js";
import { isPrivilegePermitted } from "../util/permissionUtil.js";

class SpeedTestService {
  // check login and register function with the bool

  static performanceTestRunning = false;
  static io;
  static socket;
  static connect(io) {
    SpeedTestService.io = io;
  }

  static connectSocket(socket) {
    SpeedTestService.socket = socket;
  }

  static async suspendNormalOperation() {
    SpeedTestService.performanceTestRunning = true;

    // Emit the speedTestAlert event to all connected clients except the testing user
    const msg = "Speed test is running. You will be logged out.";
    SpeedTestService.io.to("general").emit("speedTestAlert", msg);

    await SpeedTestData.switchToTestDB();
  }

  static async resumeNormalOperation(req, res) {
    if (
      !isPrivilegePermitted(
        "resumeNormalOperation",
        req.userInfo.privilegeLevel
      )
    ) {
      return res.status(500).send("Permission denied!");
    }
    SpeedTestService.performanceTestRunning = false;
    await SpeedTestData.swithcBackToMainDB();

    res.status(200).json({ message: "Test stopped." });
  }

  static async stopPerformanceTest(req, res) {
    if (
      !isPrivilegePermitted("stopPerformanceTest", req.userInfo.privilegeLevel)
    ) {
      return res.status(500).send("Permission denied!");
    }
    if (!SpeedTestService.performanceTestRunning) {
      res.status(400).json({ message: "No test is running." });
      return;
    }
    console.log("stopPerformanceTest");
    SpeedTestService.performanceTestRunning = false;
    await SpeedTestService.resumeNormalOperation();

    res.status(200).json({ message: "Test stopped." });
  }

  static async startPerformanceTest(req, res) {
    if (
      !isPrivilegePermitted("startPerformanceTest", req.userInfo.privilegeLevel)
    ) {
      return res.status(500).send("Permission denied!");
    }
    if (SpeedTestService.performanceTestRunning) {
      res.status(400).json({ message: "A test is already running." });
      return;
    }

    console.log("startPerformanceTest");
    SpeedTestService.performanceTestRunning = true;
    await SpeedTestService.suspendNormalOperation();

    res.status(200).json({ status: "Success" });
  }
}

export default SpeedTestService;
