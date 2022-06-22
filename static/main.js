
window.addEventListener('load', async () => {
  document.getElementById("btn-connect").addEventListener("click", fetchAccountData);
  document.getElementById("btn-disconnect").addEventListener("click", onDisconnect);
  try {
    if(ethereum.isMetaMask && localStorage.getItem("CACHED_PROVIDER") === "TRUE") {
        fetchAccountData();
      };
} catch (error) {
    console.log("Error connecting to metamask account:\n", error)
  if (window.confirm("Install Metamask to access Web3 Content. \nClick OK to be directed to metamask.io ")) {
      window.open("http://metamask.io", "_blank");
      };
    }
  });

function onDisconnect() {
  alert("To disconnect, open MetaMask and manualy disconnect.");

  document.getElementById("not-connected").style.display = "block";
  document.getElementById("connected").style.display = "none";
}


async function fetchAccountData() {
  let provider;
  let signer;
  let account;
 
    try {
        provider = new ethers.providers.Web3Provider(ethereum);
        signer = provider.getSigner()
        account = await provider.send("eth_requestAccounts").then( accounts => {
          return accounts[0];});
        let balance = await provider.getBalance(account);
        let formatedBalance = ethers.BigNumber.from(balance);
        formatedBalance = balance.mod(1e14);
        formatedBalance = ethers.utils.formatEther(balance.sub(formatedBalance));
        
        //updateHTMLElements network/balances/button
        document.getElementById("selected-account").innerHTML = `(${account.substring(0,6) + "..." + account.slice(-4)})`;
        document.getElementById("account-balance").innerHTML = `${formatedBalance} ${chainIdMap[ethereum.networkVersion].symbol}`;
        document.getElementById("network-name").innerHTML = `${chainIdMap[ethereum.networkVersion].name}`;

        document.getElementById("not-connected").style.display = "none";
        document.getElementById("connected").style.display = "block";


        localStorage.setItem("CACHED_PROVIDER", "TRUE");
    } catch (error) {
        console.log("Error connecting to metamask account:\n", error)
      }

  ethereum.on("accountsChanged", (accounts) => {
      if(accounts[0]) {
        fetchAccountData();
      } else {
        localStorage.removeItem("CACHED_PROVIDER");

        document.getElementById("not-connected").style.display = "block";
        document.getElementById("connected").style.display = "none";
      }
  });
  ethereum.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  let chain = chainIdMap[Number(ethereum.chainId)].name;
  let symbol = chainIdMap[Number(ethereum.chainId)].symbol;
  const MARKET_WRITE = new ethers.Contract(addresses[chain].marketplace, abis.marketplace, signer);
  const MARKET_READ = new ethers.Contract(addresses[chain].marketplace, abis.marketplace, provider);

//mintFaceNFT();
document.getElementById("mint-face").addEventListener("click", mintFaceNFT);
async function mintFaceNFT() {
  let faceMinter = new ethers.Contract(addresses[chain].faceMinter, abis.faceMinter, signer);
  faceMinter.safeMint(account);
}
 //approveNFT(addresses[chain].faceMinter, 1);
async function approveNFT(_NFTContract, _tokenId) {
  let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
  NFTContract.approve(addresses[chain].marketplace, _tokenId);
}


document.getElementById("approve-all").addEventListener("click", () => {
  approveAll(addresses[chain].faceMinter, true)})
async function approveAll(_NFTContract, _bool) {
  let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
  NFTContract.setApprovalForAll(addresses[chain].marketplace, _bool);
}


let inputEl2 = document.getElementById("contract-input");
document.getElementById("contract-btn").addEventListener("click", () => {
  trustedContracts.push(inputEl2.value);
  fetchWalletCards(8, trustedContracts);});

let inputEl = document.getElementById("list-input");
document.getElementById("list-face").addEventListener("click", () => {
  console.log(inputEl.value);
  //approveNFT(addresses[chain].faceMinter, inputEl.value);
  listMarketItem(addresses[chain].faceMinter, inputEl.value, 1000000000000000);});
async function listMarketItem(_NFTContract, _tokenId, _price) {
  MARKET_WRITE.createMarketItem(_NFTContract, _tokenId, _price);
}

async function cancelMarketItem(_NFTContract, _marketItemId) {
  MARKET_WRITE.cancelMarketItem(_NFTContract, _marketItemId);
}

async function buyMarketItem(_NFTContract, _marketId, _price) {
  MARKET_WRITE.createMarketSale(_NFTContract, _marketId, {value: _price});
}

async function createCollection(_name, _description, arrayOfMarketIds) {
  MARKET_WRITE.createCollection(_name, _description, arrayOfMarketIds);
}
async function getCollections() {
//   MARKET_READ.
 }

async function fetchSellingItemsArray() {
  let marketItems = await MARKET_WRITE.fetchSellingMarketItems();
  marketNFTs = [];
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
    let NFTContract = new ethers.Contract(marketNFTs[i].contractAddress, abis.ERC721, provider);
    marketNFTs[i].tokenURI = await NFTContract.tokenURI(marketNFTs[i].tokenId);
    marketNFTs[i].name = await NFTContract.name();
  }
  return marketNFTs;
};

async function fetchNFTsFromContracts(nftContracts) {

  let NFTArray = [];
  for(let i = 0; i < nftContracts.length; i++) {
    let NFTContract = new ethers.Contract(nftContracts[i], abis.ERC721, provider);
    let userbalance = await NFTContract.balanceOf(account);
    let currentOwner;
    

    if( userbalance > 0 ) {
      for( let x = 0; x <= 100; x++ ) {
        try { 
          currentOwner = await NFTContract.ownerOf(x);
          if( currentOwner.toLowerCase() == account.toLowerCase() ) {
            let cardOBJ = {
              name: await NFTContract.name(),
              tokenURI: await NFTContract.tokenURI(x),
              tokenId: x,
              contractAddress: NFTContract.address,
            }
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
    let NFTContract = new ethers.Contract(marketNFTs[i].contractAddress, abis.ERC721, provider);
    marketNFTs[i].tokenURI = await NFTContract.tokenURI(marketNFTs[i].tokenId);
    marketNFTs[i].name = await NFTContract.name();
  }
  return marketNFTs;
}

let nftContracts = trustedContracts[chain];

fetchExploreCards(8);
fetchWalletCards(8, nftContracts);
fetchMarketplaceCards(12, "marketplace");
fetchMarketplaceCardsCollectionModal(8);


async function fetchExploreCards(maxAmount) {
  let marketNFTsEl = document.getElementById("market-NFTs");
  let listingLimit = maxAmount -1;
  let htmlHolder = "";
  let NFTName = "";
  let NFTDescription = "";
  let NFTAttributesTraits = "";
  let NFTAttributesValues = "";

  let NFTsArray = await fetchMarketItemsArray();
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
        let metadata = await fetch(NFTsArray[i].tokenURI);
        if(NFTsArray[i].tokenURI.includes("json")){
        try{
          metadata = await metadata.json();
          NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));
          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for(let i=0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
            NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
      }
        htmlHolder += `
        <!-- Card Listing -->
        <div class="col">
          <div class="card shadow-sm">

            <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

            <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>${NFTsArray[i].name} #${NFTsArray[i].tokenId}</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                  </div>
                </div>

                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">${NFTsArray[i].creator.substring(0,6) + "..." + NFTsArray[i].creator.slice(-4)}</p>
                    </div>
                  </div>
                </small>

                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal${i}">View</button>
                      <button type="button" class="btn btn-sm btn-primary buyExplore" id="nftcard-buy${i}">Buy</button>
                    </div>
                  </div>
                </div>

            </div>
          </div>
        </div>

        <!-- Modal (default hidden) -->
        <div class="modal fade" id="nft-modal${i}" tabisndex="-1" aria-labelledby="nft-aria-modal${i}" style="display: none;" aria-hidden="true">
            <div class="modal-dialog modal-xl">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title h4" id="nft-aria-modal${i}">${NFTsArray[i].name} #${NFTsArray[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">


                  <div class="row">

                    <div class="col">

                    <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                    
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
                          <p class="card-text">${NFTsArray[i].creator.substring(0,6) + "..." + NFTsArray[i].creator.slice(-4)}</p>
                        </div>
                      </div>

                      <div class="row">
                        <div class="col text-end pe-1">
                          <p class="card-text"><strong>NFT Contract: </strong></p>       
                        </div>
                        <div class="col ps-1">
                          <p class="card-text">${NFTsArray[i].contractAddress.substring(0,6) + "..." + NFTsArray[i].contractAddress.slice(-4)}</p>
                        </div>
                      </div>

                      <div class="row border-bottom pb-3 mb-3">
                        <div class="col text-end pe-1">
                          <br>
                          <p class="card-text"><strong>Price: </strong></p>      
                        </div>
                        <div class="col ps-1">
                          <br>
                          <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
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
      }
      marketNFTsEl.innerHTML = htmlHolder;
      let arrayOfBuyExplore = document.querySelectorAll(".buyExplore");
      let arrayOfBuyModal = document.querySelectorAll(".buyModal");
      for (let i = 0; i < arrayOfBuyExplore.length; i++) {
      arrayOfBuyExplore[i].addEventListener("click", () => {
        buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
      arrayOfBuyModal[i].addEventListener("click", () => {
        buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
    }
    }

    
async function fetchWalletCards(maxAmount, nftContracts) {
      let walletNFTsEl = document.getElementById("wallet-NFTs");
      let listingLimit = maxAmount -1;
      let htmlHolder = "";
      let NFTName = "";
      let NFTDescription = "";
      let NFTAttributesTraits = "";
      let NFTAttributesValues = "";

      let NFTsArray = await fetchNFTsFromContracts(nftContracts);
      let NFTImage;
      for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
        let metadata = await fetch(NFTsArray[i].tokenURI);
        if(NFTsArray[i].tokenURI.includes("json")){
        try{
          metadata = await metadata.json();
          NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

          NFTName = metadata.name;
          NFTDescription = metadata.description;

          for(let i=0; i < metadata.attributes.length; i++) {
            NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
            NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
          }
        } catch {
          NFTImage = NFTsArray[i].tokenURI;
        }
      } else {
        NFTImage = NFTsArray[i].tokenURI;
      }

        htmlHolder += `
        <!-- Card Listing -->
        <div class="col">
          <div class="card shadow-sm">
          
            <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

            <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>${NFTsArray[i].name} #${NFTsArray[i].tokenId}</strong>
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
          </div>
        </div>

        <!-- Modal (default hidden) -->
        <div class="modal fade" id="nft-modalWallet${i}" tabisndex="-1" aria-labelledby="nft-aria-modalWallet${i}" style="display: none;" aria-hidden="true">
            <div class="modal-dialog modal-xl">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title h4" id="nft-aria-modalWallet${i}">${NFTsArray[i].name} #${NFTsArray[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">


                  <div class="row">

                    <div class="col">
                    <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
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
                          <p class="card-text">${NFTsArray[i].contractAddress.substring(0,6) + "..." + NFTsArray[i].contractAddress.slice(-4)}</p>
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
      }
      walletNFTsEl.innerHTML = htmlHolder;
      let arrayOfApproveWallet = document.querySelectorAll(".approveWallet");
      let arrayOfListWallet = document.querySelectorAll(".listWallet");
      let arrayOfInputWallet = document.querySelectorAll(".inputWallet");
      let arrayOfApproveModal = document.querySelectorAll(".approveModal");
      let arrayOfListModal = document.querySelectorAll(".listModal");
      let arrayOfInputModal = document.querySelectorAll(".inputModal");
      for (let i = 0; i < arrayOfListWallet.length; i++) {
        arrayOfApproveWallet[i].addEventListener("click", () => {
          approveNFT(NFTsArray[i].contractAddress, NFTsArray[i].tokenId);});
        arrayOfListWallet[i].addEventListener("click", () => {
          listMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].tokenId, ethers.utils.parseEther(arrayOfInputWallet[i].value));});
        arrayOfApproveModal[i].addEventListener("click", () => {
          approveNFT(NFTsArray[i].contractAddress, NFTsArray[i].tokenId);});
        arrayOfListModal[i].addEventListener("click", () => {
          listMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].tokenId, ethers.utils.parseEther(arrayOfInputModal[i].value));});
    }
  }



async function fetchMarketplaceCards(maxAmount, location) {
    let marketplaceNFTsEl = document.getElementById(location);
    let listingLimit = maxAmount -1;
    let htmlHolder = "";
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";

    let NFTsArray = await fetchSellingItemsArray();
    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
      let metadata = await fetch(NFTsArray[i].tokenURI);
      if(NFTsArray[i].tokenURI.includes("json")){
      try{
      metadata = await metadata.json();
      NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

      NFTName = metadata.name;
      NFTDescription = metadata.description;

      for(let i=0; i < metadata.attributes.length; i++) {
        NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
        NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";

      }
      } catch {
        NFTImage = NFTsArray[i].tokenURI;
      }
    } else {
      NFTImage = NFTsArray[i].tokenURI;
    }
      if (!NFTsArray[i].sold && !NFTsArray[i].canceled){
      htmlHolder += `
      <div class="col">
          <div class="card shadow-sm">
          
          <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

          <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
              <div class="col"> 
                  <p class="card-text">
                      <strong>${NFTsArray[i].name} #${NFTsArray[i].tokenId}</strong>
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
                          <span class="badge text-bg-warning">For Sale</span>
                      </p>
                  </div>
              </div>

              <div class="row border-bottom pb-3 mb-3">
                  <div class="col text-end pe-1">
                      <p class="card-text"><strong>Price: </strong></p>      
                    </div>
                    <div class="col text-start ps-1">
                      <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                  </div>
              </div>
              </small>

              <div class="row text-center">
              <div class="col">
                  <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#marketlist-nft-modalWallet-${i}">View</button>
                  &nbsp; &nbsp; 
                  <button type="button" class="btn btn-sm btn-outline-danger btn-Delist" id="Delist${i}">Delist</button>
              </div>
              </div>

          </div>
          </div>
      </div>

      <!-- Modal (default hidden) -->
      <div class="modal fade" id="marketlist-nft-modalWallet-${i}" tabisndex="-1" aria-labelledby="marketlist-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title h4" id="marketlist-nft-aria-modalWallet-${i}">FaceMint #14</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">


                  <div class="row">

                  <div class="col">
                  <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
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
                          <p class="card-text">${NFTsArray[i].creator.substring(0,6) + "..." + NFTsArray[i].creator.slice(-4)}</p>
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
                                  <span class="badge text-bg-warning">For Sale</span>
                              </p>
                          </div>
                      </div>
      
                      <div class="row border-bottom pb-3 mb-3">
                          <div class="col text-end pe-1">
                              <p class="card-text"><strong>Price: </strong></p>      
                          </div>
                          <div class="col text-start ps-1">
                              <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                          </div>
                      </div>

                      <div class="row text-center">

                      <div class="col text-center"> 
                          
                          <button type="button" class="btn btn-sm btn-outline-danger btn-DelistModal" id="Delist${i + location}">Delist</button>
                                                                                                     
                      </div>
                      </div>

                      </div>
                  </div>

              </div>
              </div>
          </div>
          </div>`
          }
        }
          marketplaceNFTsEl.innerHTML = htmlHolder;
          let arrayOfDelist = document.querySelectorAll(`#${location} .btn-Delist`);
          console.log(arrayOfDelist)
          let arrayOfDelistModal = document.querySelectorAll(`#${location} .btn-DelistModal`);
          let buttonCounter = 0;
          for (let i = 0; i < NFTsArray.length; i++) {
             if(!NFTsArray[i].canceled && !NFTsArray[i].sold) {
           arrayOfDelist[buttonCounter].addEventListener("click", () => {
             cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)}); 
           arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
             cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)});
             buttonCounter++;
         }
   
      }
      }

async function fetchMarketplaceCardsCollectionModal(maxAmount) {
  let marketplaceNFTsEl = document.getElementById("new-collection-modal");
  let listingLimit = maxAmount -1;
  let htmlHolder = "";
  let NFTsArray = await fetchSellingItemsArray();
  for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {
    let metadata = await fetch(NFTsArray[i].tokenURI);
    if(NFTsArray[i].tokenURI.includes("json")){
    try{
    metadata = await metadata.json();
    NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));
    } catch {
      NFTImage = NFTsArray[i].tokenURI;
    }
  } else {
    NFTImage = NFTsArray[i].tokenURI;
  }
    if (!NFTsArray[i].sold && !NFTsArray[i].canceled){
    htmlHolder += `
    <div class="col">
        <div class="card shadow-sm">
          
        <div class="card-image" style="background-image: url('${NFTImage}');"> </div>

        <div class="card-body">

            <div class="row text-center border-bottom pb-3 mb-3">
            <div class="col"> 
                <p class="card-text">
                    <strong>${NFTsArray[i].name} #${NFTsArray[i].tokenId}</strong>
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
                        <span class="badge text-bg-warning">For Sale</span>
                    </p>
                </div>
            </div>

            <div class="row border-bottom pb-3 mb-3">
                <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col text-start ps-1">
                    <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                </div>
            </div>

            <div class="row border-bottom pb-3 mb-3">
              <div class="col text-end pe-1">
                <p class="card-text"><strong>Collection: </strong></p>      
              </div>
              <div class="col text-start ps-1">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    Add
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
        </div>
    </div>

    <!-- Modal (default hidden) -->
    <div class="modal fade" id="marketlist-nft-modalWallet-${i}" tabisndex="-1" aria-labelledby="marketlist-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title h4" id="marketlist-nft-aria-modalWallet-${i}">FaceMint #14</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">


                <div class="row">

                <div class="col">
                  <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                </div>

                <div class="col">

                    <div class="row">
                    <div class="col text-end pe-1">
                        <p class="card-text"><strong>Description: </strong></p>      
                    </div>
                    <div class="col ps-1">
                        <p class="card-text"><small>TBD</small></p>
                    </div>
                    </div>

                    <div class="row">
                    <div class="col text-end pe-1">
                    <br>
                        <p class="card-text"><strong>Properties </strong>    
                        <br><small>Property 1:</small>  
                        <br><small>Property 2:</small>   
                        <br><small>Property 3:</small></p>      
                    </div>
                    <div class="col ps-1">
                    <br>
                        <p class="card-text">&nbsp;
                        <br><small>Value 1</small>
                        <br><small>Value 2</small>
                        <br><small>Value 3</small></p>
                    </div>
                    </div>

                    <div class="row">
                    <div class="col text-end pe-1">
                        <p class="card-text"><strong>Contract: </strong></p>       
                    </div>
                    <div class="col ps-1">
                        <p class="card-text">${NFTsArray[i].creator.substring(0,6) + "..." + NFTsArray[i].creator.slice(-4)}</p>
                    </div>
                    </div>

                    <div class="row">
                        <div class="col text-end pe-1">
                            <p class="card-text"><strong>Status: </strong></p>      
                        </div>
                        <div class="col text-start ps-1">
                            <p class="card-text">
                                <span class="badge text-bg-warning">For Sale</span>
                            </p>
                        </div>
                    </div>
    
                    <div class="row border-bottom pb-3 mb-3">
                        <div class="col text-end pe-1">
                            <p class="card-text"><strong>Price: </strong></p>      
                        </div>
                        <div class="col text-start ps-1">
                            <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                        </div>
                    </div>

                    <div class="row text-center border-bottom pb-3 mb-3">

                    <div class="col text-center"> 
                        
                        <button type="button" class="btn btn-sm btn-outline-danger btn-DelistModal-CM" id="Delist${i}">Delist</button>

                    </div>
                    </div>

                    </div>
                </div>

            </div>
            </div>
        </div>
        </div>`
        }
      }
        marketplaceNFTsEl.innerHTML = htmlHolder;
        let arrayOfDelist = document.querySelectorAll(".btn-Delist-CM");
        let arrayOfDelistModal = document.querySelectorAll(".btn-DelistModal-CM");
        let buttonCounter = 0;
        
        for (let i = 0; i < NFTsArray.length; i++) {
            if(!NFTsArray[i].canceled && !NFTsArray[i].sold) {
          console.log(arrayOfDelist[buttonCounter])
          arrayOfDelist[buttonCounter].addEventListener("click", () => {
            cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)}); 
          arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
            cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)});
          
        }
  
    }
    }


      //------------------- //
      // MINT NFTs
      //------------------- //

      const btn = document.querySelector('#mintNftButton');
      const form = document.querySelector('#mintNftForm');
      const messageEl = document.querySelector('#mintNftMessage');

      btn.addEventListener('click', (e) => {
          e.preventDefault();
          postNFT();
      });

      const postNFT = async () => {
        try {
            document.getElementById('mint-nft-status').classList.remove('d-none');
            document.getElementById('mintNftButton').setAttribute('disabled', '');

            let response = await fetch('api/mint', {
            method: 'POST',
            body: new FormData(form),
            });
            const result = await response.json();
            const metaUri = result.data.metadata.replace('ipfs://', 'https://ipfs.io/ipfs/');
            console.log(metaUri)
            mintNFT (metaUri);
            // result.data.metadata.image

            showMessage(result.message, response.status == 200 ? 'success' : 'error');
        } catch (error) {
            showMessage(error.message, 'error');
        }
      };

      async function mintNFT (_uri) {
        try {
          const astarMinter = new ethers.Contract(addresses[chain].astarMinter, abis.astarMinter, signer);
          const result = await astarMinter.safeMint(account, _uri);

            document.getElementById('mint-nft-status').classList.add('d-none');
            document.getElementById('mintNftButton').removeAttribute('disabled', '');
            showMessage("Your NFT is minted!", 'success');
        } catch (error) {
            showMessage("Something went wrong with the minting...", 'error');
        }

      };

      const showMessage = (message, type = 'success') => {
        messageEl.innerHTML += `
            <div class="alert alert-${type}">
            ${message}
            </div>
        `;
      };

};

// -----------------------
// TABS NAV             //
// -----------------------

function Tabs() {

  var bindAll = function() {

    var getActiveDataTab;

    if(sessionStorage.getItem('activeDataTab') === null) {
      sessionStorage.setItem('activeDataTab', 'view-1');
      getActiveDataTab = sessionStorage.setItem('activeDataTab', 'view-1');
    }

    if(sessionStorage.getItem('activeDataTab') !== "") {
      getActiveDataTab = sessionStorage.getItem('activeDataTab');
      clear();
      document.querySelector('[data-tab="'+ getActiveDataTab +'"]').classList.add('active');
      document.getElementById(getActiveDataTab).classList.add('active');
    } else {
      sessionStorage.setItem('activeDataTab', 'view-1');
      getActiveDataTab = sessionStorage.getItem('activeDataTab');
      clear();
      document.querySelectorAll('[data-tab="'+ getActiveDataTab +'"]').classList.add('active');
      document.getElementById(getActiveDataTab).classList.add('active');
    }

    var menuElements = document.querySelectorAll('[data-tab]');
    for(var i = 0; i < menuElements.length ; i++) {
      menuElements[i].addEventListener('click', change, false);
    }

  }

  var clear = function() {
    var menuElements = document.querySelectorAll('[data-tab]');
    for(var i = 0; i < menuElements.length ; i++) {
      menuElements[i].classList.remove('active');
      var id = menuElements[i].getAttribute('data-tab');
      document.getElementById(id).classList.remove('active');
    }
  }

  var change = function(e) {
    clear();
    e.target.classList.add('active');
    var id = e.currentTarget.getAttribute('data-tab');
    sessionStorage.setItem('activeDataTab', id);
    document.getElementById(id).classList.add('active');
  }

  bindAll();
}
var connectTabs = new Tabs();



//------------------- //
// MINT NFTs
//------------------- //

const btn = document.querySelector('#mintNftButton');
const form = document.querySelector('#mintNftForm');
const messageEl = document.querySelector('#mintNftMessage');

btn.addEventListener('click', (e) => {
    e.preventDefault();
    postNFT();
});

const postNFT = async () => {
  try {
      let response = await fetch('api/mint', {
      method: 'POST',
      body: new FormData(form),
      });
      const result = await response.json();

      // Get's the NFT Metadata
      console.log(result.data.metadata);
      // result.data.metadata.image

      showMessage(result.message, response.status == 200 ? 'success' : 'error');
  } catch (error) {
      showMessage(error.message, 'error');
  }
};

const showMessage = (message, type = 'success') => {
  messageEl.innerHTML = `
      <div class="alert alert-${type}">
      ${message}
      </div>
  `;
};


// NFT Media Preview

var loadFile = function(event) {
  let nftMediaPreview = document.getElementById('nftMediaPreview');
  let previewPath = URL.createObjectURL(event.target.files[0]);

  if(event.target.files[0].type.includes('video/')) {
    nftMediaPreview.innerHTML = `<video controls style="width:100%;"><source src="${previewPath}" type="video/mp4"></video>`;
  } else {
    nftMediaPreview.innerHTML = `<div class="card-image image-radius" style="background-image: url('${previewPath}');"> </div>`;
  }

}



// Easter Egg: Shibooyakasha

document.getElementById("network-name").addEventListener("click", function () {

  setTimeout(() => {
    document.getElementById('shibooyakasha').className = 'animate__animated animate__zoomInUp';
  }, "1000")

  setTimeout(() => {
    document.getElementById('shibooyakasha-img').className = 'animate__animated animate__repeat-2 animate__bounce animate__tada';
  }, "2000")

  setTimeout(() => {
    document.getElementById('shibooyakasha').className = 'animate__animated animate__faster animate__zoomOutUp';
  }, "4500")

  setTimeout(() => {
    document.getElementById('shibooyakasha').className = 'hide';
  }, "5000")
  
  document.getElementById("shibooyakasha-mp3").play();
});