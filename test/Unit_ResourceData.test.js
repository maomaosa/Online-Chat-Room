import ResourceData from "../Backend/model/ResourceData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("ResourceData", () => {
  beforeEach(() => {
    DatabaseManager.getDb.mockReturnValue({
      query: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("insertResource", () => {
    const resource = {
      userId: 1,
      type: "Water",
      title: "Bottled Water",
      content: "Spring water from Alps",
      address: { longitude: -122.42, latitude: 37.77 },
      amount: 100
    };

    it("should insert a resource and return the newly inserted resource", async () => {
      const expectedResource = { ...resource, id: 1 };
      const mockResult = { rows: [expectedResource] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.insertResource(resource);
      expect(result).toEqual({ statusCode: 201, data: expectedResource });
    });

    it("should handle errors during resource insertion", async () => {
      const error = new Error("Database error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.insertResource(resource))
        .rejects
        .toThrow("Error inserting resource");
    });
  });

  describe("deleteResource", () => {
    it("should delete a resource and return the deleted resource data", async () => {
      const resourceId = 1;
      const expectedResource = { id: resourceId, title: "Bottled Water" };
      const mockResult = { rows: [expectedResource] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.deleteResource(resourceId);
      expect(result).toEqual({ statusCode: 200, data: expectedResource });
    });

    it("should return 404 when no resource is found to delete", async () => {
      const resourceId = 1;
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.deleteResource(resourceId);
      expect(result).toEqual({ statusCode: 404, data: {} });
    });

    it("should handle errors during resource deletion", async () => {
      const resourceId = 1;
      const error = new Error("Delete error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.deleteResource(resourceId))
        .rejects
        .toThrow("Error deleting resource");
    });
  });

  describe("updateResource", () => {
    const resource = {
      id: 1,
      type: "Food",
      title: "Canned Beans",
      content: "Nutritious beans in a can.",
      amount: 50
    };

    it("should update a resource and return the updated resource", async () => {
      const expectedResource = { ...resource, amount: 100 };
      const mockResult = { rows: [expectedResource] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.updateResource({ ...resource, amount: 100 });
      expect(result).toEqual({ statusCode: 200, data: expectedResource });
    });

    it("should handle errors during resource update", async () => {
      const error = new Error("Update error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.updateResource(resource))
        .rejects
        .toThrow("Error updating resource");
    });
  });

  describe("getFilteredResourcesPagination", () => {
    it("should return a list of resources based on filters", async () => {
      const filters = {
        type: "Water",
        title: "Bottled Water",
        amount: 100
      };
      const mockResult = { rows: [{ id: 1, title: "Bottled Water" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.getFilteredResourcesPagination(filters);
      expect(result.data).toEqual({"data": [{"id": 1, "title": "Bottled Water"}], "totalCount": 1});
    });

    it("should handle errors during resource filtering", async () => {
      const error = new Error("Filter error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.getFilteredResourcesPagination({}))
        .rejects
        .toThrow("Error retrieving filtered resources pagination");
    });
  });

  describe("getResourcesByUserId", () => {
    it("should return a list of resources based on user id", async () => {
      const userId = 1;
      const mockResult = { rows: [{ id: 1, title: "Bottled Water" }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceData.getResourcesByUserId(userId);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

    it("should handle errors during resource fetching by user id", async () => {
      const userId = 1;
      const error = new Error("Fetch error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.getResourcesByUserId(userId))
        .rejects
        .toThrow("Error retrieving resources by user ID");
    });
  });

  describe("getResourceById", () => {

    it("should handle errors during resource fetching by id", async () => {
      const resourceId = 1;
      const error = new Error("Fetch error");
      DatabaseManager.getDb().query.mockRejectedValue(error);

      await expect(ResourceData.getResourceById(resourceId))
        .rejects
        .toThrow( "Error retrieving filtered resources pagination");
    });
  });

  describe ("transferAddress", () => {
    it("should return a point value based on address", () => {
      const address = { longitude: -122.42, latitude: 37.77 };
      const pointValue = ResourceData.transferAddress(address);
      expect(pointValue).toEqual("(-122.42, 37.77)");
    });
  });

});