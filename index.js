import express from "express";
import path from "path";
import cors from "cors";
import api from "api";

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

app
  .options("/api/fetchAssets/:address", cors())
  .get("/api/fetchAssets/:address", cors(), fetchAssets);

const openseaSdk = api('@opensea/v1.0#7dtmkl3ojw4vb');

async function fetchAssets(req, res, next) {
  try {
    let result = await openseaSdk["retrieving-assets-rinkeby"]({
      owner: req.params.address,
      order_direction: "desc",
      offset: "0",
      limit: "20",
      include_orders: "false",
    });
    res.json(result);
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
}
