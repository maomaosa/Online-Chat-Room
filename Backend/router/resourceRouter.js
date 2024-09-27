import express from "express";
import ResourceService from "../service/resourceService.js";
const router = express.Router();

router.post("/", ResourceService.addResource);

router.delete("/:resourceId", ResourceService.deleteResource);

router.put("/", ResourceService.updateResource);

router.get("/", ResourceService.getResources);

router.get("/currentUser", ResourceService.getCurrentUserResources);

export default router;
