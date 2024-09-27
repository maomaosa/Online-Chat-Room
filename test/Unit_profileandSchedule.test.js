import DatabaseManager from "../Backend/data/DatabaseManager.js";
import MessageService from "../Backend/service/messageService.js";
import { userRedisClient } from "../Backend/service/userService.js";
import MessageData from "../Backend/model/MessageData.js";
import ESNDirectoryService from "../Backend/service/esnDirectoryService.js";
import ESNDirectoryData from "../Backend/model/ESNDirectoryData.js";
import UserProfileService from "../Backend/service/userProfileService.js";
import UserProfileData from "../Backend/model/UserProfileData.js";
import UserService from '../Backend/service/userService.js'
import UserAppointmentService from "../Backend/service/userAppointmentService.js";
MessageData.getMessagesByType = jest.fn();
ESNDirectoryData.getESNDirectory = jest.fn();
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
    TRUNCATE TABLE esn_user_profession_profile RESTART IDENTITY CASCADE;
    
    COMMIT;
    `;
  await DatabaseManager.db.query(resetQuery);
});

afterAll(async () => {
  await DatabaseManager.closeDatabase();
  await userRedisClient.quit();
});


test("test jobtype number to match string", () => {
  const result1 = UserProfileService.numberTostring("1");
  expect(result1).toBe("Doctor");
  const result2 = UserProfileService.numberTostring("2");
  expect(result2).toBe("Dentist");
});
test("test jobtype number to match string not in range(0-6)", () => {
  const result1 = UserProfileService.numberTostring("-1");
  expect(result1).toBe("Unknown Job Type");
  const result2 = UserProfileService.numberTostring("10");
  expect(result2).toBe("Unknown Job Type");
});
test("isDateFormatted should return true for valid date format", () => {
  const validDateTime = "12:00-14:00 01/Jan/2024";
  const result = UserAppointmentService.isDateFormatted(validDateTime);
  expect(result).toBe(true);
});

test("isDateFormatted should return false for invalid date format", () => {
  const invalidDateTime = "12-14 01/Jan/2024"; 
  const result = UserAppointmentService.isDateFormatted(invalidDateTime);
  expect(result).toBe(false);
});

test('isLengthTen should return true for valid 10-digit phone number', () => {
    const phoneNumber = '1234567890';
    const result = UserService.isLengthTen(phoneNumber);
    expect(result).toBe(true);
});

test('isLengthTen should return flase for invalid 10-digit phone number', () => {
  const phoneNumber = '1';
  const result = UserService.isLengthTen(phoneNumber);
  expect(result).toBe(false);
});
test('test jobtype completeness positively', () => {

  const profile1 = '1';
  const result=UserProfileService.checkCompleteness(profile1);
  expect(result).toBe(profile1);
});
test('test jobtype completeness negatively', () => {
  const profile2 = '';
  expect(() => {
    UserProfileService.checkCompleteness(profile2);
  }).toThrow(`Missing or empty required fields`);
});

test('test username completeness positively', () => {
  const profile3 = 'maomao';
  const result=UserProfileService.checkCompleteness(profile3);
  expect(result).toBe(profile3);
});
test('test username completeness negatively', () => {
  const profile3 = null;
  expect(() => {
    UserProfileService.checkCompleteness(profile3);
  }).toThrow(`Missing or empty required fields`);
});