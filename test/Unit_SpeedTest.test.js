import SpeedTestService from "../Backend/service/speedTestService";

import { isPrivilegePermitted } from "../Backend/util/permissionUtil.js";
import { mockRequest, mockResponse } from "mock-req-res";

jest.mock("../Backend/model/SpeedTestData");
jest.mock("../Backend/util/permissionUtil");

describe("SpeedTestService", () => {
  let fakeIo, fakeSocket, req, res;

  beforeEach(() => {
    fakeIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() }; 
    req = mockRequest();
    res = mockResponse({
        status: jest.fn().mockReturnThis(), 
        send: jest.fn(),
        json: jest.fn()
    });
});


  describe("connect", () => {
    it("should store the io connection", () => {
      SpeedTestService.connect(fakeIo);
      expect(SpeedTestService.io).toBe(fakeIo);
    });
  });

  describe("connectSocket", () => {
    it("should store the socket connection", () => {
      SpeedTestService.connectSocket(fakeSocket);
      expect(SpeedTestService.socket).toBe(fakeSocket);
    });
  });

  describe("suspendNormalOperation", () => {
    it("should set the performance test running flag and emit an event", async () => {
      SpeedTestService.connect(fakeIo);
      await SpeedTestService.suspendNormalOperation();
      expect(SpeedTestService.performanceTestRunning).toBe(true);
      expect(fakeIo.to).toHaveBeenCalledWith("general");
      expect(fakeIo.emit).toHaveBeenCalledWith("speedTestAlert", "Speed test is running. You will be logged out.");
    });
  });

  describe("resumeNormalOperation", () => {
    it("should deny permission if not permitted", async () => {
        req.userInfo = { privilegeLevel: 'low' };
        isPrivilegePermitted.mockReturnValue(false);

        await SpeedTestService.resumeNormalOperation(req, res);
        expect(res.send).toHaveBeenCalledWith("Permission denied!");
    });

    it("should resume normal operation if permitted", async () => {
        req.userInfo = { privilegeLevel: 'high' };
        isPrivilegePermitted.mockReturnValue(true);

        await SpeedTestService.resumeNormalOperation(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: "Test stopped." });
    });
  });

    describe("startPerformanceTest", () => {
        it("should deny permission if not permitted", async () => {
            req.userInfo = { privilegeLevel: 'low' };
            isPrivilegePermitted.mockReturnValue(false);

            await SpeedTestService.startPerformanceTest(req, res);
            expect(res.send).toHaveBeenCalledWith("Permission denied!");
        });

        it("should reject starting a test if one is already running", async () => {
            SpeedTestService.performanceTestRunning = true;
            req.userInfo = { privilegeLevel: 'high' };
            isPrivilegePermitted.mockReturnValue(true);

            await SpeedTestService.startPerformanceTest(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: "A test is already running." });
        });

        it("should start a performance test if no test is running and user is permitted", async () => {
            SpeedTestService.performanceTestRunning = false;
            req.userInfo = { privilegeLevel: 'high' };
            isPrivilegePermitted.mockReturnValue(true);

            await SpeedTestService.startPerformanceTest(req, res);
            expect(SpeedTestService.performanceTestRunning).toBe(true);
            expect(res.json).toHaveBeenCalledWith({ status: "Success" });
        });
    });

    describe("stopPerformanceTest", () => {
        it("should deny permission if not permitted", async () => {
            req.userInfo = { privilegeLevel: 'low' };
            isPrivilegePermitted.mockReturnValue(false);

            await SpeedTestService.stopPerformanceTest(req, res);
            expect(res.send).toHaveBeenCalledWith("Permission denied!");
        });

        it("should reject stopping a test if no test is running", async () => {
            SpeedTestService.performanceTestRunning = false;
            req.userInfo = { privilegeLevel: 'high' };
            isPrivilegePermitted.mockReturnValue(true);

            await SpeedTestService.stopPerformanceTest(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: "No test is running." });
        });
    });

});




