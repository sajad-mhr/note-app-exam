const http = require("http");
const fs = require("fs");
const PORT = 8080;
const server = http.createServer(requestHandler);
const challenges = require("./modules/challenges");
const auth = require("./modules/auth");
const page = require("./modules/pages");
const note = require("./modules/notes");
server.listen(PORT);
console.log(`server listen in Port ${PORT}`);

let headers = {
  text: { "Content-Type": "Text/Plain" },
  html: { "Content-Type": "text/html" },
  css: { "Content-Type": "text/css" },
  js: { "Content-Type": "text/javascript" },
  json: { "Content-Type": "application/json" },
};

let types = {
  text: "Text/Plain",
  html: "Text/Html",
  css: "text/css",
  js: "text/javascript",
  json: "application/json",
};

const routes = {
  ch2: challenges.ch2,
  ch3: challenges.ch3,
  ch4: challenges.ch4,
  registerApi: auth.register,
  loginApi: auth.login,
  verifyApi: auth.verify,
  register: page.register,
  login: page.login,
  notes: page.notes,
  getNotesApi: note.get,
  createNoteApi: note.create,
  deleteNoteApi: note.delete,
};

function write(res, statusCode, headerType, body, token) {
  if (token) {
    res.writeHead(statusCode, {
      "Content-Type": types[headerType],
      "Set-Cookie": `userToken=${token} `,
    });
    res.write(body);
    res.end();
  } else {
    res.writeHead(statusCode, headers[headerType]);
    res.write(body);
    res.end();
  }
}

function requestHandler(req, res) {
  let route = req.url.split("/")[1];
  let path = __dirname + req.url;
  if (route !== "favicon.ico") {
    if (route === "assets" && !path.includes(".map")) {
      console.log(path);
      fs.readFile(path, (err, data) => {
        if (err) {
          console.log(err);
        } else {

          res.write(data);
          res.end();
        }
      });
    } else {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          routes[route](req, res, data);
        } catch (err) {
          write(res, 404, "text", "api not found");
        }
      });
    }

    // switch (req.url) {
    //   case "/assets/Bootstrap/index.css":
    //     fs.readFile("./assets/Bootstrap/index.css", function (err, data) {
    //       write(res, 200, "css", data);
    //     });
    //     break;
    //   case "/assets/Bootstrap/index.js":
    //     fs.readFile("./assets/Bootstrap/index.js", function (err, data) {
    //       write(res, 200, "js", data);
    //     });
    //     break;
    //   default:

    //     break;
    // }
  }
}
