import express from 'express';
import path from 'path';
import cors from 'cors';
import api from 'api';
import 'dotenv/config';
// eslint-disable-next-line import/extensions
import Moralis from 'moralis/node.js';
import Web3 from 'web3';

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
      const user = results[i];
      const address = user.get('address');
      const email = user.get('email');
      const isSent = user.get('isSent');

      data.push({ address, email, isSent });
    }

    res.json(data);
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

app.post('/api/transferNfts', cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl,
      appId,
      masterKey: moralisSecret,
    });

    await Moralis.enableWeb3({
      // rinkeby
      chainId: 0x4,
      privateKey: process.env.NFT_SENDER_PRIVATE_KEY,
      provider: 'network',
      speedyNodeApiKey: process.env.MORALIS_SPEEDY_NODE_API_KEY,
    });

    const {
      type, contractAddress, tokenId, address,
    } = req.body;

    // Moralis 보안 정책으로 private key => address 불러오는 것 불가능
    // (User의 private key는 어디에도 저장하지 않는다)
    // 반대로 NFT의 소유권이 해당 private key로 로그인한 사용자에게 있는지를 검증

    // 1. 서버에 저장된 sender address인지 검증
    if (address !== process.env.NFT_SENDER_ADDRESS) {
      res.status(401).send('올바르지 않은 사용자입니다.');
      return;
    }

    // 2. 선택한 NFT의 소유가 sender address인지 검증
    const userNfts = await Moralis.Web3API.token.getTokenIdOwners({
      chain: 'rinkeby',
      address: contractAddress,
      token_id: tokenId,
    });

    const data = userNfts.result;
    let hasOwnership = false;

    for (let i = 0; i < data.length; i += 1) {
      const nft = data[i];

      if (nft.owner_of === 'process.env.NFT_SENDER_ADDRESS') {
        hasOwnership = true;
        break;
      }
    }

    if (!hasOwnership) {
      res.status(401).send('올바르지 않은 사용자입니다.');
      return;
    }

    // receiver 추출
    const UserAddress = Moralis.Object.extend('UserAddress');

    // validation
    const query = new Moralis.Query(UserAddress);
    query.equalTo('isSent', false);
    const results = await query.find();

    if (results.length === 0) {
      res.status(500).send('모두 전송되었습니다.');
      return;
    }

    // NFT 전송
    for (let i = 0; i < results.length; i += 1) {
      const user = results[i];

      try {
        const options = {
          type,
          receiver,
          contractAddress,
          tokenId,
          amount: 1,
        };

        await Moralis.transfer(options);
      } catch (e) {
        console.log(e);
      }
    }

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
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
      privateKey: process.env.NFT_SENDER_PRIVATE_KEY,
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
