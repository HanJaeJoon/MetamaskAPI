import express from 'express';
import path from 'path';
import cors from 'cors';
import api from 'api';
import 'dotenv/config';
import Moralis from 'moralis/node.js';

const PORT = process.env.PORT || 9090;
const __dirname = path.resolve();

const app = express();

app
  .use(express.static(path.join(__dirname, 'pages')))
  .set('views', path.join(__dirname, 'views'))
  .use(express.static(path.join(__dirname, 'static')))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index'))
  .use(express.json())
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// testnet
const openseaSdk = api('@opensea/v1.0#7dtmkl3ojw4vb');

app
  .options('/api/fetchAssets/:address', cors())
  .get('/api/fetchAssets/:address', cors(), async (req, res) => {
    try {
      const result = await openseaSdk['retrieving-assets-rinkeby']({
        owner: req.params.address,
        order_direction: 'desc',
        offset: '0',
        limit: '20',
        include_orders: 'false',
      });
      res.json(result);
    } catch (e) {
      res.status(500).send(`Internal Server Error - ${e.message}`);
    }
  });

const serverUrl = process.env.MORALIS_APP_URL;
const appId = process.env.MORALIS_APP_ID;
const moralisSecret = process.env.MORALIS_KEY;

app.post('/api/saveUserData', cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl,
      appId,
      masterKey: moralisSecret,
    });

    const { body } = req;

    const UserAddress = Moralis.Object.extend('UserAddress');
    const userAddress = new UserAddress();

    userAddress.set('address', body.address);
    userAddress.set('email', body.email);

    console.log(userAddress);

    await userAddress.save();
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

app.post('/api/transferAsset', cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl,
      appId,
      masterKey: moralisSecret,
    });

    await Moralis.enableWeb3({
      // rinkeby
      chainId: 0x4,
      privateKey: process.env.PRIVATE_KEY,
      provider: 'network',
      speedyNodeApiKey: process.env.MORALIS_SPEEDY_NODE_API_KEY,
    });

    const { body } = req;

    const options = {
      type: body.type,
      receiver: body.receiver,
      contractAddress: body.contractAddress,
      tokenId: body.tokenId,
      amount: body.amount,
    };

    try {
      await Moralis.transfer(options);
    } catch (error) {
      console.log(error);
    }

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});
