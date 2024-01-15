const fs = require("fs");
const jwt = require("jsonwebtoken");


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

function GenerateRandomID(lengthID) {
  let characters = "abcdefghiklmnopqrstuvwxyz0123456789";
  let lenString = lengthID;
  let randomstring = "";
  for (let i = 0; i < lenString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomstring += characters.substring(rnum, rnum + 1);
  }

  return randomstring;
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
          let parseData = JSON.parse(data);
          let finalObj = { userId: GenerateRandomID(7), ...parseData };
          filedata.data.push(finalObj);
          filedata = JSON.stringify(filedata);
          fs.writeFile("./database/userDB.json", filedata, "utf8", (error) => {
            if (error) {
              write(res, 404, "text", "fs error");
            } else {
              write(res, 200, "text", "register successfully");
            }
          });
        } else {
          write(res, 403, "text", "email already exists");
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
          write(res, 401, "text", "user not found!");
        }
      }
    });
  }
}

function verifyToken(req, res) {
  let cookie = req.headers.cookie;
  let token = cookie.split("=")[1];
  let decodedToken = jwt.verify(token, "shhhhh");
  console.log(decodedToken.user);
  fs.readFile("./database/userDB.json", function (error, fileData) {
    if (error) {
      write(res, "FILE NOT FOUND.", "text");
    } else {
      fileData = JSON.parse(fileData);
      let found = false;
      fileData.data.forEach((user) => {
        console.log(decodedToken.user);
        if (decodedToken.user.userId === user.userId) {
          found = true;
          write(res, 200, "text", "token valid");
        }
      });
      if (found === false) {
        write(res, 403, "text", "token not valid");
      }
    }
  });
}

exports.register = registerController;
exports.login = loginController;
exports.verify = verifyToken;
