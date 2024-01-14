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

function challenge2(req, res) {
  write(res, 200, "text", "Challenge 2: Salam!");
}

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

exports.ch2 = challenge2;
exports.ch3 = challenge3;
exports.ch4 = challenge4;
