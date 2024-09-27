import ResourceData from "../model/ResourceData.js";
import ResourceRequestService from "../service/resourceRequestService.js";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
const mapboxClient = mbxGeocoding({
  accessToken:
    "pk.eyJ1IjoibWljaGVsbGUtemhvdSIsImEiOiJjbHVxZHRhcjcxeG8wMmhsbG9hcXdudTFnIn0.zkW-N8dR4eK4YcTSUalMYw",
});

class ResourceService {
  static async addResource(req, res) {
    try {
      let resource = req.body;
      try {
        ResourceService.checkCompleteness(resource);
      } catch (error) {
        return res
          .status(400)
          .send({ error: error.message || "Incomplete resource data" });
      }

      try {
        await ResourceService.checkAddressValidation(resource.address);
      } catch (error) {
        return res
          .status(400)
          .send({ error: error.message || "Invalid address" });
      }

      resource["userId"] = req.userInfo.userId;
      let insertResult = await ResourceData.insertResource(resource);
      res.status(insertResult.statusCode).send(insertResult.data);
    } catch (error) {
      console.error("Error adding resources:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static checkCompleteness(resource) {
    const requiredFields = ["type", "title", "content", "amount"];
    const missingOrEmptyFields = requiredFields.filter(
      (field) => !resource[field] || resource[field].toString().trim() === ""
    );
    if (missingOrEmptyFields.length > 0) {
      throw new Error(
        `Missing or empty required fields: ${missingOrEmptyFields.join(", ")}`
      );
    }

    const typeValue = parseInt(resource.type, 10);
    if (isNaN(typeValue) || typeValue < 0 || typeValue > 4) {
      throw new Error("Type missing");
    }
  }

  static async checkAddressValidation(address) {
    try {
      if (
        !address ||
        typeof address.longitude === "undefined" ||
        typeof address.latitude === "undefined"
      ) {
        throw new Error(
          "Address object must contain both longitude and latitude"
        );
      }

      if (
        typeof address.longitude !== "number" ||
        typeof address.latitude !== "number"
      ) {
        throw new Error(
          "Address object must contain numeric longitude and latitude"
        );
      }

      const response = await mapboxClient
        .reverseGeocode({
          query: [address.longitude, address.latitude],
          limit: 1,
        })
        .send();

      if (
        response &&
        response.body &&
        response.body.features &&
        response.body.features.length > 0
      ) {
        return response.body.features[0].place_name;
      } else {
        throw new Error("Invalid address. No results found.");
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static async deleteResource(req, res) {
    const resourceId = req.params.resourceId;
    try {
      let deleteResult = await ResourceData.deleteResource(resourceId);
      res.status(deleteResult.statusCode).send(deleteResult.data);
    } catch (error) {
      console.error("Error deleting resources:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async updateResource(req, res) {
    try {
      const resource = req.body;
      let updateResult = await ResourceData.updateResource(resource);
      res.status(updateResult.statusCode).send(updateResult.data);
    } catch (error) {
      console.error("Error updating resources:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getResources(req, res) {
    //page, category, distance
    const filters = req.query;
    try {
      let getFilteredResourcesResult =
        await ResourceData.getFilteredResourcesPagination(filters);

      await ResourceService.setApprovedRequestCount(
        getFilteredResourcesResult.data
      );
      res
        .status(getFilteredResourcesResult.statusCode)
        .send(getFilteredResourcesResult.data);
    } catch (error) {
      console.error("Error getting resources:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async setApprovedRequestCount(resultData) {
    if (resultData.data.length > 0) {
      let resultList = resultData["data"];
      for (let resource of resultList) {
        resource["approved_request"] =
          await ResourceRequestService.getApprovedRequestAmountByResourceId(
            resource["id"]
          );
      }
    }
  }

  static async getResourceById(resourceId) {
    try {
      let resource = await ResourceData.getResourceById(resourceId);
      resource["approved_request"] =
        await ResourceRequestService.getApprovedRequestAmountByResourceId(
          resource["id"]
        );
      return resource;
    } catch (error) {
      console.error("Error getting resource by id:", error);
    }
  }

  static async getCurrentUserResources(req, res) {
    try {
      const currentUserId = req.userInfo.userId;
      let getCurrentUserResourcesResult =
        await ResourceData.getResourcesByUserId(currentUserId);
      await ResourceService.setRequests(getCurrentUserResourcesResult.data);
      res
        .status(getCurrentUserResourcesResult.statusCode)
        .send(getCurrentUserResourcesResult.data);
    } catch (error) {
      console.error("Error getting current user resources:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async setRequests(resources) {
    for (let resource of resources) {
      resource["requests"] =
        await ResourceRequestService.getRequestsByResourceId(resource["id"]);
    }
  }
}

export default ResourceService;
