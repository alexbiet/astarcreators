window.addEventListener("load", async () => {
  document.getElementById("btn-connect").addEventListener("click", () => {
    window.ethereum.send("eth_requestAccounts").then(fetchAccountData(false));
  });

  document
    .getElementById("btn-disconnect")
    .addEventListener("click", onDisconnect);
  try {
    if (
      ethereum.selectedAddress &&
      localStorage.getItem("CACHED_PROVIDER") === "TRUE"
    ) {
      fetchAccountData(false);
    } else {
      fetchAccountData(true);
    }
  } catch (error) {
    console.log("Error connecting to metamask account:\n", error);
    fetchAccountData(true);
  }

  // theme light/dark
  if (localStorage.getItem("smart-wallet-theme")) {
    if (localStorage.getItem("smart-wallet-theme") == "light") {
      $("body").removeClass("bg-dark");
      $("#modeButton i").removeClass().toggleClass("bi bi-moon");
    } else {
      $("body").addClass("bg-dark");
      $("#modeButton i").removeClass().toggleClass("bi bi-sun");
      localStorage.setItem("smart-wallet-theme", "dark");
    }
  }
});

function onDisconnect() {
  alert("To disconnect, open MetaMask and manualy disconnect.");

  document.getElementById("not-connected").style.display = "block";
  document.getElementById("nav-my-wallet-disabled").style.display = "block";
  document.getElementById("nav-min-nft-disabled").style.display = "block";
  document.getElementById("connected").style.display = "none";
  document.getElementById("nav-my-wallet-enabled").style.display = "none";
  document.getElementById("nav-min-nft-enabled").style.display = "none";
}

async function fetchAccountData(noWeb3) {
  let provider;
  let signer;
  let account;
  if (!noWeb3) {
    try {
      provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
      account = await provider.send("eth_requestAccounts").then((accounts) => {
        return accounts[0];
      });
      let balance = await provider.getBalance(account);
      let formatedBalance = ethers.BigNumber.from(balance);
      formatedBalance = balance.mod(1e14);
      formatedBalance = ethers.utils.formatEther(balance.sub(formatedBalance));

      //updateHTMLElements network/balances/button
      document.getElementById("selected-account").innerHTML = `(${
        account.substring(0, 6) + "..." + account.slice(-4)
      })`;
      document.getElementById(
        "account-balance"
      ).innerHTML = `${formatedBalance} ${
        chainIdMap[ethereum.networkVersion].symbol
      }`;
      document.getElementById("network-name").innerHTML = `${
        chainIdMap[ethereum.networkVersion].name
      }`;

      document.getElementById("not-connected").style.display = "none";
      document.getElementById("nav-my-wallet-not-connected").style.display =
        "none";
      document.getElementById("nav-mint-nft-not-connected").style.display =
        "none";

      document.getElementById("connected").style.display = "block";
      document.getElementById("nav-my-wallet-connected").style.display =
        "block";
      document.getElementById("nav-mint-nft-connected").style.display = "block";

      localStorage.setItem("CACHED_PROVIDER", "TRUE");
    } catch (error) {
      console.log("Error connecting to metamask account:\n", error);
    }
  }
  if (!noWeb3)
    ethereum.on("accountsChanged", (accounts) => {
      if (accounts[0]) {
        fetchAccountData(false);
      } else {
        localStorage.removeItem("CACHED_PROVIDER");

        document.getElementById("not-connected").style.display = "block";
        document.getElementById("connected").style.display = "none";
      }
    });
  if (!noWeb3)
    ethereum.on("chainChanged", (chainId) => {
      fetchAccountData(false);
    });
  let chain;
  let symbol;
  if (!noWeb3) chain = chainIdMap[Number(ethereum.chainId)].name;
  if (!noWeb3) symbol = chainIdMap[Number(ethereum.chainId)].symbol;
  let MARKET_WRITE;
  let MARKET_READ;
  let DAPPS_WRITE;
  let DAPPS_READ;
  if (!noWeb3) {
    MARKET_WRITE = new ethers.Contract(
      addresses[chain].marketplace,
      abis.marketplace,
      signer
    );
    MARKET_READ = new ethers.Contract(
      addresses[chain].marketplace,
      abis.marketplace,
      provider
    );

    DAPPS_WRITE = new ethers.Contract(
      addresses[chain].dAppsStaking,
      abis.dAppsStaking,
      signer
    );
    DAPPS_READ = new ethers.Contract(
      addresses[chain].dAppsStaking,
      abis.dAppsStaking,
      provider
    );
    //mintFaceNFT();
    // document.getElementById("mint-face").addEventListener("click", mintFaceNFT);
    // async function mintFaceNFT() {
    //   let faceMinter = new ethers.Contract(addresses[chain].faceMinter, abis.faceMinter, signer);
    //   faceMinter.safeMint(account);
    // }
  }
  //approveNFT(addresses[chain].faceMinter, 1);
  async function approveNFT(_NFTContract, _tokenId) {
    let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
    NFTContract.approve(addresses[chain].marketplace, _tokenId);
  }

  document.getElementById("approve-all").addEventListener("click", () => {
    approveAll(addresses[chain].astarMinter, true);
  });

  async function approveAll(_NFTContract, _bool) {
    let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
    NFTContract.setApprovalForAll(addresses[chain].marketplace, _bool);
  }

  let inputEl2 = document.getElementById("contract-input");
  document.getElementById("contract-btn").addEventListener("click", () => {
    trustedContracts.push(inputEl2.value);
    fetchWalletCards(8, trustedContracts);
  });

  // let inputEl = document.getElementById("list-input");
  // document.getElementById("list-face").addEventListener("click", () => {

  //   //approveNFT(addresses[chain].faceMinter, inputEl.value);
  //   listMarketItem(addresses[chain].faceMinter, inputEl.value, 1000000000000000);});

  async function listMarketItem(_NFTContract, _tokenId, _price) {
    MARKET_WRITE.createMarketItem(_NFTContract, _tokenId, _price);
  }

  async function cancelMarketItem(_NFTContract, _marketItemId) {
    MARKET_WRITE.cancelMarketItem(_NFTContract, _marketItemId);
  }

  async function delistCollection(_collectionId) {
    MARKET_WRITE.delistCollection(_collectionId);
  }

  async function buyMarketItem(_NFTContract, _marketId, _price) {
    MARKET_WRITE.createMarketSale(_NFTContract, _marketId, { value: _price });
  }

  async function fetchSellingItemsArray() {
    let marketItems = await MARKET_WRITE.fetchSellingMarketItems();
    let marketNFTs = [];
    for (let i = 0; i < marketItems.length; i++) {
      marketNFTs.push({});
      marketNFTs[i].marketId = ethers.utils.formatUnits(marketItems[i][0], 0);
      marketNFTs[i].contractAddress = marketItems[i][1];
      marketNFTs[i].tokenId = ethers.utils.formatUnits(marketItems[i][2], 0);
      marketNFTs[i].creator = marketItems[i][3]; //?
      marketNFTs[i].seller = marketItems[i][4];
      marketNFTs[i].owner = marketItems[i][5];
      marketNFTs[i].price = ethers.utils.formatUnits(marketItems[i][6], 18);
      marketNFTs[i].priceBN = marketItems[i][6];
      marketNFTs[i].sold = marketItems[i][7];
      marketNFTs[i].canceled = marketItems[i][8];
      let NFTContract = new ethers.Contract(
        marketNFTs[i].contractAddress,
        abis.ERC721,
        provider
      );
      marketNFTs[i].tokenURI = await NFTContract.tokenURI(
        marketNFTs[i].tokenId
      );
      marketNFTs[i].name = await NFTContract.name();
    }

    return marketNFTs;
  }

  async function fetchNFTsFromContracts(nftContracts) {
    let NFTArray = [];
    for (let i = 0; i < nftContracts.length; i++) {
      let NFTContract = new ethers.Contract(
        nftContracts[i],
        abis.ERC721,
        provider
      );
      let userbalance = await NFTContract.balanceOf(account);
      let currentOwner;

      if (userbalance > 0) {
        for (let x = 0; x <= 100; x++) {
          try {
            currentOwner = await NFTContract.ownerOf(x);
            if (currentOwner.toLowerCase() == account.toLowerCase()) {
              let cardOBJ = {
                name: await NFTContract.name(),
                tokenURI: await NFTContract.tokenURI(x),
                tokenId: x,
                contractAddress: NFTContract.address,
              };
              NFTArray.push(cardOBJ);
            }
          } catch (e) {
            x = 101;
          }
        }
      }
    }

    return NFTArray;
  }

  async function fetchMarketItemsArray() {
    let marketItems = await MARKET_READ.fetchAvailableMarketItems();
    let marketNFTs = [];
    for (let i = 0; i < marketItems.length; i++) {
      marketNFTs.push({});
      marketNFTs[i].marketId = ethers.utils.formatUnits(marketItems[i][0], 0);
      marketNFTs[i].contractAddress = marketItems[i][1];
      marketNFTs[i].tokenId = ethers.utils.formatUnits(marketItems[i][2], 0);
      marketNFTs[i].creator = marketItems[i][3]; //?
      marketNFTs[i].seller = marketItems[i][4];
      marketNFTs[i].owner = marketItems[i][5];
      marketNFTs[i].price = ethers.utils.formatUnits(marketItems[i][6], 18);
      marketNFTs[i].priceBN = marketItems[i][6];
      marketNFTs[i].sold = marketItems[i][7];
      marketNFTs[i].canceled = marketItems[i][8];
      let NFTContract = new ethers.Contract(
        marketNFTs[i].contractAddress,
        abis.ERC721,
        provider
      );
      marketNFTs[i].tokenURI = await NFTContract.tokenURI(
        marketNFTs[i].tokenId
      );
      marketNFTs[i].name = await NFTContract.name();
    }
    return marketNFTs;
  }

  let nftContracts = trustedContracts[chain];

  fetchExploreCards(34);
  if (noWeb3) {
    document.getElementById("collectionsListing").innerHTML = `
    <div class="col">
    <div class="card">
      <div class="card__inner" style="transform: rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) perspective(0px);">

      <div class="container text-center border-bottom">
        <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

          <div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeih7d6rpgazb5mxo3obymzp2tsjxlkyltulnru3g4hxm6m2neprnnq/pixel-alex-1.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidxwwep4ohgltt4jyywf3jcryvbkdgb7yew7pdffdfcs3sqt4xksa/pixel-alex-2.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihrywu6wr3vzq6v7egwd2orkv2567l5klh2rcycfxrux5xvfv335u/pixel-alex-3.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicbsvxxqosyyrymft4oft2nm6yc72z246uybalpoqzjohm7mbq2ge/pixel-albo-1.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicr57y2p7r3wjfarktmhtkkulb6geojobuovpe36aoiqcanqwsym4/pixel-albo-2.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidtbspiowvcdezsu2i7dvnefqwkvwpv4j4npwaj4qlnjkhbjpa2ia/pixel-albo-3.png');"> </div></div>

        </div>
      </div>
      
      <div class="card-body">
        <div class="row text-center border-bottom pb-3 mb-3">
          <div class="col"> 
              <p class="card-text"><strong>Pixel Avatars</strong></p>
          </div>
        </div>
    
        <small>
          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">5.11 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Status: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">Stake removed!</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APR: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">2</p>
            </div>
          </div>

          <div class="row">
              <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
              </div>
              <div class="col ps-1">
              <p class="card-text">6</p>
              </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Creator: </strong></p>  
              </div>
              <div class="col ps-1">
                <p class="card-text">0x64fA...3184</p>
              </div>
          </div>
        </small>
        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake-0">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="button-explore-stake-0">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-0">Unstake</button>
            </div>

            <button class="btn btn-sm btn-outline-success my-2" type="button" id="button-explore-withdraw-0">Withdraw</button>

            <button class="btn btn-sm btn-outline-warning my-2" type="button" id="button-explore-claim-rewards-0">Claim Rewards</button>

          </div>
        </div>

        <div class="row text-center">
          <div class="col text-start">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-0">View</button>
          </div>

          <div class="col text-end">
            <button id="report-0" type="button" class="btn btn-sm btn-link light-grey">Report</button>
          </div>
        </div>

      </div>


      <div class="lux" style="background: linear-gradient(-49.7165deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 80%); display: none;"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="collection-explore-modal-0" tabindex="-1" aria-labelledby="collection-explore-aria-modal--0" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="collection-explore-aria-modal-0">Pixel Avatars</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-6">
        <div class="container text-center">

          <div class="row row-cols-1">   
            <div class="col text-start">
              <p class="card-text"><strong>Collection NFTs:</strong></p>
            </div>
          </div>

          <div id="explore-collection-nfts-modal-0" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3">
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeih7d6rpgazb5mxo3obymzp2tsjxlkyltulnru3g4hxm6m2neprnnq/pixel-alex-1.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Alex #24</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.2 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-26">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy0">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidxwwep4ohgltt4jyywf3jcryvbkdgb7yew7pdffdfcs3sqt4xksa/pixel-alex-2.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Alex #25</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.4 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-27">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy1">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihrywu6wr3vzq6v7egwd2orkv2567l5klh2rcycfxrux5xvfv335u/pixel-alex-3.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Alex #26</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.6 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-28">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy2">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicbsvxxqosyyrymft4oft2nm6yc72z246uybalpoqzjohm7mbq2ge/pixel-albo-1.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Albo #27</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.2 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-29">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy3">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicr57y2p7r3wjfarktmhtkkulb6geojobuovpe36aoiqcanqwsym4/pixel-albo-2.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Albo #28</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.4 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-30">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy4">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidtbspiowvcdezsu2i7dvnefqwkvwpv4j4npwaj4qlnjkhbjpa2ia/pixel-albo-3.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pixel Albo #29</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">0.6 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-31">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-0" id="nftcard-buy5">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div></div>

        </div>
      </div>


      <div class="col-1"> </div>

      <div class="col-4">

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Name: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Pixel Avatars</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Description: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Pixel Avatars is a fantastic customisable collection of virtual avatars. </p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>TVL: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">5.11 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Your Stake: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Status: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">Stake removed!</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>APR: </strong></p>       
          </div>
          <div class="col ps-1">
            <p class="card-text">94.4%</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Stakers: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">2</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Total NFTs: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">6</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Creator: </strong></p>  
          </div>
          <div class="col ps-1">
            <p class="card-text">0x64fA...3184</p>
          </div>
        </div>

        <div class="row pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake-0">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="modal-button-explore-stake-0">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-0">Unstake</button>
            </div>

            <button class="btn btn-outline-success my-2" type="button" id="modal-button-explore-withdraw-0">Withdraw</button>

            <button class="btn btn-outline-warning my-2" type="button" id="modal-button-explore-claim-rewards-0">Claim Rewards</button>

          </div>
        </div> 
        
      
      </div>
    </div>
        
</div>
  </div>
  </div>
  </div>
    <div class="col">
    <div class="card">
      <div class="card__inner" style="transform: rotateX(-2.26282deg) rotateY(1.23242deg) scale3d(1.025, 1.025, 1.025) perspective(1000px);">

      <div class="container text-center border-bottom">
        <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

          <div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiave2kqs4hy4dxluojfgybrsht6uit6mfscdfrruxvotwn2rwxdeu/bonsai-1.jpg');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeig4xwfz6rf33gjjsrgy2tr3v2picajhycdvan4qxyinha52dupb2y/bonsai-2.jpg');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifjrmxxop7fzh7nmkup2xaspf5l7savnqhm3dk2hzbbyghitox5am/bonsai-4.jpg');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigluz2gvrzhm3eyj4qjbfbrrwcvxmfsd2gatr2t4bcasv7matez5q/bonsai-5.jpg');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihkdcqky3amgvf6houimzg5fv4z57vixkdodz6n7pwuzcp6cmeuse/bonsai-6.jpg');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigeq4qkyhdsml37uw6wh7lkwg6kl2mocdmf652dtqq6ufdfpib44q/bonsai-3.jpg');"> </div></div>

        </div>
      </div>
      
      <div class="card-body">
        <div class="row text-center border-bottom pb-3 mb-3">
          <div class="col"> 
              <p class="card-text"><strong>Bonsai Collection</strong></p>
          </div>
        </div>
    
        <small>
          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">17.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">4.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Status: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">Withdrawable</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APR: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">3</p>
            </div>
          </div>

          <div class="row">
              <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
              </div>
              <div class="col ps-1">
              <p class="card-text">6</p>
              </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Creator: </strong></p>  
              </div>
              <div class="col ps-1">
                <p class="card-text">0x64fA...3184</p>
              </div>
          </div>
        </small>
        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake-1">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="button-explore-stake-1">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-1">Unstake</button>
            </div>

            <button class="btn btn-sm btn-outline-success my-2" type="button" id="button-explore-withdraw-1">Withdraw</button>

            <button class="btn btn-sm btn-outline-warning my-2" type="button" id="button-explore-claim-rewards-1">Claim Rewards</button>

          </div>
        </div>

        <div class="row text-center">
          <div class="col text-start">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-1">View</button>
          </div>

          <div class="col text-end">
            <button id="report-1" type="button" class="btn btn-sm btn-link light-grey">Report</button>
          </div>
        </div>

      </div>


      <div class="lux" style="background: linear-gradient(-28.5745deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 80%);"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="collection-explore-modal-1" tabindex="-1" aria-labelledby="collection-explore-aria-modal--1" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="collection-explore-aria-modal-1">Bonsai Collection</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-6">
        <div class="container text-center">

          <div class="row row-cols-1">   
            <div class="col text-start">
              <p class="card-text"><strong>Collection NFTs:</strong></p>
            </div>
          </div>

          <div id="explore-collection-nfts-modal-1" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3">
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiave2kqs4hy4dxluojfgybrsht6uit6mfscdfrruxvotwn2rwxdeu/bonsai-1.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Bonsai Ono #30</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-32">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy0">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeig4xwfz6rf33gjjsrgy2tr3v2picajhycdvan4qxyinha52dupb2y/bonsai-2.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Pure Bonsai #31</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.2 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-33">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy1">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifjrmxxop7fzh7nmkup2xaspf5l7savnqhm3dk2hzbbyghitox5am/bonsai-4.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Forrest Bonsai #33</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.4 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-34">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy2">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigluz2gvrzhm3eyj4qjbfbrrwcvxmfsd2gatr2t4bcasv7matez5q/bonsai-5.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Autumn Bonsai #34</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.6 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-35">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy3">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihkdcqky3amgvf6houimzg5fv4z57vixkdodz6n7pwuzcp6cmeuse/bonsai-6.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Super Bonsai #35</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">2.2 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-36">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy4">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigeq4qkyhdsml37uw6wh7lkwg6kl2mocdmf652dtqq6ufdfpib44q/bonsai-3.jpg');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Lively Bonsai #42</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.8 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-37">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-1" id="nftcard-buy5">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div></div>

        </div>
      </div>


      <div class="col-1"> </div>

      <div class="col-4">

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Name: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Bonsai Collection</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Description: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">A wonderful collection of virtual bonsais, most hand drawn by Tim Cantor.</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>TVL: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">17.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Your Stake: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">4.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Status: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">Withdrawable</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>APR: </strong></p>       
          </div>
          <div class="col ps-1">
            <p class="card-text">94.4%</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Stakers: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">3</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Total NFTs: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">6</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Creator: </strong></p>  
          </div>
          <div class="col ps-1">
            <p class="card-text">0x64fA...3184</p>
          </div>
        </div>

        <div class="row pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake-1">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="modal-button-explore-stake-1">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-1">Unstake</button>
            </div>

            <button class="btn btn-outline-success my-2" type="button" id="modal-button-explore-withdraw-1">Withdraw</button>

            <button class="btn btn-outline-warning my-2" type="button" id="modal-button-explore-claim-rewards-1">Claim Rewards</button>

          </div>
        </div> 
        
      
      </div>
    </div>
        
</div>
  </div>
  </div>
  </div>
    <div class="col">
    <div class="card">
      <div class="card__inner">

      <div class="container text-center border-bottom">
        <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

          <div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihlzc6kjxrp36wb2yuardu2fmbwwx5wdquzaak3koyx3mjg7o5eqa/fake-ape-1.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicagw5qm6m3om5ozi2rnryoaw46bmiuhhfebjdcl2vlr5xixu6biq/fake-ape-2.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeieipkkop2hajcv5fvs6uur7o6nsnh4dhzw5aus3ihbsiss5j4zvmm/fake-ape-3.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifot6qnx76455cutnlwdnnxke5ngadn4swt66tnaht3updcp4hkh4/fake-ape-4.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigyqi4mh3c4yixrtac5bwbz3d3igda6dopb6tno4uarkd52xuxd5y/fake-ape-5.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidnrmmgmlxnzotkcvvm2txjzft4oteldi5nkkx6kxkh3ho4iqhw7m/fake-ape-6.png');"> </div></div>

        </div>
      </div>
      
      <div class="card-body">
        <div class="row text-center border-bottom pb-3 mb-3">
          <div class="col"> 
              <p class="card-text"><strong>Fake Ape Collections</strong></p>
          </div>
        </div>
    
        <small>
          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">8.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">3.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Status: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">Staked</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APR: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">2</p>
            </div>
          </div>

          <div class="row">
              <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
              </div>
              <div class="col ps-1">
              <p class="card-text">6</p>
              </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Creator: </strong></p>  
              </div>
              <div class="col ps-1">
                <p class="card-text">0x64fA...3184</p>
              </div>
          </div>
        </small>
        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake-2">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="button-explore-stake-2">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-2">Unstake</button>
            </div>

            <button class="btn btn-sm btn-outline-success my-2" type="button" id="button-explore-withdraw-2">Withdraw</button>

            <button class="btn btn-sm btn-outline-warning my-2" type="button" id="button-explore-claim-rewards-2">Claim Rewards</button>

          </div>
        </div>

        <div class="row text-center">
          <div class="col text-start">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-2">View</button>
          </div>

          <div class="col text-end">
            <button id="report-2" type="button" class="btn btn-sm btn-link light-grey">Report</button>
          </div>
        </div>

      </div>


      <div class="lux"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="collection-explore-modal-2" tabindex="-1" aria-labelledby="collection-explore-aria-modal--2" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="collection-explore-aria-modal-2">Fake Ape Collections</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-6">
        <div class="container text-center">

          <div class="row row-cols-1">   
            <div class="col text-start">
              <p class="card-text"><strong>Collection NFTs:</strong></p>
            </div>
          </div>

          <div id="explore-collection-nfts-modal-2" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3">
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeihlzc6kjxrp36wb2yuardu2fmbwwx5wdquzaak3koyx3mjg7o5eqa/fake-ape-1.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Party Boy #36</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-38">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy0">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeicagw5qm6m3om5ozi2rnryoaw46bmiuhhfebjdcl2vlr5xixu6biq/fake-ape-2.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Tart #37</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-39">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy1">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeieipkkop2hajcv5fvs6uur7o6nsnh4dhzw5aus3ihbsiss5j4zvmm/fake-ape-3.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Leopard #38</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-40">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy2">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifot6qnx76455cutnlwdnnxke5ngadn4swt66tnaht3updcp4hkh4/fake-ape-4.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Poked Eye #39</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-41">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy3">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeigyqi4mh3c4yixrtac5bwbz3d3igda6dopb6tno4uarkd52xuxd5y/fake-ape-5.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Captain #40</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-42">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy4">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeidnrmmgmlxnzotkcvvm2txjzft4oteldi5nkkx6kxkh3ho4iqhw7m/fake-ape-6.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Fake Ape Cool #41</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">1.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-43">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-2" id="nftcard-buy5">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div></div>

        </div>
      </div>


      <div class="col-1"> </div>

      <div class="col-4">

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Name: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Fake Ape Collections</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Description: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">These apes are bored, but they ain't real. Go to BoredApeYachtClub.com for the real ones.</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>TVL: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">8.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Your Stake: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">3.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Status: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">Staked</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>APR: </strong></p>       
          </div>
          <div class="col ps-1">
            <p class="card-text">94.4%</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Stakers: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">2</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Total NFTs: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">6</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Creator: </strong></p>  
          </div>
          <div class="col ps-1">
            <p class="card-text">0x64fA...3184</p>
          </div>
        </div>

        <div class="row pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake-2">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="modal-button-explore-stake-2">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-2">Unstake</button>
            </div>

            <button class="btn btn-outline-success my-2" type="button" id="modal-button-explore-withdraw-2">Withdraw</button>

            <button class="btn btn-outline-warning my-2" type="button" id="modal-button-explore-claim-rewards-2">Claim Rewards</button>

          </div>
        </div> 
        
      
      </div>
    </div>
        
</div>
  </div>
  </div>
  </div>
    <div class="col">
    <div class="card">
      <div class="card__inner">

      <div class="container text-center border-bottom">
        <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

          <div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiafli53hj33dmqy7arnwlzsocarbrtkti4hxaninibq2caj3mpn3a/face-1.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiba64p42zkd6dpsb3ao4piax7v7ywgzocgeidfqgcef4mwpcvqe4i/face-2.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeig4oym3ccosmeij5twhochqkwev5aihsotfjwa47woudlm22exn2i/face-3.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifomlu66wmduj3kvs4ukp3pqztmcayg22g5rri3466jlyvslhdj5y/face-4.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeibhmowejnz7s6ogloubyz7o5o77yc766kr4tuwt6tz4vrsnrye4fu/face-5.png');"> </div></div><div class="col"><div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeian564d6exhsufrzax7vylwwynpbh2s66ijvloy52mn24iwspz67a/face-6.png');"> </div></div>

        </div>
      </div>
      
      <div class="card-body">
        <div class="row text-center border-bottom pb-3 mb-3">
          <div class="col"> 
              <p class="card-text"><strong>Smiley Faces</strong></p>
          </div>
        </div>
    
        <small>
          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">7.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">2.0 SBY</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Status: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">Staked</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APR: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">2</p>
            </div>
          </div>

          <div class="row">
              <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
              </div>
              <div class="col ps-1">
              <p class="card-text">6</p>
              </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Creator: </strong></p>  
              </div>
              <div class="col ps-1">
                <p class="card-text">0x64fA...3184</p>
              </div>
          </div>
        </small>
        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake-3">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="button-explore-stake-3">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-3">Unstake</button>
            </div>

            <button class="btn btn-sm btn-outline-success my-2" type="button" id="button-explore-withdraw-3">Withdraw</button>

            <button class="btn btn-sm btn-outline-warning my-2" type="button" id="button-explore-claim-rewards-3">Claim Rewards</button>

          </div>
        </div>

        <div class="row text-center">
          <div class="col text-start">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-3">View</button>
          </div>

          <div class="col text-end">
            <button id="report-3" type="button" class="btn btn-sm btn-link light-grey">Report</button>
          </div>
        </div>

      </div>


      <div class="lux"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="collection-explore-modal-3" tabindex="-1" aria-labelledby="collection-explore-aria-modal--3" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="collection-explore-aria-modal-3">Smiley Faces</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-6">
        <div class="container text-center">

          <div class="row row-cols-1">   
            <div class="col text-start">
              <p class="card-text"><strong>Collection NFTs:</strong></p>
            </div>
          </div>

          <div id="explore-collection-nfts-modal-3" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3">
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiafli53hj33dmqy7arnwlzsocarbrtkti4hxaninibq2caj3mpn3a/face-1.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Smirky Blue #43</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">5.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-44">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy0">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeiba64p42zkd6dpsb3ao4piax7v7ywgzocgeidfqgcef4mwpcvqe4i/face-2.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Hyped Orange #44</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">5.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-45">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy1">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeig4oym3ccosmeij5twhochqkwev5aihsotfjwa47woudlm22exn2i/face-3.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Angry Red #45</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">5.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-46">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy2">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeifomlu66wmduj3kvs4ukp3pqztmcayg22g5rri3466jlyvslhdj5y/face-4.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Cool Green #46</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">5.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-47">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy3">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeibhmowejnz7s6ogloubyz7o5o77yc766kr4tuwt6tz4vrsnrye4fu/face-5.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Sus Purple #47</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">5.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-48">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy4">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('https://ipfs.io/ipfs/bafybeian564d6exhsufrzax7vylwwynpbh2s66ijvloy52mn24iwspz67a/face-6.png');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>Crazy Yellow #48</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">10.0 SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">0x64fA...3184</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-49">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyCollectionModal-3" id="nftcard-buy5">Buy</button>
                    </div>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div></div>

        </div>
      </div>


      <div class="col-1"> </div>

      <div class="col-4">

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Name: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Smiley Faces</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Description: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">Some say these smilies are on LSD, but we like them just the way they are. Collect your favourite smiley today!</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>TVL: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">7.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Your Stake: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">2.0 SBY</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Status: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">Staked</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>APR: </strong></p>       
          </div>
          <div class="col ps-1">
            <p class="card-text">94.4%</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Stakers: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">2</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Total NFTs: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">6</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Creator: </strong></p>  
          </div>
          <div class="col ps-1">
            <p class="card-text">0x64fA...3184</p>
          </div>
        </div>

        <div class="row pb-3 mb-3">
          <div class="col text-center">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake-3">
              <span class="input-group-text">SBY</span>
              <button class="btn btn-primary" type="button" id="modal-button-explore-stake-3">Stake</button>
              <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-3">Unstake</button>
            </div>

            <button class="btn btn-outline-success my-2" type="button" id="modal-button-explore-withdraw-3">Withdraw</button>

            <button class="btn btn-outline-warning my-2" type="button" id="modal-button-explore-claim-rewards-3">Claim Rewards</button>

          </div>
        </div> 
        
      
      </div>
    </div>
        
</div>
  </div>
  </div>
  </div>`;
    cardEffect("#collectionsListing");
  }
  fetchExploreCollectionCards(24);
  fetchWalletCards(24, nftContracts);
  fetchMarketplaceCards(30, "marketplace");
  fetchMarketplaceCardsCollectionModal(60);
  fetchCollections();

  async function fetchExploreCards(maxAmount) {
    let marketNFTsEl = document.getElementById("market-NFTs");
    let listingLimit = maxAmount - 1;
    let htmlHolder = "";
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
    let NFTsArray;
    account && window.ethereum.chainId === "0x51"
      ? (NFTsArray = await fetchMarketItemsArray())
      : (NFTsArray = [
          {
            marketId: "26",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "24",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.2",
            priceBN: {
              type: "BigNumber",
              hex: "0x02c68af0bb140000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreihrrjp3b3hjiyjgsmxfza3mwitshivrddkiknggyh5cqux46s3ns4/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "27",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "25",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.4",
            priceBN: {
              type: "BigNumber",
              hex: "0x058d15e176280000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreig6muqfwtsuvkiqp6e7iolskjmyk2s44x6imayvlvhqzdw43xlzha/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "28",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "26",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.6",
            priceBN: {
              type: "BigNumber",
              hex: "0x0853a0d2313c0000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreice7oxtl5aiyvc3s23ns4ehwszwma5peqa7jhp5faadlx3bd7julq/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "29",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "27",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.2",
            priceBN: {
              type: "BigNumber",
              hex: "0x02c68af0bb140000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreiblr7phhlmyd5m5u6mpu7yff33ei6tme77muxnsa3co7iqmynwxxu/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "30",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "28",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.4",
            priceBN: {
              type: "BigNumber",
              hex: "0x058d15e176280000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreienchm2ouojzybd56anmtjmo3yo5mb2mdpwzwfet3y3ia7hwefzxi/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "31",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "29",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "0.6",
            priceBN: {
              type: "BigNumber",
              hex: "0x0853a0d2313c0000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreibgrjjz6dzfolkidbkfqoq7hz33gehnvzgdij2pl2vdy7yn26lzw4/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "32",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "30",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreictmhwy7bbeq74e45vjs4xxmbjee2jpy6buefjxra2ttchzapu3mm/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "33",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "31",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.2",
            priceBN: {
              type: "BigNumber",
              hex: "0x10a741a462780000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreiciiyjt3rrpts373u5zrqaqlr44n6c354t4ffbc54sij3uos4536a/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "34",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "33",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.4",
            priceBN: {
              type: "BigNumber",
              hex: "0x136dcc951d8c0000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreicbff2fkq4ccwtd2am5wsb366ujvcvtemwhfualo3hkhknu37v6w4/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "35",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "34",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.6",
            priceBN: {
              type: "BigNumber",
              hex: "0x16345785d8a00000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreiatk7wlm64vpn6234mkrq46imp5ce4rhxjpul5qchijztwjdt7gpu/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "36",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "35",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "2.2",
            priceBN: {
              type: "BigNumber",
              hex: "0x1e87f85809dc0000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreibscpcubcmb2zfmjbc6bxkyl4w4yuo7tehc5rw4hzqoli6ytr4cbq/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "37",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "42",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.8",
            priceBN: {
              type: "BigNumber",
              hex: "0x18fae27693b40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreig77rp7i4mxqh74pbti66lpv43sv6osvrxeu6asr3rzml4vtnbg5q/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "38",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "36",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreifouonclsqrmp26tyavi6njh3atyqjslw7tm3vksmchokcbhsfeau/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "39",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "37",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreigqg5ow6qpnbtcu6t5x4m5ijojycqom2fnmvffrzpc6hmyphs6qtm/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "40",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "38",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreifvuovrg4ugvxi2vdyxx5tpk47hifzghlrqpl6zwuoujw4aeoa5ty/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "41",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "39",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreictvtnlphnxvx55ji4om6yzpsb65b62vipeqyji4dyogxfhuf5bgm/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "42",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "40",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreidbaor5a6qnvdz7avnxtq6ueolprd3ql63jdmu7tlxqattcleik5i/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "43",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "41",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "1.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x0de0b6b3a7640000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreigqhbond6w6nxhb7a2ijh7d3kkmkezod2sa6ttatlskwznrn2dk64/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "44",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "43",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "5.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x4563918244f40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreihrqwtei7nlud2eappq5h7ysljm4uzo4hi2pyv44sf32yajjrv4ba/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "45",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "44",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "5.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x4563918244f40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreichfcvynopmqvilqs2bzex7k2ywdt3xdclwdvzhuoy5s7oexpz2pe/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "46",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "45",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "5.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x4563918244f40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreicty3sx2j6dg3kq6l54s3qx5f3zthuk5nwcbsnabrjczblfkydyha/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "47",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "46",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "5.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x4563918244f40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreihie323ragotjnkkbosjeab4sibbka647y3flox7zhvdkqdktmpxi/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "48",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "47",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "5.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x4563918244f40000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreihlgrbtsf2xixwbu2cszmuriwareey2ft2gs3nqyhdrok7vhl6deq/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "49",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "48",
            creator: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            seller: "0x64fAE5bD24F1CC1113725E781D1C828188313184",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "10.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x8ac7230489e80000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreifpnnqh4wx5hqkfttnlb2zbacnqodsjdxd72mgedge7izyq46plhq/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "55",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "17",
            creator: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            seller: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "2.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x1bc16d674ec80000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreifq26kuakzi74fnkncawi6t642zwecx7s2u57ek4mdododqbpgjfi/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "56",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "14",
            creator: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            seller: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "4.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x3782dace9d900000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreif4mbnctblrzz4xuu5hgkmalntq4532briptpswyp6z3gggeui4oi/metadata.json",
            name: "AstarCreators",
          },
          {
            marketId: "58",
            contractAddress: "0x7Fe4E59b858B907e4640730731108f9234461929",
            tokenId: "51",
            creator: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            seller: "0x0d9d09Ea8187a20bAA5d65A42eFF2AdD5a0cF45a",
            owner: "0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8",
            price: "9.0",
            priceBN: {
              type: "BigNumber",
              hex: "0x7ce66c50e2840000",
            },
            sold: false,
            canceled: false,
            tokenURI:
              "https://ipfs.io/ipfs/bafyreihkjgmsjyxyw5yjbgy6gbzpfwmf2mfchpy4mftxs3hv42wugtmomi/metadata.json",
            name: "AstarCreators",
          },
        ]);
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      let metadata = await fetch(NFTsArray[i].tokenURI);

      if (NFTsArray[i].tokenURI.includes("json")) {
        try {
          metadata = await metadata.json();
          NFTImage = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for (let i = 0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits +=
              "<br><small><b>" +
              metadata.attributes[i].trait_type +
              "</b>:</small>";
            NFTAttributesValues +=
              "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
        NFTName = NFTsArray[i].name;
        NFTDescription = "none";
        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }
      htmlHolder += `
      <!-- Card Listing -->
      <div class="col">
        <div class="card">
          <div class="card__inner">

          <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

          <div class="card-body">

            <div class="row text-center border-bottom pb-3 mb-3">
              <div class="col"> 
                  <p class="card-text">
                    <strong>${NFTName} #${NFTsArray[i].tokenId}</strong>
                  </p>
              </div>
            </div>
      
            <small>
              <div class="row">
                <div class="col text-end pe-1">
                  <p class="card-text"><strong>Price: </strong></p>      
                </div>
                <div class="col ps-1">
                  <p class="card-text">${NFTsArray[i].price} SBY</p>
                </div>
              </div>

              <div class="row border-bottom pb-3 mb-3">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Creator: </strong></p>       
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">${
                      NFTsArray[i].creator.substring(0, 6) +
                      "..." +
                      NFTsArray[i].creator.slice(-4)
                    }</p>
                  </div>
                </div>
              </small>

              <div class="row text-center">
                <div class="col">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-${
                      NFTsArray[i].marketId
                    }">View</button>
                    <button type="button" class="btn btn-sm btn-primary buyExplore" id="nftcard-buy${i}">Buy</button>
                  </div>
                </div>
              </div>

            </div>

            <div class="lux"></div>
          </div>


        </div>
      </div>

      <!-- Modal (default hidden) -->
      <div class="modal fade" id="nft-modal-${
        NFTsArray[i].marketId
      }" tabisndex="-1" aria-labelledby="nft-aria-modal${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title h4" id="nft-aria-modal${i}">${NFTName} #${
        NFTsArray[i].tokenId
      }</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">


                <div class="row">

                  <div class="col">
                    <div class="card m-3">
                      <div class="card__inner">
                        <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                        <div class="lux"></div>
                      </div>
                    </div>
                  </div>

                  <div class="col">

                    <div class="row">
                      <div class="col text-end pe-1">
                        <p class="card-text"><strong>Name: </strong></p>      
                      </div>
                      <div class="col ps-1">
                        <p class="card-text"><small>${NFTName}</small></p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col text-end pe-1">
                        <p class="card-text"><strong>Description: </strong></p>      
                      </div>
                      <div class="col ps-1">
                        <p class="card-text"><small>${NFTDescription}</small></p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col text-end pe-1">
                      <br>
                        <p class="card-text"><strong>Properties </strong>    
                        ${NFTAttributesTraits}
                        </p>      
                      </div>
                      <div class="col ps-1">
                      <br>
                        <p class="card-text">&nbsp;   
                        ${NFTAttributesValues}
                        </p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col text-end pe-1">
                        <br>
                        <p class="card-text"><strong>Creator: </strong></p>       
                      </div>
                      <div class="col ps-1">
                      <br>
                        <p class="card-text">${
                          NFTsArray[i].creator.substring(0, 6) +
                          "..." +
                          NFTsArray[i].creator.slice(-4)
                        }</p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col text-end pe-1">
                        <p class="card-text"><strong>NFT Contract: </strong></p>       
                      </div>
                      <div class="col ps-1">
                        <p class="card-text">${
                          NFTsArray[i].contractAddress.substring(0, 6) +
                          "..." +
                          NFTsArray[i].contractAddress.slice(-4)
                        }</p>
                      </div>
                    </div>

                    <div class="row border-bottom pb-3 mb-3">
                      <div class="col text-end pe-1">
                        <br>
                        <p class="card-text"><strong>Price: </strong></p>      
                      </div>
                      <div class="col ps-1">
                        <br>
                        <p class="card-text">${NFTsArray[i].price} SBY</p>
                      </div>
                    </div>

                    <div class="row text-center">
                      <div class="col pe-1">
                        <button id="nftmodal-buy${i}" type="button" class="btn btn-primary buyModal">Buy</button>     
                      </div>
                    </div>

                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      `;

      NFTAttributesTraits = "";
      NFTAttributesValues = "";
    }
    marketNFTsEl.innerHTML = htmlHolder;
    cardEffect("#market-NFTs");

    let arrayOfBuyExplore = document.querySelectorAll(".buyExplore");
    let arrayOfBuyModal = document.querySelectorAll(".buyModal");
    for (let i = 0; i < arrayOfBuyExplore.length; i++) {
      arrayOfBuyExplore[i].addEventListener("click", () => {
        buyMarketItem(
          NFTsArray[i].contractAddress,
          NFTsArray[i].marketId,
          NFTsArray[i].priceBN
        );
      });
      arrayOfBuyModal[i].addEventListener("click", () => {
        buyMarketItem(
          NFTsArray[i].contractAddress,
          NFTsArray[i].marketId,
          NFTsArray[i].priceBN
        );
      });
    }
  }

  async function fetchExploreCollectionCards(maxAmount) {
    let exploreCollections = document.getElementById("collectionsListing");
    let listingLimit = maxAmount - 1;
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
    let NFTsArray;
    NFTsArray = await fetchMarketItemsArray();
    let collections;
    collections = await MARKET_READ.getActiveCollections();

    let tempHTML = "";

    for (let i = 0; i < collections.length; i++) {
      let activeIds = [];
      for (let j = 0; j < collections[i].marketIds.length; j++) {
        activeIds.push(
          ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0)
        );
      }

      const activeNFTList = NFTsArray.filter((item) => {
        return activeIds.includes(item.marketId);
      });

      let NFTName = NFTsArray.name;
      let NFTImage = "";
      let NFTImages = "";
      let yourStake = "";
      let stakeStatus = "None";
      yourStake = await MARKET_READ.getStakes(
        collections[i].collectionId,
        account
      );

      let yourStakeDisplay = "";
      let boundedEra = ethers.utils.formatUnits(yourStake.bondedEra, 0);
      let currentEra = await DAPPS_READ.read_current_era();
      currentEra = ethers.utils.formatUnits(currentEra, 0);
      if (Number(boundedEra) == 0) {
        stakeStatus = "None";
      } else if (yourStake.status == 0) {
        stakeStatus = "Staked";
      } else if (Number(boundedEra) + 2 <= Number(currentEra)) {
        stakeStatus = "Withdrawable";
      } else if (yourStake.status == 1) {
        stakeStatus =
          "Unlocks at era " +
          (Number(boundedEra) + 2) +
          ". Current era is " +
          currentEra +
          ".";
      }
      if (yourStake.status == 3) {
        stakeStatus = "Stake removed!";
      }

      if (yourStake.status == 3) {
        yourStakeDisplay = 0;
      } else {
        yourStakeDisplay = ethers.utils.formatEther(
          ethers.utils.formatUnits(yourStake.amount, 0)
        );
      }

      for (let j = 0; j < activeNFTList.length; j++) {
        let metadata = await fetch(activeNFTList[j].tokenURI);
        if (activeNFTList[j].tokenURI.includes("json")) {
          try {
            metadata = await metadata.json();
            NFTImage = metadata.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );

            NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${metadata.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            )}');"> </div></div>`;

            for (let i = 0; i < metadata.attributes.length; i++) {
              NFTAttributesTraits +=
                "<br><small><b>" +
                metadata.attributes[i].trait_type +
                "</b>:</small>";
              NFTAttributesValues +=
                "<br><small>" + metadata.attributes[i].value + "</small>";
            }
          } catch {
            NFTImage = activeNFTList[j].tokenURI;

            NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${activeNFTList[j].tokenURI}');"> </div></div>`;
          }
        } else {
          NFTImage = activeNFTList[j].tokenURI;

          NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${activeNFTList[j].tokenURI}');"> </div></div>`;
        }
      }

      // This runs....
      tempHTML += `
      <div class="col">
      <div class="card">
        <div class="card__inner">

        <div class="container text-center border-bottom">
          <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

            ${NFTImages}

          </div>
        </div>
        
        <div class="card-body">
          <div class="row text-center border-bottom pb-3 mb-3">
            <div class="col"> 
                <p class="card-text"><strong>${collections[i].name}</strong></p>
            </div>
          </div>
      
          <small>
            <div class="row">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>TVL: </strong></p>      
              </div>
              <div class="col ps-1">
                <p class="card-text">${ethers.utils.formatEther(
                  collections[i].tvl
                )} ${symbol}</p>
              </div>
            </div>

            <div class="row">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Your Stake: </strong></p>      
              </div>
              <div class="col ps-1">
                <p class="card-text">${yourStakeDisplay} ${symbol}</p>
              </div>
            </div>

            <div class="row">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Status: </strong></p>      
              </div>
              <div class="col ps-1">
                <p class="card-text">${stakeStatus}</p>
              </div>
            </div>

            <div class="row">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>APR: </strong></p>       
              </div>
              <div class="col ps-1">
                <p class="card-text">94.4%</p>
              </div>
            </div>

            <div class="row">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Stakers: </strong></p>     
              </div>
              <div class="col ps-1">
                <p class="card-text">${collections[i].numStakers}</p>
              </div>
            </div>
  
            <div class="row">
                <div class="col text-end pe-1">
                <p class="card-text"><strong>Total NFTs: </strong></p>     
                </div>
                <div class="col ps-1">
                <p class="card-text">${collections[i].marketIds.length}</p>
                </div>
            </div>

            <div class="row border-bottom pb-3 mb-3">
                <div class="col text-end pe-1">
                  <p class="card-text"><strong>Creator: </strong></p>  
                </div>
                <div class="col ps-1">
                  <p class="card-text">${
                    collections[i].creator.substring(0, 6) +
                    "..." +
                    collections[i].creator.slice(-4)
                  }</p>
                </div>
            </div>
          </small>
          <div class="row border-bottom pb-3 mb-3">
            <div class="col text-center">
              <div class="input-group input-group-sm">
                <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake-${i}">
                <span class="input-group-text">${symbol}</span>
                <button class="btn btn-primary" type="button" id="button-explore-stake-${i}">Stake</button>
                <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-${i}">Unstake</button>
              </div>

              <button class="btn btn-sm btn-outline-success my-2" type="button" id="button-explore-withdraw-${i}">Withdraw</button>

              <button class="btn btn-sm btn-outline-warning my-2" type="button" id="button-explore-claim-rewards-${i}">Claim Rewards</button>

            </div>
          </div>

          <div class="row text-center">
            <div class="col text-start">
              <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-${i}">View</button>
            </div>

            <div class="col text-end">
              <button id="report-${i}"type="button" class="btn btn-sm btn-link light-grey">Report</button>
            </div>
          </div>

        </div>


        <div class="lux"></div>
        </div>

      </div>
    </div>

  
    <div class="modal fade" id="collection-explore-modal-${i}" tabindex="-1" aria-labelledby="collection-explore-aria-modal--${i}" style="display: none;" aria-hidden="true">
    <div class="modal-dialog modal-xl">
    <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title h4" id="collection-explore-aria-modal-${i}">${
        collections[i].name
      }</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <div class="container text-center">

            <div class="row row-cols-1">   
              <div class="col text-start">
                <p class="card-text"><strong>Collection NFTs:</strong></p>
              </div>
            </div>

            <div id="explore-collection-nfts-modal-${i}" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3"> </div>

          </div>
        </div>


        <div class="col-1"> </div>

        <div class="col-4">

          <div class="row border-bottom pb-3 mb-3">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Name: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">${collections[i].name}</p>
            </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Description: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">${collections[i].description}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">${ethers.utils.formatEther(
                collections[i].tvl
              )} ${symbol}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">${yourStakeDisplay} ${symbol}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Status: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">${stakeStatus}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APR: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">${collections[i].numStakers}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">${collections[i].marketIds.length}</p>
            </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Creator: </strong></p>  
            </div>
            <div class="col ps-1">
              <p class="card-text">${
                collections[i].creator.substring(0, 6) +
                "..." +
                collections[i].creator.slice(-4)
              }</p>
            </div>
          </div>

          <div class="row pb-3 mb-3">
            <div class="col text-center">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake-${i}">
                <span class="input-group-text">${symbol}</span>
                <button class="btn btn-primary" type="button" id="modal-button-explore-stake-${i}">Stake</button>
                <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-${i}">Unstake</button>
              </div>

              <button class="btn btn-outline-success my-2" type="button" id="modal-button-explore-withdraw-${i}">Withdraw</button>

              <button class="btn btn-outline-warning my-2" type="button" id="modal-button-explore-claim-rewards-${i}">Claim Rewards</button>

            </div>
          </div> 
          
        
        </div>
      </div>
          
</div>
    </div>
    </div>
    </div>`;
    }
    exploreCollections.innerHTML = tempHTML;
    cardEffect("#collectionsListing");

    for (let i = 0; i < collections.length; i++) {
      let collectionId = ethers.utils.formatUnits(
        collections[i].collectionId,
        0
      );
      let collectionIdModal = ethers.utils.formatUnits(
        collections[i % collections.length].collectionId,
        0
      );

      document
        .getElementById(`button-explore-stake-${i}`)
        .addEventListener("click", () => {
          let stakeVal = document.getElementById(
            `input-explore-stake-${i}`
          ).value;
          stakeCollection(collectionId, stakeVal.toString());
        });

      document
        .getElementById(`modal-button-explore-stake-${i}`)
        .addEventListener("click", () => {
          let stakeVal2 = document.getElementById(
            `modal-input-explore-stake-${i}`
          ).value;
          stakeCollection(collectionIdModal, stakeVal2.toString());
        });

      document
        .getElementById(`button-explore-unstake-${i}`)
        .addEventListener("click", () => {
          unStakeCollection(collectionId);
        });

      document
        .getElementById(`modal-button-explore-unstake-${i}`)
        .addEventListener("click", () => {
          unStakeCollection(collectionIdModal);
        });

      document
        .getElementById(`button-explore-withdraw-${i}`)
        .addEventListener("click", () => {
          withdrawCollection(collectionId);
        });

      document
        .getElementById(`modal-button-explore-withdraw-${i}`)
        .addEventListener("click", () => {
          withdrawCollection(collectionIdModal);
        });

      document
        .getElementById(`button-explore-claim-rewards-${i}`)
        .addEventListener("click", () => {
          claimCollection(collectionId);
        });

      document
        .getElementById(`modal-button-explore-claim-rewards-${i}`)
        .addEventListener("click", () => {
          claimCollection(collectionIdModal);
        });

      document.getElementById(`report-${i}`).addEventListener("click", () => {
        reportCollection(collections[i]["collectionId"]);
      });

      let activeIds = [];
      for (let j = 0; j < collections[i].marketIds.length; j++) {
        activeIds.push(
          ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0)
        );
      }

      const activeNFTList = NFTsArray.filter((item) => {
        return activeIds.includes(item.marketId);
      });

      let NFTName = NFTsArray.name;
      let NFTPrice = NFTsArray.price;
      let NFTCreator = NFTsArray.creator;
      let NFTOwner = NFTsArray.owner;
      let NFTContract = NFTsArray.contractAddress;
      let NFTImage = "";
      let NFTImages = "";
      let htmlHolder = "";

      for (let j = 0; j < activeNFTList.length; j++) {
        let metadata = await fetch(activeNFTList[j].tokenURI);
        if (activeNFTList[j].tokenURI.includes("json")) {
          try {
            metadata = await metadata.json();
            NFTName = metadata.name;
            NFTDescription = metadata.description;
            NFTImage = metadata.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );

            NFTImages += `<div class="col"><img src="${metadata.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            )}" alt="${NFTName}" class="img-fluid"></div>`;

            for (let i = 0; i < metadata.attributes.length; i++) {
              NFTAttributesTraits +=
                "<br><small><b>" +
                metadata.attributes[i].trait_type +
                "</b>:</small>";
              NFTAttributesValues +=
                "<br><small>" + metadata.attributes[i].value + "</small>";
            }
          } catch {
            NFTImage = activeNFTList[j].tokenURI;
            NFTImages += `<div class="col"><img src="${activeNFTList[j].tokenURI}" alt="${NFTName}" class="img-fluid"></div>`;
          }
        } else {
          NFTImage = activeNFTList[j].tokenURI;
          NFTImages += `<div class="col"><img src="${activeNFTList[j].tokenURI}" alt="${NFTName}" class="img-fluid"></div>`;
          NFTName = NFTsArray[j].name;
          NFTDescription = "none";
          NFTAttributesTraits = "";
          NFTAttributesValues = "";
        }

        // add html
        htmlHolder += `
          <!-- Card Listing -->
          <div class="col">
            <div class="card">
              <div class="card__inner">
  
              <div class="card-image" style="background-image: url('${NFTImage}');"> </div>
    
              <div class="card-body">
    
                <div class="row text-center border-bottom pb-3 mb-3">
                  <div class="col"> 
                      <p class="card-text">
                        <strong>${NFTName} #${activeNFTList[j].tokenId}</strong>
                      </p>
                  </div>
                </div>
          
                <small>
                  <div class="row">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Price: </strong></p>      
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">${
                        activeNFTList[j].price
                      } ${symbol}</p>
                    </div>
                  </div>
    
                  <div class="row border-bottom pb-3 mb-3">
                      <div class="col text-end pe-1">
                        <p class="card-text"><strong>Creator: </strong></p>       
                      </div>
                      <div class="col ps-1">
                        <p class="card-text">${
                          activeNFTList[j].creator.substring(0, 6) +
                          "..." +
                          activeNFTList[j].creator.slice(-4)
                        }</p>
                      </div>
                    </div>
                  </small>
    
                  <div class="row text-center">
                    <div class="col">
                      <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-${
                          activeNFTList[j].marketId
                        }">View</button>
                        <button type="button" class="btn btn-sm btn-primary buyCollectionModal-${i}" id="nftcard-buy${j}">Buy</button>
                      </div>
                    </div>
                  </div>
    
              </div>
  
              <div class="lux"></div>
              </div>
  
            </div>
          </div>`;

        document.getElementById(
          `explore-collection-nfts-modal-${i}`
        ).innerHTML = htmlHolder;
        cardEffect(`#explore-collection-nfts-modal-${i}`);

        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }

      //runs through each collection
      let arrayOfBuyCollectionModal = document.querySelectorAll(
        `.buyCollectionModal-${i}`
      );
      //runs for each item inside the collection

      for (let y = 0; y < arrayOfBuyCollectionModal.length; y++) {
        arrayOfBuyCollectionModal[y].addEventListener("click", async () => {
          currentId = await ethers.utils.formatUnits(
            collections[i]["marketIds"][y],
            0
          );

          //find index of marketID
          for (let z = 0; z < NFTsArray.length; z++) {
            if (NFTsArray[z]["marketId"] == currentId) {
              let _contract = await NFTsArray[z]["contractAddress"];
              let _marketId = await NFTsArray[z]["marketId"];
              let _priceBN = await NFTsArray[z]["priceBN"];

              buyMarketItem(_contract, _marketId, _priceBN);
            }
          }
        });
      }
    }
  }

  async function reportCollection(collectionId) {
    MARKET_WRITE.reportCollection(collectionId);
  }

  async function stakeCollection(collectionId, amount) {
    MARKET_WRITE.stake(collectionId, {
      value: ethers.utils.parseEther(amount),
    });
  }

  async function unStakeCollection(collectionId) {
    MARKET_WRITE.unBond(collectionId);
  }

  async function withdrawCollection(collectionId) {
    await MARKET_WRITE.requestWithdraw(collectionId, account);
  }

  async function claimCollection(collection) {
    latestClaim = Number(
      ethers.utils.formatUnits(await MARKET_READ.getLatestWithdrawEra(), 0)
    );
    currentEra = Number(
      ethers.utils.formatUnits(await DAPPS_READ.read_current_era(), 0)
    );
    if (latestClaim != currentEra) {
      MARKET_WRITE.claim(1362);
    }
  }

  async function fetchWalletCards(maxAmount, nftContracts) {
    let walletNFTsEl = document.getElementById("wallet-NFTs");
    let listingLimit = maxAmount - 1;
    let htmlHolder = "";
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
    let walletNftsCount = 0;

    let NFTsArray = await fetchNFTsFromContracts(nftContracts);
    let NFTImage;
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      walletNftsCount++;
      let metadata = await fetch(NFTsArray[i].tokenURI);
      if (NFTsArray[i].tokenURI.includes("json")) {
        try {
          metadata = await metadata.json();
          NFTImage = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");

          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for (let i = 0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits +=
              "<br><small><b>" +
              metadata.attributes[i].trait_type +
              "</b>:</small>";
            NFTAttributesValues +=
              "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
        NFTName = NFTsArray[i].name;
        NFTDescription = "none";
        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }

      htmlHolder += `
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
          <div class="card__inner">

            <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

            <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>${NFTName} #${NFTsArray[i].tokenId}</strong>
                    </p>
                </div>
              </div>

              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                  <div class="input-group input-group-sm">
                    <input type="text" class="form-control inputWallet" placeholder="Price">
                    <span class="input-group-text">${symbol}</span>
                    <button class="btn btn-warning approveWallet" type="button" id="nftwallet-approve${i}">Approve</button>
                    <button class="btn btn-primary listWallet" type="button" id="">List</button>
                  </div>
                </div>
              </div>

              <div class="row text-center">
                <div class="col">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modalWallet${i}">View</button>
    
                  </div>
                </div>
              </div>

            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>

        <!-- Modal (default hidden) -->
        <div class="modal fade" id="nft-modalWallet${i}" tabisndex="-1" aria-labelledby="nft-aria-modalWallet${i}" style="display: none;" aria-hidden="true">
            <div class="modal-dialog modal-xl">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title h4" id="nft-aria-modalWallet${i}">${NFTName} #${
        NFTsArray[i].tokenId
      }</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">


                  <div class="row">

                    <div class="col">
                        <div class="card m-3">
                            <div class="card__inner">
                            <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                            <div class="lux"></div>
                            </div>
                        </div>
                    </div>

                    <div class="col">

                      <div class="row">
                        <div class="col text-end pe-1">
                          <p class="card-text"><strong>Name: </strong></p>      
                        </div>
                        <div class="col ps-1">
                          <p class="card-text"><small>${NFTName}</small></p>
                        </div>
                      </div>

                      <div class="row">
                        <div class="col text-end pe-1">
                          <p class="card-text"><strong>Description: </strong></p>      
                        </div>
                        <div class="col ps-1">
                          <p class="card-text"><small>${NFTDescription}</small></p>
                        </div>
                      </div>

                      <div class="row">
                        <div class="col text-end pe-1">
                        <br>
                          <p class="card-text"><strong>Properties </strong>
                          ${NFTAttributesTraits}
                          </p>      
                        </div>
                        <div class="col ps-1">
                        <br>
                          <p class="card-text">&nbsp;
                          ${NFTAttributesValues}
                          </p>
                        </div>
                      </div>

                      <div class="row border-bottom pb-3 mb-3">
                        <div class="col text-end pe-1">
                          <br>
                          <p class="card-text"><strong>NFT Contract: </strong></p>       
                        </div>
                        <div class="col ps-1">
                        <br>
                          <p class="card-text">${
                            NFTsArray[i].contractAddress.substring(0, 6) +
                            "..." +
                            NFTsArray[i].contractAddress.slice(-4)
                          }</p>
                        </div>
                      </div>

                      <div class="row text-center">

                        <div class="col-12 col-md-8 offset-md-2"> 
                          <div class="input-group">
                            <input type="text" id="nftmodal-listInput${i}" class="form-control inputModal" placeholder="Price">
                            <span class="input-group-text">${symbol}</span>
                            <button class="btn btn-warning approveModal" type="button" id="nftmodal-approve${i}">Approve</button>
                            <button class="btn btn-primary listModal" type="button" id="nftmodal-list${i}">List</button>
                          </div>
                        </div>

                      </div>

                      </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        `;

      NFTAttributesTraits = "";
      NFTAttributesValues = "";
    }
    walletNFTsEl.innerHTML = htmlHolder;
    document.getElementById("walletNftsCount").innerHTML = walletNftsCount;
    cardEffect("#wallet-NFTs");

    let arrayOfApproveWallet = document.querySelectorAll(".approveWallet");
    let arrayOfListWallet = document.querySelectorAll(".listWallet");
    let arrayOfInputWallet = document.querySelectorAll(".inputWallet");
    let arrayOfApproveModal = document.querySelectorAll(".approveModal");
    let arrayOfListModal = document.querySelectorAll(".listModal");
    let arrayOfInputModal = document.querySelectorAll(".inputModal");
    for (let i = 0; i < arrayOfListWallet.length; i++) {
      arrayOfApproveWallet[i].addEventListener("click", () => {
        approveNFT(NFTsArray[i].contractAddress, NFTsArray[i].tokenId);
      });
      arrayOfListWallet[i].addEventListener("click", () => {
        listMarketItem(
          NFTsArray[i].contractAddress,
          NFTsArray[i].tokenId,
          ethers.utils.parseEther(arrayOfInputWallet[i].value)
        );
      });
      arrayOfApproveModal[i].addEventListener("click", () => {
        approveNFT(NFTsArray[i].contractAddress, NFTsArray[i].tokenId);
      });
      arrayOfListModal[i].addEventListener("click", () => {
        listMarketItem(
          NFTsArray[i].contractAddress,
          NFTsArray[i].tokenId,
          ethers.utils.parseEther(arrayOfInputModal[i].value)
        );
      });
    }
  }

  async function fetchMarketplaceCards(maxAmount, location) {
    let marketplaceNFTsEl = document.getElementById(location);
    let listingLimit = maxAmount - 1;
    let htmlHolder = "";
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
    let saleStatus = "";
    let marketplaceNftsCount = 0;

    let NFTsArray = await fetchSellingItemsArray();

    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      let metadata = await fetch(NFTsArray[i].tokenURI);

      if (!NFTsArray[i].canceled && !NFTsArray[i].sold) {
        marketplaceNftsCount++;
      }

      if (NFTsArray[i].sold) {
        saleStatus = `<span class="badge text-bg-success">Sold</span>`;
      } else {
        saleStatus = `<span class="badge text-bg-warning">For Sale</span>`;
      }

      if (NFTsArray[i].tokenURI.includes("json")) {
        try {
          metadata = await metadata.json();
          NFTImage = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");

          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for (let i = 0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits +=
              "<br><small><b>" +
              metadata.attributes[i].trait_type +
              "</b>:</small>";
            NFTAttributesValues +=
              "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
        NFTName = NFTsArray[i].name;
        NFTDescription = "none";
        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }
      if (!NFTsArray[i].sold && !NFTsArray[i].canceled) {
        htmlHolder += `
      <div class="col">
          <div class="card">
          <div class="card__inner">
          
          <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

          <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
              <div class="col"> 
                  <p class="card-text">
                      <strong>${NFTName} #${NFTsArray[i].tokenId}</strong>
                  </p>
              </div>
              </div>

              <small>
              <div class="row">
                  <div class="col text-end pe-1">
                      <p class="card-text"><strong>Status: </strong></p>      
                    </div>
                    <div class="col text-start ps-1">
                      <p class="card-text">
                          ${saleStatus}
                      </p>
                  </div>
              </div>

              <div class="row border-bottom pb-3 mb-3">
                  <div class="col text-end pe-1">
                      <p class="card-text"><strong>Price: </strong></p>      
                    </div>
                    <div class="col text-start ps-1">
                      <p class="card-text">${NFTsArray[i].price} SBY</p>
                  </div>
              </div>
              </small>

              <div class="row text-center">
              <div class="col">
                  <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#${location}-nft-modalWallet-${
          NFTsArray[i].marketId
        }">View</button>
                  &nbsp; &nbsp; 
                  <button type="button" class="btn btn-sm btn-outline-danger btn-Delist" id="Delist${i}">Delist</button>
              </div>
              </div>

          </div>

          <div class="lux"></div>
          </div>

          </div>
      </div>

      <!-- Modal (default hidden) -->
      <div class="modal fade" id="${location}-nft-modalWallet-${
          NFTsArray[i].marketId
        }" tabisndex="-1" aria-labelledby="${location}-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title h4" id="${location}-nft-aria-modalWallet-${i}">${NFTName} #${
          NFTsArray[i].tokenId
        }</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">


                  <div class="row">

                  <div class="col">
                      <div class="card m-3">
                          <div class="card__inner">
                          <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                          <div class="lux"></div>
                          </div>
                      </div>
                  </div>

                  <div class="col">

                    <div class="row">
                    <div class="col text-end pe-1">
                        <p class="card-text"><strong>Name: </strong></p>      
                    </div>
                    <div class="col ps-1">
                        <p class="card-text"><small>${NFTName}</small></p>
                    </div>
                    </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                          <p class="card-text"><strong>Description: </strong></p>      
                      </div>
                      <div class="col ps-1">
                          <p class="card-text"><small>${NFTDescription}</small></p>
                      </div>
                      </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                      <br>
                          <p class="card-text"><strong>Properties</strong>
                          ${NFTAttributesTraits}
                          </p>      
                      </div>
                      <div class="col ps-1">
                      <br>
                          <p class="card-text">&nbsp;
                          ${NFTAttributesValues}
                          </p>
                      </div>
                      </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                      <br>
                          <p class="card-text"><strong>Creator: </strong></p>       
                      </div>
                      <div class="col ps-1">
                      <br>
                          <p class="card-text">${
                            NFTsArray[i].creator.substring(0, 6) +
                            "..." +
                            NFTsArray[i].creator.slice(-4)
                          }</p>
                      </div>
                      </div>

                      <div class="row">
                          <div class="col text-end pe-1">
                              <br>
                              <p class="card-text"><strong>Status: </strong></p>      
                          </div>
                          <div class="col text-start ps-1">
                              <br>
                              <p class="card-text">
                                ${saleStatus}
                              </p>
                          </div>
                      </div>
      
                      <div class="row border-bottom pb-3 mb-3">
                          <div class="col text-end pe-1">
                              <p class="card-text"><strong>Price: </strong></p>      
                          </div>
                          <div class="col text-start ps-1">
                              <p class="card-text">${
                                NFTsArray[i].price
                              } ${symbol}</p>
                          </div>
                      </div>

                      <div class="row text-center">

                      <div class="col text-center"> 
                          
                          <button type="button" class="btn btn-sm btn-outline-danger btn-DelistModal" id="Delist${
                            i + location
                          }">Delist</button>
                                                                                                     
                      </div>
                      </div>

                      </div>
                  </div>

              </div>
              </div>
          </div>
          </div>`;

        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }
    }
    marketplaceNFTsEl.innerHTML = htmlHolder;
    document.getElementById("marketplaceNftsCount").innerHTML =
      marketplaceNftsCount;
    cardEffect("#marketplace");

    let arrayOfDelist = document.querySelectorAll(`#${location} .btn-Delist`);
    let arrayOfDelistModal = document.querySelectorAll(
      `#${location} .btn-DelistModal`
    );

    let buttonCounter = 0;
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      if (!NFTsArray[i].canceled && !NFTsArray[i].sold) {
        arrayOfDelist[buttonCounter].addEventListener("click", () => {
          cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId);
        });
        arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
          cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId);
        });
        buttonCounter++;
      }
    }
  }

  async function fetchMarketplaceCardsCollectionModal(maxAmount) {
    let marketplaceNFTsEl = document.getElementById("new-collection-modal");
    let listingLimit = maxAmount - 1;
    let htmlHolder = "";
    let htmlModalHolder = "";
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
    let saleStatus = "";

    let NFTsArray = await fetchSellingItemsArray();
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      let metadata = await fetch(NFTsArray[i].tokenURI);

      if (NFTsArray[i].sold) {
        saleStatus = `<span class="badge text-bg-success">Sold</span>`;
      } else {
        saleStatus = `<span class="badge text-bg-warning">For Sale</span>`;
      }
      if (NFTsArray[i].tokenURI.includes("json")) {
        try {
          metadata = await metadata.json();
          NFTImage = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");

          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for (let i = 0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits +=
              "<br><small><b>" +
              metadata.attributes[i].trait_type +
              "</b>:</small>";
            NFTAttributesValues +=
              "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
      }
      if (!NFTsArray[i].sold && !NFTsArray[i].canceled) {
        htmlHolder += `
    <div class="col">
        <div class="card">
          <div class="card__inner">
          
        <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

        <div class="card-body">

            <div class="row text-center border-bottom pb-3 mb-3">
            <div class="col"> 
                <p class="card-text">
                    <strong>${NFTName} #${NFTsArray[i].tokenId}</strong>
                </p>
            </div>
            </div>

            <small>
            <div class="row">
                <div class="col text-end pe-1">
                    <p class="card-text"><strong>Status: </strong></p>      
                  </div>
                  <div class="col text-start ps-1">
                    <p class="card-text">
                        ${saleStatus}
                    </p>
                </div>
            </div>

            <div class="row border-bottom pb-3 mb-3">
                <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col text-start ps-1">
                    <p class="card-text">${NFTsArray[i].price} SBY</p>
                </div>
            </div>

            <div class="row border-bottom pb-3 mb-3 justify-content-center">
              <div class="col-auto text-center pe-1">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" value="" id="MARKET_ID: ${NFTsArray[i].marketId}">
                  <label class="form-check-label" for="addToCollection${i}">
                    <b>Add to Collection</b>
                  </label>
                </div>
              </div>
            </div>
            </small>

            <div class="row text-center">
            <div class="col">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#marketlist-nft-modalWallet-${i}">View</button>
                &nbsp; &nbsp; 
                <button type="button" class="btn btn-sm btn-outline-danger btn-Delist-CM" id="Delist${i}">Delist</button>
            </div>
            </div>

        </div>

        <div class="lux"></div>
        </div>

        </div>
    </div>`;

        htmlModalHolder += `
      <!-- Modal (default hidden) -->
      <div class="modal fade" id="marketlist-nft-modalWallet-${i}" tabisndex="-1" aria-labelledby="marketlist-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title h4" id="marketlist-nft-aria-modalWallet-${i}">${NFTName} #${
          NFTsArray[i].tokenId
        }</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">

                  <div class="row">

                  <div class="col">
                      <div class="card m-3">
                          <div class="card__inner">
                          <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                          <div class="lux"></div>
                          </div>
                      </div>
                  </div>

                  <div class="col">

                    <div class="row">
                    <div class="col text-end pe-1">
                        <p class="card-text"><strong>Name: </strong></p>      
                    </div>
                    <div class="col ps-1">
                        <p class="card-text"><small>${NFTName}</small></p>
                    </div>
                    </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                          <p class="card-text"><strong>Description: </strong></p>      
                      </div>
                      <div class="col ps-1">
                          <p class="card-text"><small>${NFTDescription}</small></p>
                      </div>
                      </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                      <br>
                          <p class="card-text"><strong>Properties</strong>
                          ${NFTAttributesTraits}
                          </p>      
                      </div>
                      <div class="col ps-1">
                      <br>
                          <p class="card-text">&nbsp;
                          ${NFTAttributesValues}
                          </p>
                      </div>
                      </div>

                      <div class="row">
                      <div class="col text-end pe-1">
                      <br>
                          <p class="card-text"><strong>Creator: </strong></p>       
                      </div>
                      <div class="col ps-1">
                      <br>
                          <p class="card-text">${
                            NFTsArray[i].creator.substring(0, 6) +
                            "..." +
                            NFTsArray[i].creator.slice(-4)
                          }</p>
                      </div>
                      </div>

                      <div class="row">
                          <div class="col text-end pe-1">
                              <br>
                              <p class="card-text"><strong>Status: </strong></p>      
                          </div>
                          <div class="col text-start ps-1">
                              <br>
                              <p class="card-text">
                                ${saleStatus}
                              </p>
                          </div>
                      </div>
      
                      <div class="row border-bottom pb-3 mb-3">
                          <div class="col text-end pe-1">
                              <p class="card-text"><strong>Price: </strong></p>      
                          </div>
                          <div class="col text-start ps-1">
                              <p class="card-text">${
                                NFTsArray[i].price
                              } ${symbol}</p>
                          </div>
                      </div>

                      <div class="row text-center">

                      <div class="col text-center"> 
                          
                        <button type="button" class="btn btn-sm btn-outline-danger btn-DelistModal-CM" id="Delist${i}">Delist</button>
                                                                                                    
                      </div>
                      </div>

                      </div>
                  </div>

              </div>
              </div>
          </div>
          </div>`;

        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }
    }
    marketplaceNFTsEl.innerHTML = htmlHolder;
    document.getElementById("my-wallet-new-collection-nft-modals").innerHTML =
      htmlModalHolder;
    cardEffect("#new-collection-modal");
    cardEffect("#my-wallet-new-collection-nft-modals");

    let arrayOfDelist = document.querySelectorAll(".btn-Delist-CM");
    let arrayOfDelistModal = document.querySelectorAll(".btn-DelistModal-CM");
    let buttonCounter = 0;

    for (let i = 0; i < NFTsArray.length; i++) {
      if (!NFTsArray[i].canceled && !NFTsArray[i].sold) {
        arrayOfDelist[buttonCounter].addEventListener("click", () => {
          cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId);
        });
        arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
          cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId);
        });
      }
    }
  }

  async function fetchCollections() {
    let collections = await MARKET_READ.getActiveCollections();
    let containerEl = document.getElementById("my-collections"); // exploreCollections
    let tempHTML = "";
    let collectionsCount = 0;

    // ------------

    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";

    let NFTsArray = await fetchMarketItemsArray();

    for (let i = 0; i < collections.length; i++) {
      if (collections[i].creator.toLowerCase() == account.toLowerCase()) {
        collectionsCount++;

        let activeIds = [];
        for (let j = 0; j < collections[i].marketIds.length; j++) {
          activeIds.push(
            ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0)
          );
        }

        const activeNFTList = NFTsArray.filter((item) => {
          return activeIds.includes(item.marketId);
        });

        let NFTName = NFTsArray.name;
        let NFTImage = "";
        let NFTImages = "";

        yourStake = await MARKET_READ.getStakes(
          collections[i].collectionId,
          account
        );

        if (yourStake.status == 3) {
          yourStake = 0;
        } else {
          yourStake = ethers.utils.formatEther(
            ethers.utils.formatUnits(yourStake.amount, 0)
          );
        }

        for (let j = 0; j < activeNFTList.length; j++) {
          let metadata = await fetch(activeNFTList[j].tokenURI);
          if (activeNFTList[j].tokenURI.includes("json")) {
            try {
              metadata = await metadata.json();
              NFTImage = metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              );

              NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              )}');"> </div></div>`;

              for (let i = 0; i < metadata.attributes.length; i++) {
                NFTAttributesTraits +=
                  "<br><small><b>" +
                  metadata.attributes[i].trait_type +
                  "</b>:</small>";
                NFTAttributesValues +=
                  "<br><small>" + metadata.attributes[i].value + "</small>";
              }
            } catch {
              NFTImage = activeNFTList[j].tokenURI;
              NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${activeNFTList[j].tokenURI}');"> </div></div>`;
            }
          } else {
            NFTImage = activeNFTList[j].tokenURI;
            NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${activeNFTList[j].tokenURI}');"> </div></div>`;
          }
        }

        tempHTML += `
    <div class="col">
    <div class="card">
      <div class="card__inner">

      <div class="container text-center border-bottom">
        <div class="row row-cols-2 row-cols-md-3 g-2 m-1 my-md-3">

          ${NFTImages}

        </div>
      </div>
      
      <div class="card-body">
        <div class="row text-center border-bottom pb-3 mb-3">
          <div class="col"> 
              <p class="card-text"><strong>${collections[i].name}</strong></p>
          </div>
        </div>
    
        <small>
          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>TVL: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">${ethers.utils.formatEther(
                collections[i].tvl
              )} ${symbol}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Your Stake: </strong></p>      
            </div>
            <div class="col ps-1">
              <p class="card-text">${yourStake} ${symbol}</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>APY: </strong></p>       
            </div>
            <div class="col ps-1">
              <p class="card-text">94.4%</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Stakers: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">${collections[i].numStakers}</p>
            </div>
          </div>

          <div class="row">
              <div class="col text-end pe-1">
              <p class="card-text"><strong>Total NFTs: </strong></p>     
              </div>
              <div class="col ps-1">
              <p class="card-text">${collections[i].marketIds.length}</p>
              </div>
          </div>

          <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Creator: </strong></p>  
              </div>
              <div class="col ps-1">
                <p class="card-text">${
                  collections[i].creator.substring(0, 6) +
                  "..." +
                  collections[i].creator.slice(-4)
                }</p>
              </div>
          </div>
        </small>


        <div class="row text-center">
          <div class="col">
            <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#my-wallet-collection-modal-${i}">View</button>
            &nbsp; &nbsp; 
            <button type="button" class="btn btn-sm btn-outline-danger btn-DelistCollection" id="collectionCardDelist${i}">Delist</button>
          </div>
        </div>

      </div>


      <div class="lux"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="my-wallet-collection-modal-${i}" tabindex="-1" aria-labelledby="my-wallet-collection-aria-modal-${i}" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="my-wallet-collection-aria-modal-${i}">${
          collections[i].name
        }</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-6">
        <div class="container text-center">

          <div class="row row-cols-1">   
            <div class="col text-start">
              <p class="card-text"><strong>Collection NFTs:</strong></p>
            </div>
          </div>

          <div id="my-wallet-collection-nfts-modal-${i}" class="row row-cols-1 row-cols-md-2 g-3 my-2 my-md-3"> </div>

        </div>
      </div>


      <div class="col-1"> </div>

      <div class="col-4">

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Name: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">${collections[i].name}</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Description: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">${collections[i].description}</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>TVL: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">${ethers.utils.formatEther(
              collections[i].tvl
            )} ${symbol}</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Your Stake: </strong></p>      
          </div>
          <div class="col ps-1">
            <p class="card-text">${yourStake} ${symbol}</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>APY: </strong></p>       
          </div>
          <div class="col ps-1">
            <p class="card-text">0%</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Stakers: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">${collections[i].numStakers}</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Total NFTs: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">${collections[i].marketIds.length}</p>
          </div>
        </div>

        <div class="row border-bottom pb-3 mb-3">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Creator: </strong></p>  
          </div>
          <div class="col ps-1">
            <p class="card-text">${
              collections[i].creator.substring(0, 6) +
              "..." +
              collections[i].creator.slice(-4)
            }</p>
          </div>
        </div>

        <div class="row text-center">
          <div class="col">
            <button type="button" class="btn btn-sm btn-outline-danger btn-DelistCollectionModal" id="collectionCardDelist${i}">Delist</button>
          </div>
        </div>
        
      </div>
    </div>
        
    </div>
  </div>
  </div>
  </div>`;
      }
    }
    containerEl.innerHTML = tempHTML;
    cardEffect("#my-collections");

    document.getElementById("collectionsCount").innerHTML = collectionsCount;

    // Delist collection

    let arrayOfDelist = document.querySelectorAll(
      `#my-collections .btn-DelistCollection`
    );
    let arrayOfDelistModal = document.querySelectorAll(
      `#my-collections .btn-DelistCollectionModal`
    );
    let buttonCounter = 0;

    for (let i = 0; i < collections.length; i++) {
      if (
        collections[i].creator.toLowerCase() === account.toLowerCase() &&
        collections[i].active
      ) {
        arrayOfDelist[buttonCounter].addEventListener("click", () => {
          delistCollection(collections[i].collectionId);
        });
        arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
          delistCollection(collections[i].collectionId);
        });

        buttonCounter++;
      }
    }

    // Add Cards
    for (let i = 0; i < collections.length; i++) {
      if (collections[i].creator.toLowerCase() == account.toLowerCase()) {
        let activeIds = [];
        for (let j = 0; j < collections[i].marketIds.length; j++) {
          activeIds.push(
            ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0)
          );
        }

        const activeNFTList = NFTsArray.filter((item) => {
          return activeIds.includes(item.marketId);
        });

        let NFTName = NFTsArray.name;
        let NFTPrice = NFTsArray.price;
        let NFTCreator = NFTsArray.creator;
        let NFTOwner = NFTsArray.owner;
        let NFTContract = NFTsArray.contractAddress;
        let NFTImage = "";
        let NFTImages = "";
        let htmlHolder = "";

        for (let j = 0; j < activeNFTList.length; j++) {
          let metadata = await fetch(activeNFTList[j].tokenURI);
          if (activeNFTList[j].tokenURI.includes("json")) {
            try {
              metadata = await metadata.json();
              NFTName = metadata.name;
              NFTDescription = metadata.description;
              NFTImage = metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              );

              NFTImages += `<div class="col"><img src="${metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              )}" alt="${NFTName}" class="img-fluid"></div>`;

              for (let i = 0; i < metadata.attributes.length; i++) {
                NFTAttributesTraits +=
                  "<br><small><b>" +
                  metadata.attributes[i].trait_type +
                  "</b>:</small>";
                NFTAttributesValues +=
                  "<br><small>" + metadata.attributes[i].value + "</small>";
              }
            } catch {
              NFTImage = activeNFTList[j].tokenURI;
              NFTImages += `<div class="col"><img src="${activeNFTList[j].tokenURI}" alt="${NFTName}" class="img-fluid"></div>`;
            }
          } else {
            NFTImage = activeNFTList[j].tokenURI;
            NFTImages += `<div class="col"><img src="${activeNFTList[j].tokenURI}" alt="${NFTName}" class="img-fluid"></div>`;

            NFTName = activeNFTList[j].name;
            NFTDescription = "none";
            NFTAttributesTraits = "";
            NFTAttributesValues = "";
          }

          // add html
          htmlHolder += `
        <!-- Card Listing -->
        <div class="col">
          <div class="card">
            <div class="card__inner">

            <div class="card-image" style="background-image: url('${NFTImage}');"> </div>
  
            <div class="card-body">
  
              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>${NFTName} #${activeNFTList[j].tokenId}</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1 text-start">
                    <p class="card-text">${activeNFTList[j].price} SBY</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1 text-start">
                      <p class="card-text">${
                        activeNFTList[j].creator.substring(0, 6) +
                        "..." +
                        activeNFTList[j].creator.slice(-4)
                      }</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#marketplace-nft-modalWallet-${
                        activeNFTList[j].marketId
                      }">View</button>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>`;

          NFTAttributesTraits = "";
          NFTAttributesValues = "";

          document.getElementById(
            `my-wallet-collection-nfts-modal-${i}`
          ).innerHTML = htmlHolder;
          cardEffect(`#my-wallet-collection-nfts-modal-${i}`);

          // let arrayOfBuyExplore = document.querySelectorAll("#my-collections .buyExplore");
          // let arrayOfBuyModal = document.querySelectorAll("#my-collections .buyModal");
          // for (let i = 0; i < arrayOfBuyExplore.length; i++) {
          //   arrayOfBuyExplore[i].addEventListener("click", () => {
          //     buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
          //   arrayOfBuyModal[i].addEventListener("click", () => {
          //     buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
          // }
        }
      }
    }
  }

  const listCollection = document.querySelector("#listCollection");
  const listCollectionMessage = document.querySelector(
    "#listCollectionMessage"
  );

  listCollection.addEventListener("click", (e) => {
    e.preventDefault();
    createCollection();
  });

  async function createCollection() {
    let name = document.querySelector(
      "#new-collection-modal-1 #newCollectionName"
    ).value;
    let description = document.querySelector(
      "#new-collection-modal-1 #newCollectionDescription"
    ).value;
    let totalMarketEls = document.querySelectorAll(".form-check-input");

    let selectedNFTs = [];

    for (let i = 0; i < totalMarketEls.length; i++) {
      if (totalMarketEls[i].checked) {
        selectedNFTs.push(totalMarketEls[i].id.slice(11)); //removes MARKET_ID:
      }
    }

    try {
      document
        .getElementById("listCollectionStatus")
        .classList.remove("d-none");
      document.getElementById("listCollection").setAttribute("disabled", "");

      MARKET_WRITE.createCollection(name, description, selectedNFTs);

      document.getElementById("listCollectionStatus").classList.add("d-none");
      document.getElementById("listCollection").removeAttribute("disabled", "");
      showMessageCollection("Your new collection is listed!", "success");
    } catch (error) {
      showMessageCollection("Something went wrong...", "error");
    }
  }

  const showMessageCollection = (message, type = "success") => {
    listCollectionMessage.innerHTML += `
    <div class="alert alert-${type}">
    ${message}
    </div>
  `;
  };

  //------------------- //
  // MINT NFTs
  //------------------- //

  const btn = document.querySelector("#mintNftButton");
  const form = document.querySelector("#mintNftForm");
  const messageEl = document.querySelector("#mintNftMessage");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    postNFT();
  });

  const postNFT = async () => {
    try {
      document.getElementById("mint-nft-status").classList.remove("d-none");
      document.getElementById("mintNftButton").setAttribute("disabled", "");

      let response = await fetch("api/mint", {
        method: "POST",
        body: new FormData(form),
      });
      const result = await response.json();
      const metaUri = result.data.metadata.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      mintNFT(metaUri);
      // result.data.metadata.image

      showMessage(result.message, response.status == 200 ? "success" : "error");
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  async function mintNFT(_uri) {
    try {
      const astarMinter = new ethers.Contract(
        addresses[chain].astarMinter,
        abis.astarMinter,
        signer
      );
      const result = await astarMinter.safeMint(account, _uri);

      document.getElementById("mint-nft-status").classList.add("d-none");
      document.getElementById("mintNftButton").removeAttribute("disabled", "");
      showMessage("Your NFT is minted!", "success");
    } catch (error) {
      showMessage("Something went wrong with the minting...", "error");
    }
  }

  const showMessage = (message, type = "success") => {
    messageEl.innerHTML += `
      <div class="alert alert-${type}">
      ${message}
      </div>
  `;
  };
}

// -----------------------
// TABS NAV             //
// -----------------------

function Tabs() {
  var bindAll = function () {
    var getActiveDataTab;

    if (sessionStorage.getItem("activeDataTab") === null) {
      sessionStorage.setItem("activeDataTab", "view-1");
      getActiveDataTab = sessionStorage.setItem("activeDataTab", "view-1");
    }

    if (sessionStorage.getItem("activeDataTab") !== "") {
      getActiveDataTab = sessionStorage.getItem("activeDataTab");
      clear();
      document
        .querySelector('[data-tab="' + getActiveDataTab + '"]')
        .classList.add("active");
      document.getElementById(getActiveDataTab).classList.add("active");
    } else {
      sessionStorage.setItem("activeDataTab", "view-1");
      getActiveDataTab = sessionStorage.getItem("activeDataTab");
      clear();
      document
        .querySelectorAll('[data-tab="' + getActiveDataTab + '"]')
        .classList.add("active");
      document.getElementById(getActiveDataTab).classList.add("active");
    }

    var menuElements = document.querySelectorAll("[data-tab]");
    for (var i = 0; i < menuElements.length; i++) {
      menuElements[i].addEventListener("click", change, false);
    }
  };

  var clear = function () {
    var menuElements = document.querySelectorAll("[data-tab]");
    for (var i = 0; i < menuElements.length; i++) {
      menuElements[i].classList.remove("active");
      var id = menuElements[i].getAttribute("data-tab");
      document.getElementById(id).classList.remove("active");
    }
  };

  var change = function (e) {
    clear();
    e.target.classList.add("active");
    var id = e.currentTarget.getAttribute("data-tab");
    sessionStorage.setItem("activeDataTab", id);
    document.getElementById(id).classList.add("active");
  };

  bindAll();
}
var connectTabs = new Tabs();

// NFT Media Preview

var loadFile = function (event) {
  let nftMediaPreview = document.getElementById("nftMediaPreview");
  let previewPath = URL.createObjectURL(event.target.files[0]);

  if (event.target.files[0].type.includes("video/")) {
    nftMediaPreview.innerHTML = `<video controls style="width:100%;"><source src="${previewPath}" type="video/mp4"></video>`;
  } else {
    nftMediaPreview.innerHTML = `<div class="card__inner"> <div class="card-image image-radius" style="background-image: url('${previewPath}');"> </div> <div class="lux"></div> </div>`;
  }

  cardEffect("#mint-nft-modal-1");
};

// Easter Egg: Shibooyakasha

document.getElementById("network-name").addEventListener("click", function () {
  setTimeout(() => {
    document.getElementById("shibooyakasha").className =
      "animate__animated animate__zoomInUp";
  }, "1000");

  setTimeout(() => {
    document.getElementById("shibooyakasha-img").className =
      "animate__animated animate__repeat-2 animate__bounce animate__tada";
  }, "2000");

  setTimeout(() => {
    document.getElementById("shibooyakasha").className =
      "animate__animated animate__faster animate__zoomOutUp";
  }, "4500");

  setTimeout(() => {
    document.getElementById("shibooyakasha").className = "hide";
  }, "5000");

  document.getElementById("shibooyakasha-mp3").play();
});

// Card Effect
function cardEffect(_parentId) {
  $(`${_parentId} .card__inner`).mousemove(function (event) {
    var off = $(this).offset();
    var h = $(this).height() / 2;
    var w = $(this).width() / 2;
    var x = event.pageY - off.top - h;
    var y = event.pageX - off.left - w;
    var xDeg = -(x * (Math.PI / 180));
    var yDeg = y * (Math.PI / 180);
    var rad = Math.atan2(x, y);
    var radPI = (rad * 180) / Math.PI - 90;
    $(this).css(
      "transform",
      "rotateX(" +
        xDeg +
        "deg) rotateY(" +
        yDeg +
        "deg) scale3d(1.025,1.025,1.025) perspective(1000px)"
    );

    if ($(`body`).hasClass("bg-dark")) {
      $(this)
        .find(".lux")
        .css(
          "background",
          "linear-gradient(" +
            radPI +
            "deg, rgba(255,255,255,0.1) 0%,rgba(255,255,255,0) 80%)"
        );
    } else {
      $(this)
        .find(".lux")
        .css(
          "background",
          "linear-gradient(" +
            radPI +
            "deg, rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 80%)"
        );
    }
  });

  $(`${_parentId} .card__inner`).mouseout(function () {
    $(this).css(
      "transform",
      "rotateX(0deg) rotateY(0deg) scale3d(1,1,1) perspective(0)"
    );
  });
  $(`${_parentId} .lux`).mousedown(function () {
    $(this).hide();
  });
  $(`${_parentId} .lux`).mouseup(function () {
    $(this).show();
  });
}

// cardEffect("#view-2");

///////////////////////////
/// Light / Dark Mode  ///
/////////////////////////

$(".switch").click(() => {
  $("body").toggleClass("bg-dark");
  $("#modeButton i").toggleClass("bi-moon bi-sun");

  if ($("body").hasClass("bg-dark")) {
    localStorage.setItem("smart-wallet-theme", "dark");
  } else {
    localStorage.setItem("smart-wallet-theme", "light");
  }
});
