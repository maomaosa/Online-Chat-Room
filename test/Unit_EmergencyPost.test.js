import emergencyPostService from "../Backend/service/emergencyPostService.js";
import EmergencyPostData from "../Backend/model/EmergencyPostData.js";
import AWS from 'aws-sdk';

jest.mock("../Backend/model/EmergencyPostData.js");
jest.mock('aws-sdk', () => {
    return {
        S3: jest.fn().mockImplementation(() => ({
            upload: jest.fn((params, callback) => {
                callback(new Error("Failed to upload"), null);
            })
        }))
    };
});
const mockEmit = jest.fn();
const mockIo = { emit: mockEmit };
emergencyPostService.connect(mockIo);
const mockRequest = (body = {}, params = {}, userInfo = {}, file = null) => ({
    body,
    params,
    userInfo,
    file
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

beforeAll(async () => {

});

beforeEach(async () => {
    jest.clearAllMocks();

});

afterAll(async () => {

});

describe("postEmergencyPostPicture", () => {
    
    test("should respond with 401 if no file is uploaded", async () => {
        const req = mockRequest();
        const res = mockResponse();
        await emergencyPostService.postEmergencyPostPicture(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Please upload a file.');
    });

    test("should respond with 402 when S3 upload failure", async () => {
        const mockFile = { originalname: 'test.jpg', buffer: 'fileBuffer' };
        const req = mockRequest({}, {}, {}, mockFile);
        const res = mockResponse();
        await emergencyPostService.postEmergencyPostPicture(req, res);
        expect(res.status).toHaveBeenCalledWith(402);
    });
});

describe("helpEmergencyPost", () => {
    test("should respond with 201 when help is successfully added to the emergency post", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.helpEmergencyPost.mockResolvedValue({
            statusCode: 201,
            data: { post_id: 'post123', user_id: 'user123' }
        });

        await emergencyPostService.helpEmergencyPost(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.any(Object));
    });

    test("should respond with 400 when there is an error adding help to the emergency post", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();
        
        EmergencyPostData.helpEmergencyPost.mockRejectedValue(new Error("Internal Server Error"));
        
        await emergencyPostService.helpEmergencyPost(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});

describe("clearEmergencyPost", () => {
    test("should respond with 201 when clear is successfully added to the emergency post", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.clearEmergencyPost.mockResolvedValue({
            statusCode: 201,
            data: { post_id: 'post123', user_id: 'user123' }
        });

        await emergencyPostService.clearEmergencyPost(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.any(Object));
    });

    test("should respond with 400 when there is an error adding clear to the emergency post", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();
        
        EmergencyPostData.clearEmergencyPost.mockRejectedValue(new Error("Internal Server Error"));
        
        await emergencyPostService.clearEmergencyPost(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});

describe("deleteHelp", () => {

    test("should respond with 201 when help label is successfully deleted", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.deleteHelp.mockResolvedValue({
            statusCode: 201,
            data: 'Help label deleted successfully'
        });

        await emergencyPostService.deleteHelp(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith('Help label deleted successfully');
    });

    test("should respond with 400 when there is an error deleting help label", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.deleteHelp.mockRejectedValue(new Error("Internal Server Error"));

        await emergencyPostService.deleteHelp(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});

describe("deleteClear", () => {

    test("should respond with 201 when clear label is successfully deleted", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.deleteClear.mockResolvedValue({
            statusCode: 201,
            data: 'Clear label deleted successfully'
        });

        await emergencyPostService.deleteClear(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith('Clear label deleted successfully');
    });

    test("should respond with 400 when there is an error deleting clear label", async () => {
        const req = mockRequest({}, { postid: 'post123' }, { userId: 'user123' });
        const res = mockResponse();

        EmergencyPostData.deleteClear.mockRejectedValue(new Error("Internal Server Error"));

        await emergencyPostService.deleteClear(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});

describe("getHelpList", () => {

    test("should respond with 201 and return help list when successfully retrieved", async () => {
        const req = mockRequest({}, { postid: 'post123' });
        const res = mockResponse();

        EmergencyPostData.getHelpList.mockResolvedValue([
            { userId: 'user1', postId: 'post123' },
            { userId: 'user2', postId: 'post123' }
        ]);

        await emergencyPostService.getHelpList(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith([
            { userId: 'user1', postId: 'post123' },
            { userId: 'user2', postId: 'post123' }
        ]);
    });

    test("should respond with 400 when there is an error retrieving help list", async () => {
        const req = mockRequest({}, { postid: 'post123' });
        const res = mockResponse();

        EmergencyPostData.getHelpList.mockRejectedValue(new Error("Internal Server Error"));

        await emergencyPostService.getHelpList(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});

describe("getClearList", () => {
    test("should respond with 201 and return clear list when successfully retrieved", async () => {
        const req = mockRequest({}, { postid: 'post123' });
        const res = mockResponse();

        EmergencyPostData.getClearList.mockResolvedValue([
            { userId: 'user3', postId: 'post123' },
            { userId: 'user4', postId: 'post123' }
        ]);

        await emergencyPostService.getClearList(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith([
            { userId: 'user3', postId: 'post123' },
            { userId: 'user4', postId: 'post123' }
        ]);
    });

    test("should respond with 400 when there is an error retrieving clear list", async () => {
        const req = mockRequest({}, { postid: 'post123' });
        const res = mockResponse();

        EmergencyPostData.getClearList.mockRejectedValue(new Error("Internal Server Error"));

        await emergencyPostService.getClearList(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
});
