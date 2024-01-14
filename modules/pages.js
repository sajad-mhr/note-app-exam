const fs = require("fs");

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

function notesPageController(req, res) {
  fs.readFile("./pages/homePage/notesPage.html", (error, data) => {
    if (error) {
      write(res, 404, "text", "not found");
    } else {
      write(res, 200, "html", data);
    }
  });
}

exports.register = registerPageController;
exports.login = loginPageController;
exports.notes = notesPageController;