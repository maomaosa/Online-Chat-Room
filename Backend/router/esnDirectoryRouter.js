import express from "express";
import ESNDirectoryService from "../service/esnDirectoryService.js";
const router = express.Router();

router.get("/", ESNDirectoryService.getESNDirectory);

router.get(
  "/criteriaType/:criteriaType/criteriaContent/:criteriaContent",
  ESNDirectoryService.getFilteredESNDirectory
);

export default router;
