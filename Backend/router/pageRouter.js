import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
const __filename = path.resolve(
  process.cwd(),
  "./Backend/router/pageRouter.js"
);
const __dirname = path.dirname(__filename);

function handleRoute(req, res) {
  let filePath = "." + new URL(req.url, `http://${req.headers.host}`).pathname;
  let contentType = "text/html";
  if (filePath === "./BannedUsernames.txt") {
    filePath = path.join(__dirname, "../../BannedUsernames.txt");
  } else if (filePath === "./" || filePath === "./Home.html") {
    filePath = path.join(__dirname, "../../Frontend/view/Home.html");
  } else if (filePath === "./instructions") {
    filePath = path.join(__dirname, "../../Frontend/view/Instruction.html");
  } else if (filePath === "./dashboard") {
    filePath = path.join(__dirname, "../../Frontend/view/Frame.html");
  } else {
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".jpg": "image/jpeg",
      ".png": "image/png",
    };

    contentType = mimeTypes[extname] || "application/octet-stream";
    filePath = path.join(__dirname, "../../Frontend", filePath);
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.error("Error reading file:", err);
        fs.readFile(
          path.join(__dirname, "../../Frontend/view/404.html"),
          (err, content) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(content, "utf-8");
          }
        );
      } else {
        res.writeHead(500);
        res.end("Server Error: " + err.code);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}

export default handleRoute;
