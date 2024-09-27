import handleRoute from "../Backend/router/pageRouter.js";
import fs from "fs";
import path from "path";

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFile: jest.fn(),
}));

test("Success: Home caller", () => {
  const req = { url: "/", headers: { host: "localhost" } };
  const res = mockResponse();

  handleRoute(req, res);

  expect(fs.readFile).toHaveBeenCalledWith(
    path.join(__dirname, "../Frontend/view/Home.html"),
    expect.any(Function)
  );
});

test("Success: Banned usernames", () => {
  const req = { url: "/BannedUsernames.txt", headers: { host: "localhost" } };
  const res = mockResponse();

  handleRoute(req, res);

  expect(fs.readFile).toHaveBeenCalledWith(
    path.join(__dirname, "../BannedUsernames.txt"),
    expect.any(Function)
  );
});

test("Success: Instruction", () => {
  const req = { url: "/instructions", headers: { host: "localhost" } };
  const res = mockResponse();

  handleRoute(req, res);

  expect(fs.readFile).toHaveBeenCalledWith(
    path.join(__dirname, "../Frontend/view/Instruction.html"),
    expect.any(Function)
  );
});

test("Success: Dashboard", () => {
  const req = { url: "/dashboard", headers: { host: "localhost" } };
  const res = mockResponse();

  handleRoute(req, res);

  expect(fs.readFile).toHaveBeenCalledWith(
    path.join(__dirname, "../Frontend/view/Frame.html"),
    expect.any(Function)
  );
});

// test("Fail: non existing path", () => {
//   const req = { url: "/non-existing", headers: { host: "localhost" } };
//   const res = mockResponse();

//   handleRoute(req, res);

//   expect(fs.readFile).toHaveBeenCalledWith(
//     path.join(__dirname, "../Frontend/view/404.html"),
//     expect.any(Function)
//   );
// });

function mockResponse() {
  const res = {};
  res.writeHead = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}
