import ResourceRequestData from "../Backend/model/ResourceRequestData";
import DatabaseManager from "../Backend/data/DatabaseManager";

jest.mock("../Backend/data/DatabaseManager");

describe("ResourceRequestData", () => {
  beforeEach(() => {
    DatabaseManager.getDb.mockReturnValue({
      query: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("insertResourceRequest", () => {
    const resourceRequest = {
      resourceId: 1,
      userId: 2,
      amount: 100,
      timestamp: new Date()
    };

    it("should insert resource request successfully", async () => {
      const mockResult = { rows: [resourceRequest] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.insertResourceRequest(resourceRequest);
      expect(result).toEqual({ statusCode: 201, data: resourceRequest });
    });

    it("should handle errors during insertion", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Insertion error"));
      await expect(ResourceRequestData.insertResourceRequest(resourceRequest))
        .rejects
        .toThrow("Error inserting resource request");
    });
  });

  describe("getResourceRequestsByResourceId", () => {
    const resourceId = 1;

    it("should retrieve resource requests successfully", async () => {
      const mockResult = { rows: [{ id: 1, resource_id: resourceId }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getResourceRequestsByResourceId(resourceId);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows });
    });

    it("should return 404 when no resource requests are found", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getResourceRequestsByResourceId(resourceId);
      expect(result).toEqual({ statusCode: 404, data: [] });
    });

    it("should handle errors during retrieval", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Retrieval error"));
      await expect(ResourceRequestData.getResourceRequestsByResourceId(resourceId))
        .rejects
        .toThrow("Error retrieving resource requests by resource ID");
    });

  });

  describe("updateResourceRequestState", () => {
    const resourceRequestId = 1;
    const status = "approved";

    it("should update resource request state successfully", async () => {
      const mockResult = { rows: [{ id: resourceRequestId, status }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.updateResourceRequestState(resourceRequestId, status);
      expect(result).toEqual({ statusCode: 200, data: mockResult.rows[0] });
    });

    it("should return 404 when no resource requests are found", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.updateResourceRequestState(resourceRequestId, status);
      expect(result).toEqual({ statusCode: 404, data: {} });
    });

    it("should handle errors during update", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Update error"));
      await expect(ResourceRequestData.updateResourceRequestState(resourceRequestId, status))
        .rejects
        .toThrow("Error updating resource");
    });
  });

  describe("countApprovedAmount", () => {
    const resourceId = 1;

    it("should count approved amount successfully", async () => {
      const mockResult = { rows: [{ approved_amount: 100 }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.countApprovedAmount(resourceId);
      expect(result).toEqual(100);
    });
  });

  describe("getRequestsByResourceId", () => {
    const resourceId = 1;

    it("should retrieve requests by resource ID successfully", async () => {
      const mockResult = { rows: [{ id: 1, resource_id: resourceId }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getRequestsByResourceId(resourceId);
      expect(result).toEqual([{"id": 1, "resource_id": 1}]);
    });

    it("should return 404 when no requests are found", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getRequestsByResourceId(resourceId);
      expect(result).toEqual([]);
    });

    it("should handle errors during retrieval", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Retrieval error"));
      await expect(ResourceRequestData.getRequestsByResourceId(resourceId))
        .rejects
        .toThrow("Error getting requests by resource id");
    });
  });

  describe("getRequestsByUserId", () => {
    const userId = 1;

    it("should retrieve requests by user ID successfully", async () => {
      const mockResult = { rows: [{ id: 1, user_id: userId }] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getRequestsByUserId(userId);
      expect(result).toEqual({"data": [{"id": 1, "user_id": 1}], "statusCode": 200});
    });

    it("should return 404 when no requests are found", async () => {
      const mockResult = { rows: [] };
      DatabaseManager.getDb().query.mockResolvedValue(mockResult);

      const result = await ResourceRequestData.getRequestsByUserId(userId);
      expect(result).toEqual({"data": [], "statusCode": 200});
    });

    it("should handle errors during retrieval", async () => {
      DatabaseManager.getDb().query.mockRejectedValue(new Error("Retrieval error"));
      await expect(ResourceRequestData.getRequestsByUserId(userId))
        .rejects
        .toThrow("Error getting requests by user id");
    });
  });

});
