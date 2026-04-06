require("dotenv").config({ path: ".env.local" });

const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const app = next({ dev: false, hostname: "marketers-chat.local", port: 3000 });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: fs.readFileSync("./certificates/marketers-chat.local-key.pem"),
      cert: fs.readFileSync("./certificates/marketers-chat.local.pem"),
    },
    (req, res) => handle(req, res, parse(req.url, true))
  ).listen(3000, "marketers-chat.local", () => {
    console.log("> Ready on https://marketers-chat.local:3000");
  });
});
