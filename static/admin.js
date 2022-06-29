const initialize = async () => {
  const userInfo = { address: null, email: null };
  const { ethereum, $ } = window;
  const { host } = window.location;

  // eslint-disable-next-line no-undef
  const onboarding = new MetaMaskOnboarding({ host });
  const address = document.getElementById('address');
  const btnFetchUser = document.getElementById('btn-fetch-user');
  const btnFetchNft = document.getElementById('btn-fetch-nft');
  const btnTransferNft = document.getElementById('btn-transfer-nft');

  const isMetaMaskInstalled = () => Boolean(ethereum && ethereum.isMetaMask);

  document.addEventListener('click', (e) => {
    if (e.target?.parentElement.classList.contains('nft-row')) {
      e.target.parentElement.querySelector('input[name="nfts"]').checked = true;
    }
  });

  const fetchUserData = async () => {
    if (!userInfo.address) {
      alert('지갑 연동을 완료해주세요.');
      return;
    }

    const tableBody = document.getElementById('user-table-body');

    tableBody.innerHTML = '';

    fetch('api/fetchUsers')
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }

        const text = await response.text();
        throw new Error(text);
      })
      .then((data) => {
        let htmlString = '';

        for (let i = 0; i < data.length; i += 1) {
          const user = data[i];

          htmlString += `
              <tr>
                <th scope="row">${i + 1}</th>
                <td>${user.email}</td>
                <td>${user.address}</td>
                <td>${user.isSent ? '전송 완료' : '미전송'}</td>
              </tr>
            `;
        }

        tableBody.innerHTML = htmlString;
      })
      .catch((error) => {
        alert(`에러 발생!\n${error}`);
      });
  };

  const fetchNftData = async () => {
    if (!userInfo.address) {
      alert('지갑 연동을 완료해주세요.');
      return;
    }

    const tableBody = document.getElementById('nft-table-body');

    tableBody.innerHTML = '';

    fetch(`./api/fetchAssets/${userInfo.address}`)
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }

        const text = await response.text();
        throw new Error(text);
      })
      .then((data) => {
        const { assets } = data;
        let htmlString = '';

        for (let i = 0; i < assets.length; i += 1) {
          const asset = assets[i];

          htmlString += `
            <tr class="nft-row">
              <td scope="row">
                <input type="radio" name="nfts"
                  data-contract-schema="${asset.asset_contract.schema_name}"
                  data-contract-address="${asset.asset_contract.address}"
                  data-token-id="${asset.token_id}"
                >
              </td>
              <td>
                <a href="${asset.permalink}">
                  <image src="${asset.image_thumbnail_url}">
                </a>
              </td>
              <td>${asset.asset_contract.schema_name}</td>
            </tr>
          `;
        }

        tableBody.innerHTML = htmlString;
      })
      .catch((error) => {
        alert(`에러 발생!\n${error}`);
      });
  };

  function handleNewAccounts(newAccounts) {
    const newAccount = newAccounts[0];

    userInfo.address = newAccount;
    address.value = newAccount;

    fetchNftData();
  }

  const metaMaskClientCheck = async () => {
    if (isMetaMaskInstalled()) {
      ethereum.autoRefreshOnNetworkChange = false;
      ethereum.on('accountsChanged', handleNewAccounts);

      try {
        const newAccounts = await ethereum.request({ method: 'eth_accounts' });
        handleNewAccounts(newAccounts);
      } catch (err) {
        console.error('Error on init when getting accounts', err);
      }
    } else {
      $('#install-modal').modal('show');

      document.getElementById('install').addEventListener('click', async () => {
        onboarding.startOnboarding();
      });
    }
  };

  btnFetchNft.addEventListener('click', fetchNftData);
  btnFetchUser.addEventListener('click', fetchUserData);
  btnTransferNft.addEventListener('click', async () => {
    if (!userInfo.address) {
      alert('지갑 연동을 완료해주세요.');
      return;
    }

    const checkedInput = document.querySelector('#nft-table-body input[name="nfts"]:checked');

    if (!checkedInput) {
      alert('전송할 NFT를 선택해주세요.');
      return;
    }

    btnTransferNft.innerHTML = '<span class="spinner-border spinner-border-sm mr-1 align-middle" role="status" aria-hidden="true"></span>Loading...';
    btnTransferNft.disabled = true;

    const contractSchema = checkedInput.getAttribute('data-contract-schema');
    const contractAddress = checkedInput.getAttribute('data-contract-address');
    const tokenId = checkedInput.getAttribute('data-token-id');

    const parameters = {
      address: userInfo.address,
      type: contractSchema,
      contractAddress,
      tokenId,
    };

    fetch('/api/transferNfts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    })
      .then(async (response) => {
        const text = await response.text();

        if (response.ok) {
          fetchUserData();
          alert(text);
          return;
        }

        throw new Error(text);
      })
      .catch((error) => {
        alert(`에러 발생!\n${error}`);
      })
      .finally(() => {
        btnTransferNft.innerHTML = 'NFT 전송하기';
        btnTransferNft.disabled = false;
      });
  });

  await metaMaskClientCheck();
  fetchUserData();
};

window.addEventListener('DOMContentLoaded', initialize);
