const forwarderOrigin = "http://localhost:9090";

window.user = {
  address: null,
};

const initialize = () => {
  const btnConnect = document.getElementById("btn-connect");
  const btnGetAccount = document.getElementById("btn-get-account");
  const spanAccountInfo = document.getElementById("account-info");
  const btnFetch = document.getElementById("btn-fetch");

  const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

  const onClickInstall = () => {
    btnConnect.innerText = "Onboarding in progress";
    btnConnect.disabled = true;
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then(() => {
          btnConnect.innerText = "Connected";
          btnConnect.disabled = true;
        })
        .catch((err) => {
          if (err.code === 4001) {
            console.log("Please connect to MetaMask.");
          } else {
            console.error(err);
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const metaMaskClientCheck = () => {
    if (!isMetaMaskInstalled()) {
      btnConnect.innerText = "Click here to install MetaMask!";
      btnConnect.onclick = onClickInstall;
      btnConnect.disabled = false;
    } else {
      btnConnect.innerText = "Connect";
      btnConnect.onclick = onClickConnect;
      btnConnect.disabled = false;
    }
  };

  btnGetAccount.addEventListener("click", async () => {
    const accounts = await ethereum.request({ method: "eth_accounts" });

    window.user.address = accounts[0] || null;

    if (window.user.address) {
      spanAccountInfo.innerText = window.user.address;
    }
  });

  btnFetch.addEventListener("click", async () => {
    const api = module.require("api");
    const sdk = api("@opensea/v1.0#7dtmkl3ojw4vb");

    sdk["retrieving-assets-rinkeby"]({
      owner: window.user.address,
      order_direction: "desc",
      offset: "0",
      limit: "20",
      include_orders: "false",
    })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  });

  metaMaskClientCheck();
};

window.addEventListener("DOMContentLoaded", initialize);
