import express from "express";
import ResourceRequestService from "../service/resourceRequestService.js";
const router = express.Router();

router.post("/", ResourceRequestService.requestResourceWithAmount);

router.get("/currentUser", ResourceRequestService.getCurrentUserRequests);

router.put(
  "/:resourceRequestId/status/:status",
  ResourceRequestService.updateResourceRequestStatus
);

export default router;
