import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import handleRoute from "./router/pageRouter.js";
import userRouter from "./router/userRouter.js";
import esnDirectoryRouter from "./router/esnDirectoryRouter.js";
import messageRouter from "./router/messageRouter.js";
import userStatusRouter from "./router/userStatusRouter.js";
import ESNDirectoryService from "./service/esnDirectoryService.js";
import MessageService from "./service/messageService.js";
import SpeedTestService from "./service/speedTestService.js";
import { checkToken, flushAllRedisData } from "./util/middleware.js";
import UserService from "./service/userService.js";
import UserStatusService from "./service/UserStatusService.js";
import DatabaseManager from "./data/DatabaseManager.js";
import speedTestRouter from "./router/speedTestRouter.js";
import esnGuideROuter from "./router/esnGuideRouter.js";
import ESNGuideService from "./service/esnGuideService.js";
import resourceRouter from "./router/resourceRouter.js";
import resourceRequestRouter from "./router/resourceRequestRouter.js";
import userProfileRouter from "./router/userProfileRouter.js";
import UserProfileService from "./service/userProfileService.js";
import userAppointmentRouter from "./router/userAppointmentRouter.js";
import emergencyPostRouter from "./router/emergencyPostRouter.js";
import EmergencyPostService from "./service/emergencyPostService.js";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.use(cors());
app.use(express.json());

app.use(checkToken);

app.use("/users", userRouter);
app.use("/directories", esnDirectoryRouter);
app.use("/messages", messageRouter);
app.use("/shareStatuses/", userStatusRouter);
app.use("/speedTests", speedTestRouter);
app.use("/resources", resourceRouter);
app.use("/resourceRequests", resourceRequestRouter);
app.use("/emergencyPosts", emergencyPostRouter);
app.use("/userProfiles", userProfileRouter);
app.use("/userProfileAppointments", userAppointmentRouter);
app.use("/esnGuides", esnGuideROuter);

app.use((req, res) => {
  handleRoute(req, res);
});

async function startServer() {
  try {
    flushAllRedisData();
    await DatabaseManager.connectToDatabase("esndb");
    await ESNDirectoryService.setUsersOffline();
    ioSettings();

    // port
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

let userSockets = {};

function ioSettings() {
  io.on("connection", (socket) => {
    UserService.connectSocket(socket);
    SpeedTestService.connectSocket(socket);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });
    socket.on("error", (error) => {
      console.error("An error occurred while joining room:", error);
    });
    socket.on("disconnect", () => {});
  });

  UserService.connect(io);
  UserStatusService.connect(io);
  ESNDirectoryService.connect(io);
  MessageService.connect(io);
  SpeedTestService.connect(io);
  ESNGuideService.connect(io);
  UserProfileService.connect(io);
  EmergencyPostService.connect(io);
}
export { app, httpServer, startServer, ioSettings };
