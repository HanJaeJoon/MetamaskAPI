import express from "express";
import path from "path";
import cors from "cors";
import api from "api";
import "dotenv/config";
import Moralis from "moralis/node.js";
import { Network, initializeAlchemy } from "@alch/alchemy-sdk";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

const PORT = process.env.PORT || 9090;
const __dirname = path.resolve();

const app = express();

app
  .use(express.static(path.join(__dirname, "pages")))
  .set("views", path.join(__dirname, "views"))
  .use(express.static(path.join(__dirname, "static")))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("index"))
  .use(express.json())
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app
  .options("/api/fetchAssets/:address", cors())
  .get("/api/fetchAssets/:address", cors(), fetchAssets);

const openseaSdk = api("@opensea/v1.0#7dtmkl3ojw4vb");

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

const serverUrl = process.env.MORALIS_APP_URL;
const appId = process.env.MORALIS_APP_ID;
const moralisSecret = process.env.MORALIS_KEY;

app.post("/api/saveUserData", cors(), async (req, res) => {
  try {
    await Moralis.start({
      serverUrl: serverUrl,
      appId: appId,
      masterKey: moralisSecret,
    });

    let body = req.body;

    const UserAddress = Moralis.Object.extend("UserAddress");
    const userAddress = new UserAddress();

    userAddress.set("address", body.address);
    userAddress.set("email", body.email);

    console.log(userAddress);

    await userAddress.save();
  } catch (e) {
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

app.post("/api/transferAsset", cors(), async (req, res) => {
  try {
    await Moralis.enableWeb3({
      // rinkeby
      chainId: 0x4,
      privateKey: process.env.PRIVATE_KEY,
    });

    await Moralis.start({
      serverUrl: serverUrl,
      appId: appId,
      masterKey: moralisSecret,
    });

    let body = req.body;

    const options = {
      type: "erc1155",
      receiver: body.receiver,
      contractAddress: body.contractAddress,
      tokenId: body.tokenId,
      amount: body.amount,
    };

    let transaction = await Moralis.transfer(options);
    let result = await transaction.wait();
  } catch (e) {
    console.log(e);
    res.status(500).send(`Internal Server Error - ${e.message}`);
  }
});

// const settings = {
//   apiKey: process.env.ALCHEMY_KEY,
//   network: Network.ETH_RINKEBY, // Replace with your network.
//   maxRetries: 10,
// };

// const alchemy = initializeAlchemy(settings);

async function main() {
  const web3 = createAlchemyWeb3(process.env.ALCHEMY_APP_URL);
  const contractAddress = "0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656";
  // const etherScanUrl = `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;

  // console.log(etherScanUrl);

  // fetch(etherScanUrl)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw Error(response.statusText);
  //     } else {
  //       return response.json();
  //     }
  //   })
  //   .then((data) => {
  //     var contractABI = data;
  //     if (contractABI != "") {
  //       console.log(contractABI);
  //       var MyContract = web3.eth.contract(contractABI);
  //       var myContractInstance = MyContract.at(
  //         "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359"
  //       );
  //       var result = myContractInstance.memberId(
  //         "0xfe8ad7dd2f564a877cc23feea6c0a9cc2e783715"
  //       );
  //       var result = myContractInstance.members(1);
  //       console.log("result2 : " + result);
  //     } else {
  //       console.log("Error");
  //     }
  //   });

  //   return;
  const from = "0xAAa4F83dDd55FbBeAe605d4aFd0f2C29826b58bd";
  const to = "0x87Ae5ed8a78f81bFac2B6f028dE2d1d63fa34a41";
  const nonce = await web3.eth.getTransactionCount(
    from,
    "latest"
  );

  const transaction = {
    nonce: nonce,
    from: from,
    to: to,
    gas: 30000,
    maxPriorityFeePerGas: 1000000108,
    contractAddress: contractAddress,
    id: "77184660478739079778493429399302246505128367961362043519940866228197047402596",
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    transaction,
    process.env.PRIVATE_KEY
  );
  
  console.log(signedTx.rawTransaction);

  web3.eth.sendSignedTransaction(
    signedTx.rawTransaction,
    function (error, hash) {
      if (!error) {
        console.log(
          "🎉 The hash of your transaction is: ",
          hash,
          "\n Check Alchemy's Mempool to view the status of your transaction!"
        );
      } else {
        console.log(error);
      }
    }
  );

  /*
  const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

  const tx = {
    from: "0xaaa4f83ddd55fbbeae605d4afd0f2c29826b58bd",
    to: "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656",
    nonce: nonce,
    gas: 30000,
    input: nftContract.methods
      .safeTransferFrom("0xaaa4f83ddd55fbbeae605d4afd0f2c29826b58bd",
       "0x87Ae5ed8a78f81bFac2B6f028dE2d1d63fa34a41",
       "77184660478739079778493429399302246505128367961362043519940866228197047402596")
      .encodeABI(), //I could use also transferFrom
  };

  const signPromise = web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);

  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(err);
          }
        }
      );
    });
    */
}

main();
