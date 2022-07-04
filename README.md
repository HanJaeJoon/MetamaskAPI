# Web3 API
NFT 수령 신청 및 에어드랍 구현 페이지(rinkeby)

---
### 환경설정(.env)
```
NFT_SENDER_ADDRESS = 전송할 지갑 주소
NFT_SENDER_PRIVATE_KEY = 전송할 지갑 주소 private key(signed trasaction을 위해)

MORALIS_APP_URL = Moralis Dapp URL
MORALIS_APP_ID = Moralis App ID
MORALIS_KEY = Moralis Master Key
MORALIS_SPEEDY_NODE_API_KEY = Moralis Speedy Node Key
```   

![image](https://user-images.githubusercontent.com/31728365/177163062-5cde4847-d5d1-4128-beff-4535782e6ec8.png)
![image](https://user-images.githubusercontent.com/31728365/177163480-fb5e63cf-4c2b-42b3-9dea-0e8005984aee.png)

---

### Email 페이지
https://web3-jj.herokuapp.com/?email=testjj@test.com

1. Metamask 지갑 연동
2. 신청 데이터 Moralis DB에 저장  

![image](https://user-images.githubusercontent.com/31728365/177163848-2b04ec2a-3e28-44ff-b6f7-32bee12594e4.png)


### Admin 페이지
https://web3-jj.herokuapp.com/admin

1. Metamask 지갑 연동
2. 전송할 NFT 선택
3. NFT 전송
4. Opensea(testnet) 결과: [링크](https://testnets.opensea.io/assets/rinkeby/0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656/77184660478739079778493429399302246505128367961362043519940866228197047402596)
  
![image](https://user-images.githubusercontent.com/31728365/177164506-5adf2375-69cd-4768-a149-615415e94f89.png)

### Test 페이지: 기능 확인
https://web3-jj.herokuapp.com/test
- transfer(server): server side NFT 전송(private key 필요)
- transfer(client): client side NFT 전송(confirm 필요)  

![image](https://user-images.githubusercontent.com/31728365/177165581-8ff95c2a-a52b-47a3-9e00-a39a72f20ff6.png)

---

### Docs
- MetaMask API: https://docs.metamask.io/guide/
- OpenSea API: https://docs.opensea.io/reference/api-overview
- Moralis API: https://docs.moralis.io/introduction/readme
  - Web3js: https://web3js.readthedocs.io/en/v1.7.4/
  - Ethers: https://docs.ethers.io/v5/
