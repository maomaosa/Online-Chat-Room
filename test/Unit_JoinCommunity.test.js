import DatabaseManager from "../Backend/data/DatabaseManager.js";
import UserService from "../Backend/service/userService.js";
import UserData from "../Backend/model/UserData.js";
import fs from "fs";

import { userRedisClient } from "../Backend/service/userService.js";

beforeAll(async () => {
  await DatabaseManager.connectToDatabase("esn_test");
});

afterEach(async () => {
  const resetQuery = `
    BEGIN;

    TRUNCATE TABLE esn_user RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_directory RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_message RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status RESTART IDENTITY CASCADE;
    TRUNCATE TABLE esn_user_share_status_history RESTART IDENTITY CASCADE;

    COMMIT;
    `;
  await DatabaseManager.db.query(resetQuery);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await userRedisClient.quit();
});

// Test cases for checkUserName
test("Short Username less than 3 should not pass", () => {
  const result1 = UserService.checkUserName("ab");
  expect(result1.statusCode).toBe(500);
  expect(result1.data).toBe("Invalid username. Please set another.");
  const result2 = UserService.checkUserName("a");
  expect(result2.statusCode).toBe(500);
  expect(result2.data).toBe("Invalid username. Please set another.");
});

// Test cases for check bannned username
test("Banned Single Username should not pass", async () => {
  const result1 = UserService.checkUserName("test");
  expect(result1.statusCode).toBe(500);
  expect(result1.data).toBe("Username banned! Please set another.");
  const result2 = UserService.checkUserName("add");
  expect(result2.statusCode).toBe(500);
  expect(result2.data).toBe("Username banned! Please set another.");
});

// Test cases for valid username
test("Valid Username should pass", async () => {
  UserService.checkUserName("user123", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("user123");
  });
});

// Test cases for username case sensitivity
test("All user name should be lower case", async () => {
  UserService.checkUserName("UsEr123", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("user123");
  });
  UserService.checkUserName("user123", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("user123");
  });
});

// test cases for banned username case sensitivity
test("Banned Username should be banned with case sensitivity", async () => {
  const result1 = UserService.checkUserName("Test");
  expect(result1.statusCode).toBe(500);
  expect(result1.data).toBe("Username banned! Please set another.");
  const result2 = UserService.checkUserName("ADD");
  expect(result2.statusCode).toBe(500);
  expect(result2.data).toBe("Username banned! Please set another.");
});

// Test for inserting a user
test("Insert a correct user should be success", async () => {
  UserData.insertUser("testuser", "testpassword", (status, user) => {
    expect(status).toBe(201);
    expect(user.username).toEqual("testuser");
  });
  UserData.getUserByUsername("testuser", (status, user) => {
    expect(status).toBe(200);
    expect(user.username).toEqual("testuser");
  });
});

//Test cases for password
//Test cases for checkPassword which is less than 4
test("Short Password less than 4 should not pass", async () => {
  const result1 = UserService.checkPassword("123");
  expect(result1.statusCode).toBe(500);
  expect(result1.data).toBe("Invalid password. Please enter another.");
  const result2 = UserService.checkPassword("1");
  expect(result2.statusCode).toBe(500);
  expect(result2.data).toBe("Invalid password. Please enter another.");
});

// Test cases for valid password
test("Valid Password should pass", async () => {
  UserService.checkPassword("1234", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("1234");
  });
  UserService.checkPassword("1234aabb", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("1234aabb");
  });
});

// Test cases for password case sensitivity
test("Password are case sensitive", async () => {
  UserService.checkPassword("Aa1234", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("Aa1234");
  });
  UserService.checkPassword("aa1234", (status, message) => {
    expect(status).toBe(200);
    expect(message).toEqual("aa1234");
  });
});

// Test cases for password are undefined
test("Password are undefined should not pass", async () => {
  const result1 = UserService.checkPassword(undefined);
  expect(result1.statusCode).toBe(500);
  expect(result1.data).toBe("Invalid password. Please enter another.");
});
