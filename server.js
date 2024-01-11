const http = require("http");
const fs = require("fs");
const PORT = 8080;
const server = http.createServer(requestHandler);
const jwt = require("jsonwebtoken");
server.listen(PORT);
console.log(`server listen in Port ${PORT}`);

let headers = {
  text: { "Content-Type": "Text/Plain" },
  html: { "Content-Type": "text/html" },
  json: { "Content-Type": "application/json" },
};

let types = {
  text: "Text/Plain",
  html: "Text/Html",
  json: "application/json",
};

const routes = {
  registerApi: registerController,
  loginApi: loginController,
  verifyApi: verifyToken,
  register: registerPageController,
  login: loginPageController,
  home: homePageController,
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

function registerPageController(req, res) {
  fs.readFile("./pages/registerPage/registerPage.html", (error, data) => {
    if (error) {
      write(res, 404, "text", "not found");
    } else {
      write(res, 200, "html", data);
    }
  });
}
function loginPageController(req, res) {
  fs.readFile("./pages/loginPage/loginPage.html", (error, data) => {
    if (error) {
      write(res, 404, "text", "not found");
    } else {
      write(res, 200, "html", data);
    }
  });
}
function homePageController(req, res) {
  fs.readFile("./pages/homePage/homePage.html", (error, data) => {
    if (error) {
      write(res, 404, "text", "not found");
    } else {
      write(res, 200, "html", data);
    }
  });
}

function registerController(req, res, data) {
  let fObj = JSON.parse(data);
  if (
    fObj.fullname === undefined ||
    fObj.email === undefined ||
    fObj.password === undefined
  ) {
    write(res, 404, "text", "bad Data");
  } else {
    fs.readFile("./database/userDB.json", (error, filedata) => {
      if (error) {
        write(res, 404, "text", "file not found");
      } else {
        filedata = JSON.parse(filedata);
        console.log(data.email);
        let status = false;
        filedata.data.forEach((user) => {
          console.log(user);
          if (user.email === fObj.email) {
            status = true;
          }
        });
        if (status === false) {
          console.log(filedata.data);
          filedata.data.push(JSON.parse(data));
          filedata = JSON.stringify(filedata);
          fs.writeFile("./database/userDB.json", filedata, "utf8", (error) => {
            if (error) {
              write(res, 404, "text", "fs error");
            } else {
              write(res, 200, "text", "register successfully");
            }
          });
        } else {
          write(res, 404, "text", "user already exits");
        }
      }
    });
  }
}

function loginController(req, res, data) {
  data = JSON.parse(data);
  console.log(data);
  if (data.email === undefined || data.password === undefined) {
    write(res, 404, "text", "bad Data");
  } else {
    fs.readFile("./database/userDB.json", "utf-8", (error, filedata) => {
      if (error) {
        write(res, 404, "text", "file not found");
      } else {
        filedata = JSON.parse(filedata);
        console.log(filedata.data);
        let status = false;
        filedata.data.forEach((user) => {
          if (user.email === data.email && user.password === data.password) {
            const token = jwt.sign({ user }, "shhhhh");
            write(res, 200, "text", "login successfully", token);
            status = true;
          }
        });
        if (status === false) {
          write(res, 404, "text", "user not found!");
        }
      }
    });
  }
}

function verifyToken(req, res, data) {
  let token = req.headers.cookie;
  let decodedToken = jwt.verify(token, "shhhhh");
  let findUser = decodedToken.user;

  fs.readFile("./database/userDB.json", "utf-8", (error, filedata) => {
    console.log(filedata);
    if (error) {
      write(res, 404, "text", "file not found");
    } else {
      filedata = JSON.parse(filedata);
      data = JSON.parse(data);
      let status = false;
      filedata.data.forEach((user) => {
        if (user.email === data.email && findUser.email === data.email) {
          write(res, 200, "text", "token verify successfully");
          status = true;
        }
      });
      if (status === false) {
        write(res, 404, "text", "user not found!");
      }
    }
  });
}

function requestHandler(req, res) {
  let route = req.url.split("/")[1];
  if (route !== "favicon.ico") {
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
}
