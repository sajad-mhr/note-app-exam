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

exports.get = getNotes;
exports.create = createNote;
exports.delete = deleteNote;
