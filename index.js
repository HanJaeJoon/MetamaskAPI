import express from 'express';
import path from 'path';
import cors from 'cors';
import api from 'api';
import 'dotenv/config';
// eslint-disable-next-line import/extensions
import Moralis from 'moralis/node.js';

const PORT = process.env.PORT || 9090;
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve();

const app = express();

app
  .set('views', path.join(__dirname, 'views'))
  .use(express.static(path.join(__dirname, 'static')))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('email'))
  .get('/test', (req, res) => res.render('test'))
  .get('/admin', (req, res) => res.render('admin'))
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

app.post('/api/saveUserAddress', cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl,
      appId,
      masterKey: moralisSecret,
    });

    const { body } = req;

    const UserAddress = Moralis.Object.extend('UserAddress');

    // validation
    const query = new Moralis.Query(UserAddress);
    query.equalTo('email', body.email);
    const results = await query.find();

    if (results.length > 0) {
      res.status(500).send('이미 신청한 email입니다.');
      return;
    }

    const userAddress = new UserAddress();

    userAddress.set('address', body.address);
    userAddress.set('email', body.email);

    await userAddress.save();

    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

app.get('/api/fetchUsers', cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl,
      appId,
      masterKey: moralisSecret,
    });

    const UserAddress = Moralis.Object.extend('UserAddress');
    const query = new Moralis.Query(UserAddress);

    const results = await query.find();
    const data = [];

    for (let i = 0; i < results.length; i += 1) {
      const object = results[i];
      const address = object.get('address');
      const email = object.get('email');
      const isSent = object.get('isSent');

      data.push({ address, email, isSent });
    }

    res.json(data);
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

// from test page
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

    await userAddress.save();

    res.sendStatus(200);
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
    } catch (e) {
      console.log(e);
    }

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});
