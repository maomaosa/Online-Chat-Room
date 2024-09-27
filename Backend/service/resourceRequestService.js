import ResourceRequestData from "../model/ResourceRequestData.js";
import ResourceService from "./resourceService.js";

class ResourceRequestService {
  static async requestResourceWithAmount(req, res) {
    try {
      let resourceRequest = req.body;
      resourceRequest["userId"] = req.userInfo.userId;
      resourceRequest["timestamp"] = Date.now();
      let insertResult = await ResourceRequestData.insertResourceRequest(
        resourceRequest
      );
      res.status(insertResult.statusCode).send(insertResult.data);
    } catch (error) {
      console.error("Error inserting resource request:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async updateResourceRequestStatus(req, res) {
    try {
      const resourceRequestId = req.params.resourceRequestId;
      const status = req.params.status;
      let updateStatusResult =
        await ResourceRequestData.updateResourceRequestState(
          resourceRequestId,
          status
        );
      res.status(updateStatusResult.statusCode).send(updateStatusResult.data);
    } catch (error) {
      console.error("Error updating resource request:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getCurrentUserRequests(req, res) {
    try {
      let currentUserId = req.userInfo.userId;
      let getCurrentUserRequestsResult =
        await ResourceRequestData.getRequestsByUserId(currentUserId);
      await ResourceRequestService.setResourcesForRequests(
        getCurrentUserRequestsResult.data
      );
      res
        .status(getCurrentUserRequestsResult.statusCode)
        .send(getCurrentUserRequestsResult.data);
    } catch (error) {
      console.error("Error updating resource request:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async setResourcesForRequests(requests) {
    for (let request of requests) {
      request["resource"] = await ResourceService.getResourceById(
        request["resource_id"]
      );
    }
  }

  static async getApprovedRequestAmountByResourceId(resourceId) {
    try {
      let count = await ResourceRequestData.countApprovedAmount(resourceId);

      return count;
    } catch (error) {
      console.error("Error getting approved requests:", error);
    }
  }

  static async getRequestsByResourceId(resourceId) {
    try {
      let requests = await ResourceRequestData.getRequestsByResourceId(
        resourceId
      );

      return requests;
    } catch (error) {
      console.error("Error getting approved requests:", error);
    }
  }
}

export default ResourceRequestService;
