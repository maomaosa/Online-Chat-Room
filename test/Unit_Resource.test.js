import ResourceData from "../Backend/model/ResourceData.js";
import ResourceService from "../Backend/service/resourceService.js";

// Test cases for resources completeness
test("Resource Completeness: missing element", () => {
  const missingResource = {
    content: "Test Content",
    amount: 5,
    type: "2",
  };
  expect(() => {
    ResourceService.checkCompleteness(missingResource);
  }).toThrow("Missing or empty required fields: title");
});

test("Resource Completeness: missing value", () => {
  const missingResource = {
    content: "",
    amount: 5,
    type: "2",
  };
  expect(() => {
    ResourceService.checkCompleteness(missingResource);
  }).toThrow("Missing or empty required fields: title, content");
});

test("Resource Completeness: invalid resource type", () => {
  const invalidTypeResource = {
    title: "Test Title",
    content: "Test Content",
    amount: 5,
    type: "5",
  };
  expect(() => {
    ResourceService.checkCompleteness(invalidTypeResource);
  }).toThrow("Type missing");
});

test("Resource Completeness: valid resource", () => {
  const validResource = {
    type: "1",
    title: "Valid Title",
    content: "Valid Content",
    amount: 5,
  };
  expect(() => {
    ResourceService.checkCompleteness(validResource);
  }).not.toThrow();
});

// Test cases for address validation
test("Address Validation: missing longitude and latitude", async () => {
  const invalidAddress = {};
  await expect(
    ResourceService.checkAddressValidation(invalidAddress)
  ).rejects.toThrow("Address object must contain both longitude and latitude");
});

test("Address Validation: missing latitude", async () => {
  const invalidAddress = { longitude: -75.789 };
  await expect(
    ResourceService.checkAddressValidation(invalidAddress)
  ).rejects.toThrow("Address object must contain both longitude and latitude");
});

test("Address Validation: non-numeric coordinates", async () => {
  const invalidAddress = { longitude: "not-a-number", latitude: null };
  await expect(
    ResourceService.checkAddressValidation(invalidAddress)
  ).rejects.toThrow(
    "Address object must contain numeric longitude and latitude"
  );
});

test("Address Validation: invalid address", async () => {
  const invalidAddress = { longitude: 0, latitude: -90 };
  await expect(
    ResourceService.checkAddressValidation(invalidAddress)
  ).rejects.toThrow("Invalid address. No results found.");
});

test("Address Validation: valid address", async () => {
  const validAddress = { longitude: -75.789, latitude: 43.789 };
  await expect(
    ResourceService.checkAddressValidation(validAddress)
  ).resolves.toEqual(
    "933 Denning Road, Copenhagen, New York 13626, United States"
  );
});

//Test case for data transfer to POINT
test("POINT Data Transfer: normal case", () => {
  const address = {
    longitude: -75.789,
    latitude: 43.789,
  };
  const expectedPointValue = "(-75.789, 43.789)";

  const result = ResourceData.transferAddress(address);
  expect(result).toEqual(expectedPointValue);
});

test("POINT Data Transfer: undefines", () => {
  const address = {};
  const expectedPointValue = "(undefined, undefined)";

  const result = ResourceData.transferAddress(address);
  expect(result).toEqual(expectedPointValue);
});
