import express from "express";
import path from "path";

const PORT = process.env.PORT || 9090;
const __dirname = path.resolve();

const app = express();

app
  .use(express.static(path.join(__dirname, "pages")))
  .set("views", path.join(__dirname, "views"))
  .use(express.static(path.join(__dirname, "static")))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("index"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));