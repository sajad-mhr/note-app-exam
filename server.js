const http = require("http");
const fs = require("fs");
const PORT = 8080;
const server = http.createServer(requestHandler);
const jwt = require("jsonwebtoken");
const ch2 = require("./modules/ch2")
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
  ch2: ch2.chlnge2,
  ch3: challenge3,
  ch4: challenge4,
  registerApi: registerController,
  loginApi: loginController,
  verifyApi: verifyToken,
  register: registerPageController,
  login: loginPageController,
  notes: notesPageController,
  createNoteApi: createNote,
  deleteNoteApi: deleteNote,
  getNotesApi: getNotes,
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

  //specify the length for the new string
  let lenString = lengthID;
  let randomstring = "";

  //loop to select a new character in each iteration
  for (let i = 0; i < lenString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomstring += characters.substring(rnum, rnum + 1);
  }

  return randomstring;
}

// function challenge2(req, res) {
//   write(res, 200, "text", "Challenge 2: Salam!");
// }
function challenge3(req, res) {
  let ch3 = `<html>
  <head>
      <style>
          div{
              width: 200px;
              height: 100px;
              background-color: lightgreen;
              padding: 30px;
          }
      </style>
      <div>
      <b>Challenge 3:</b>
      <br/>
      <span>Salam!</span>
      </div>
  </head>
  </html>`;
  write(res, 200, "html", ch3);
}
function challenge4(req, res) {
  let textUrl = req.url.split("/")[2];
  console.log(textUrl);
  console.log("this is page1controllerC");
  let ch4 = `<html>
  <head>
      <style>
          div{
              width: 200px;
              height: 100px;
              background-color: lightgreen;
              padding: 30px;
          }
      </style>
      <div>
      <b>Challenge 3:</b>
      <br/>
      <span>Salam!</span>
      <br/>
      <span>${textUrl ? textUrl : "empty"}</span>
      </div>
  </head>
  </html>`;
  write(res, 200, "html", ch4);
}

function createNote(req, res, data) {
  let noteObj = JSON.parse(data);
  if (noteObj.title === undefined || noteObj.body === undefined) {
    write(res, 404, "text", "bad Data");
  } else {
    let cookie = req.headers.cookie;
    if (cookie !== undefined) {
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
              fs.readFile("./database/notes.json", (error, filedata) => {
                if (error) {
                  write(res, 404, "text", "file not found");
                } else {
                  filedata = JSON.parse(filedata);
                  let parseData = JSON.parse(data);
                  let finalObj = {
                    userId: decodedToken.user.userId,
                    noteId: GenerateRandomID(10),
                    ...parseData,
                  };
                  filedata.data.push(finalObj);
                  filedata = JSON.stringify(filedata);
                  fs.writeFile(
                    "./database/notes.json",
                    filedata,
                    "utf8",
                    (error) => {
                      if (error) {
                        write(res, 404, "text", "fs error");
                      } else {
                        write(res, 200, "text", "Note Created");
                      }
                    }
                  );
                }
              });
            }
          });
          if (found === false) {
            write(res, 403, "text", "user not login token not found");
          }
        }
      });
    } else {
      write(res, 403, "text", "user not login token not found");
    }
  }
}
function deleteNote(req, res, data) {
  let noteID = JSON.parse(data);
  if (noteID === undefined) {
    write(res, 404, "text", "bad Data");
  } else {
    let cookie = req.headers.cookie;
    if (cookie !== undefined) {
      let token = cookie.split("=")[1];
      let decodedToken = jwt.verify(token, "shhhhh");
      fs.readFile("./database/userDB.json", function (error, fileData) {
        if (error) {
          write(res, "FILE NOT FOUND.", "text");
        } else {
          fileData = JSON.parse(fileData);
          let found = false;
          fileData.data.forEach((user) => {
            if (decodedToken.user.userId === user.userId) {
              found = true;
              fs.readFile("./database/notes.json", (error, filedata) => {
                if (error) {
                  write(res, 404, "text", "file not found");
                } else {
                  data = JSON.parse(data);
                  filedata = JSON.parse(filedata);
                  let foundNote = false;
                  filedata.data.forEach((note) => {
                    if (note.noteId === data.noteId) {
                      foundNote = true;
                      let remove = filedata.data.filter((note) => {
                        return note.noteId !== data.noteId;
                      });
                      filedata.data = [];
                      if (remove[0] !== undefined) {
                        remove.forEach((note) => {
                          filedata.data.push(note);
                        });
                      }
                      console.log(filedata);
                      fs.writeFile(
                        "./database/notes.json",
                        JSON.stringify(filedata),
                        "utf8",
                        (error) => {
                          if (error) {
                            write(res, 404, "text", "fs error");
                          } else {
                            write(res, 200, "text", "delete note");
                          }
                        }
                      );
                    }
                  });
                  if (foundNote === false) {
                    write(res, 200, "text", "note not found");
                  }
                }
              });
            }
          });
          if (found === false) {
            write(res, 403, "text", "user not login token not found");
          }
        }
      });
    } else {
      write(res, 403, "text", "user not login token not found");
    }
  }
}

function getNotes(req, res) {
  let cookie = req.headers.cookie;
  if (cookie !== undefined) {
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
            fs.readFile("./database/notes.json", "utf-8", (error, data) => {
              if (error) {
                write(res, 404, "text", "not found");
              } else {
                data = JSON.parse(data);
                console.log(data.data);
                let userNotes = data.data.filter((note) => {
                  return note.userId === decodedToken.user.userId;
                });
                write(res, 200, "json", JSON.stringify(userNotes));
              }
            });
          }
        });
        if (found === false) {
          write(res, 403, "text", "user not login token not found");
        }
      }
    });
  } else {
    write(res, 403, "text", "user not login token not found");
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
          write(res, 403, "text", "user already exits");
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
