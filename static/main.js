
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

  console.log(chain)
  const MARKET_WRITE = new ethers.Contract(addresses[chain].marketplace, abis.marketplace, signer);
  const MARKET_READ = new ethers.Contract(addresses[chain].marketplace, abis.marketplace, provider);

//mintFaceNFT();
// document.getElementById("mint-face").addEventListener("click", mintFaceNFT);
// async function mintFaceNFT() {
//   let faceMinter = new ethers.Contract(addresses[chain].faceMinter, abis.faceMinter, signer);
//   faceMinter.safeMint(account);
// }

 //approveNFT(addresses[chain].faceMinter, 1);
async function approveNFT(_NFTContract, _tokenId) {
  let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
  NFTContract.approve(addresses[chain].marketplace, _tokenId);
}


// document.getElementById("approve-all").addEventListener("click", () => {
//   approveAll(addresses[chain].faceMinter, true)})
// async function approveAll(_NFTContract, _bool) {
//   let NFTContract = new ethers.Contract(_NFTContract, abis.ERC721, signer);
//   NFTContract.setApprovalForAll(addresses[chain].marketplace, _bool);
// }


let inputEl2 = document.getElementById("contract-input");
document.getElementById("contract-btn").addEventListener("click", () => {
  trustedContracts.push(inputEl2.value);
  fetchWalletCards(8, trustedContracts);});

// let inputEl = document.getElementById("list-input");
// document.getElementById("list-face").addEventListener("click", () => {
//   console.log(inputEl.value);
//   //approveNFT(addresses[chain].faceMinter, inputEl.value);
//   listMarketItem(addresses[chain].faceMinter, inputEl.value, 1000000000000000);});


async function listMarketItem(_NFTContract, _tokenId, _price) {
  MARKET_WRITE.createMarketItem(_NFTContract, _tokenId, _price);
}

async function cancelMarketItem(_NFTContract, _marketItemId) {
  MARKET_WRITE.cancelMarketItem(_NFTContract, _marketItemId);
}

async function delistCollection(_collectionId) {
  console.log("stakeCollection ");
  MARKET_WRITE.delistCollection(_collectionId);
}

async function buyMarketItem(_NFTContract, _marketId, _price) {
  MARKET_WRITE.createMarketSale(_NFTContract, _marketId, {value: _price});
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
fetchExploreCollectionCards(8);
fetchWalletCards(8, nftContracts);
fetchMarketplaceCards(8, "marketplace");
fetchMarketplaceCardsCollectionModal(8);
fetchCollections();

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
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-${NFTsArray[i].marketId}">View</button>
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
      <div class="modal fade" id="nft-modal-${NFTsArray[i].marketId}" tabisndex="-1" aria-labelledby="nft-aria-modal${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title h4" id="nft-aria-modal${i}">${NFTName} #${NFTsArray[i].tokenId}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">


                <div class="row">

                  <div class="col">
                    <div class="card m-3">
                      <div class="card__inner">
                        <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                        <div class="lux full"></div>
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
    cardEffect('#market-NFTs');

    let arrayOfBuyExplore = document.querySelectorAll(".buyExplore");
    let arrayOfBuyModal = document.querySelectorAll(".buyModal");
    for (let i = 0; i < arrayOfBuyExplore.length; i++) {
      arrayOfBuyExplore[i].addEventListener("click", () => {
        buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
      arrayOfBuyModal[i].addEventListener("click", () => {
        buyMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId, NFTsArray[i].priceBN);});
    }
  }




  async function fetchExploreCollectionCards(maxAmount) {
    let exploreCollections = document.getElementById("collectionsListing");
    let listingLimit = maxAmount -1;
    let NFTName = "";
    let NFTDescription = "";
    let NFTAttributesTraits = "";
    let NFTAttributesValues = "";
  
    let NFTsArray = await fetchMarketItemsArray();

    let collections = await MARKET_READ.getActiveCollections();
    let tempHTML = "";

    for( let i = 0; i < collections.length; i++){

        let activeIds = [];
        for(let j = 0; j < collections[i].marketIds.length; j++) {
          activeIds.push( ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0) );
        }

        const activeNFTList = NFTsArray.filter((item) => {
          return activeIds.includes(item.marketId);
        });

        let NFTName = NFTsArray.name;
        let NFTImage = "";
        let NFTImages = "";


        for (let j = 0; j < activeNFTList.length; j++) {

          let metadata = await fetch(activeNFTList[j].tokenURI);
          if(activeNFTList[j].tokenURI.includes("json")){
            try {
              metadata = await metadata.json();
              NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

              NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}');"> </div></div>`;


              for (let i=0; i < metadata.attributes.length; i++) {
                NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
                NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
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
                <p class="card-text">0 ${symbol}</p>
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
                <p class="card-text">0</p>
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
                  <p class="card-text">${collections[i].creator.substring(0,6) + "..." + collections[i].creator.slice(-4)}</p>
                </div>
            </div>
          </small>
          <div class="row border-bottom pb-3 mb-3">
            <div class="col">
              <div class="input-group input-group-sm">
                <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="input-explore-stake">
                <span class="input-group-text">${symbol}</span>
                <button class="btn btn-primary" type="button" id="button-explore-stake-${i}">Stake</button>
                <button class="btn btn-outline-danger" type="button" id="button-explore-unstake-${i}">Unstake</button>
              </div>
            </div>
          </div>

          <div class="row text-center">
            <div class="col text-start">
              <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#collection-explore-modal-${i}">View</button>
            </div>

            <div class="col text-end">
              <button id="report-${i}"type="button" class="btn btn-sm btn-link light-grey">Report (<span id="report-explore-0">0</span>)</button>
            </div>
          </div>

        </div>


        <div class="lux collections"></div>
        </div>

      </div>
    </div>

  
    <div class="modal fade" id="collection-explore-modal-${i}" tabindex="-1" aria-labelledby="collection-explore-aria-modal--${i}" style="display: none;" aria-hidden="true">
    <div class="modal-dialog modal-xl">
    <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title h4" id="collection-explore-aria-modal-${i}">${collections[i].name}</h5>
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
              <p class="card-text">0 ${symbol}</p>
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
              <p class="card-text">0</p>
            </div>
          </div>

          <div class="row">
            <div class="col text-end pe-1">
              <p class="card-text"><strong>Earnings: </strong></p>     
            </div>
            <div class="col ps-1">
              <p class="card-text">0 ${symbol}</p>
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
              <p class="card-text">${collections[i].creator.substring(0,6) + "..." + collections[i].creator.slice(-4)}</p>
            </div>
          </div>

          <div class="row pb-3 mb-3">
            <div class="col">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="i.e. 100.00" aria-describedby="button-stake" id="modal-input-explore-stake">
                <span class="input-group-text">${symbol}</span>
                <button class="btn btn-primary" type="button" id="modal-button-explore-stake-${i}">Stake</button>
                <button class="btn btn-outline-danger" type="button" id="modal-button-explore-unstake-${i}">Unstake</button>
              </div>
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
    cardEffect('#collectionsListing');

    // Add Cards
    for( let i = 0; i < collections.length; i++){
    
         document.getElementById(`report-${i}`).addEventListener("click", () => {
          console.log(collections[i]["active"])
          console.log(collections[i]["reportCount"])
          reportCollection(collections[i]["collectionId"]);
      
         });
       

        let activeIds = [];
        for(let j = 0; j < collections[i].marketIds.length; j++) {
          activeIds.push( ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0) );
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
          if(activeNFTList[j].tokenURI.includes("json")){
            try {
              metadata = await metadata.json();
              NFTName = metadata.name;
              NFTDescription = metadata.description;
              NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

              NFTImages += `<div class="col"><img src="${metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}" alt="${NFTName}" class="img-fluid"></div>`;


              for (let i=0; i < metadata.attributes.length; i++) {
                NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
                NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
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
                      <p class="card-text">${activeNFTList[j].price} ${symbol}</p>
                    </div>
                  </div>
    
                  <div class="row border-bottom pb-3 mb-3">
                      <div class="col text-end pe-1">
                        <p class="card-text"><strong>Creator: </strong></p>       
                      </div>
                      <div class="col ps-1">
                        <p class="card-text">${activeNFTList[j].creator.substring(0,6) + "..." + activeNFTList[j].creator.slice(-4)}</p>
                      </div>
                    </div>
                  </small>
    
                  <div class="row text-center">
                    <div class="col">
                      <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal-${activeNFTList[j].marketId}">View</button>
                        <button type="button" class="btn btn-sm btn-primary buyCollectionModal-${i}" id="nftcard-buy${j}">Buy</button>
                      </div>
                    </div>
                  </div>
    
              </div>
  
              <div class="lux"></div>
              </div>
  
            </div>
          </div>`;

        
        document.getElementById(`explore-collection-nfts-modal-${i}`).innerHTML = htmlHolder;
        cardEffect(`#explore-collection-nfts-modal-${i}`);

        
    
    
      }

      

      //runs through each collection
      let arrayOfBuyCollectionModal = document.querySelectorAll(`.buyCollectionModal-${i}`);
      //runs for each item inside the collection

      

      for (let y = 0; y < arrayOfBuyCollectionModal.length; y++) {

   
        arrayOfBuyCollectionModal[y].addEventListener("click", async () => { 
          currentId = await ethers.utils.formatUnits(collections[i]["marketIds"][y], 0);
          console.log(currentId)

          //find index of marketID
          for(let z = 0; z < NFTsArray.length; z++) {
            if( NFTsArray[z]["marketId"] == currentId) {
              let _contract = await NFTsArray[z]["contractAddress"];
              let _marketId = await NFTsArray[z]["marketId"];
              let _priceBN = await NFTsArray[z]["priceBN"];

              buyMarketItem(_contract, _marketId, _priceBN)
            }} });
      }
    }
    
  }

//returns  contract balance
async function getBalance() {
  return ethers.utils.formatUnits( await MARKET_READ.getBalance(), 0);
}

async function reportCollection(collectionId) {
  MARKET_WRITE.reportCollection(collectionId);
}






    


async function fetchWalletCards(maxAmount, nftContracts) {
      let walletNFTsEl = document.getElementById("wallet-NFTs");
      let listingLimit = maxAmount -1;
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
                  <h5 class="modal-title h4" id="nft-aria-modalWallet${i}">${NFTName} #${NFTsArray[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">


                  <div class="row">

                    <div class="col">
                        <div class="card m-3">
                            <div class="card__inner">
                            <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                            <div class="lux full"></div>
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
      document.getElementById('walletNftsCount').innerHTML = walletNftsCount;
      cardEffect('#wallet-NFTs');

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
    let saleStatus = "";
    let marketplaceNftsCount = 0;

    

    let NFTsArray = await fetchSellingItemsArray();

    for (let i = 0; i < NFTsArray.length && i <= listingLimit; i++) {

      
      let metadata = await fetch(NFTsArray[i].tokenURI);

      if(!NFTsArray[i].canceled && !NFTsArray[i].sold) {
        marketplaceNftsCount++
      }

      if (NFTsArray[i].sold) {
        saleStatus = `<span class="badge text-bg-success">Sold</span>`;
      } else {
        saleStatus = `<span class="badge text-bg-warning">For Sale</span>`;
      }

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
        NFTName = NFTsArray[i].name;
        NFTDescription = "none";
        NFTAttributesTraits = "";
        NFTAttributesValues = "";
      }
      if (!NFTsArray[i].sold && !NFTsArray[i].canceled){
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
                      <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
                  </div>
              </div>
              </small>

              <div class="row text-center">
              <div class="col">
                  <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#${location}-nft-modalWallet-${NFTsArray[i].marketId}">View</button>
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
      <div class="modal fade" id="${location}-nft-modalWallet-${NFTsArray[i].marketId}" tabisndex="-1" aria-labelledby="${location}-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title h4" id="${location}-nft-aria-modalWallet-${i}">${NFTName} #${NFTsArray[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">


                  <div class="row">

                  <div class="col">
                      <div class="card m-3">
                          <div class="card__inner">
                          <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                          <div class="lux full"></div>
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
                                ${saleStatus}
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
          document.getElementById('marketplaceNftsCount').innerHTML = marketplaceNftsCount;
          cardEffect('#marketplace');

          let arrayOfDelist = document.querySelectorAll(`#${location} .btn-Delist`);
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
                    <p class="card-text">${NFTsArray[i].price} ${symbol}</p>
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

        <div class="lux collections"></div>
        </div>

        </div>
    </div>`;

    htmlModalHolder +=`
      <!-- Modal (default hidden) -->
      <div class="modal fade" id="marketlist-nft-modalWallet-${i}" tabisndex="-1" aria-labelledby="marketlist-nft-aria-modalWallet-${i}" style="display: none;" aria-hidden="true">
          <div class="modal-dialog modal-xl">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title h4" id="marketlist-nft-aria-modalWallet-${i}">${NFTName} #${NFTsArray[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">

                  <div class="row">

                  <div class="col">
                      <div class="card m-3">
                          <div class="card__inner">
                          <div class="card-image image-radius" style="background-image: url('${NFTImage}');"> </div>
                          <div class="lux full"></div>
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
                                ${saleStatus}
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
        document.getElementById("my-wallet-new-collection-nft-modals").innerHTML = htmlModalHolder;
        cardEffect("#new-collection-modal");
        cardEffect("#my-wallet-new-collection-nft-modals");


        let arrayOfDelist = document.querySelectorAll(".btn-Delist-CM");
        let arrayOfDelistModal = document.querySelectorAll(".btn-DelistModal-CM");
        let buttonCounter = 0;
        
        for (let i = 0; i < NFTsArray.length; i++) {
            if(!NFTsArray[i].canceled && !NFTsArray[i].sold) {
          arrayOfDelist[buttonCounter].addEventListener("click", () => {
            cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)}); 
          arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
            cancelMarketItem(NFTsArray[i].contractAddress, NFTsArray[i].marketId)});
          
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

  for( let i = 0; i < collections.length; i++){
    if(collections[i].creator.toLowerCase() == account.toLowerCase()) {
      collectionsCount++;

      let activeIds = [];
      for(let j = 0; j < collections[i].marketIds.length; j++) {
        activeIds.push( ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0) );
      }

      const activeNFTList = NFTsArray.filter((item) => {
        return activeIds.includes(item.marketId);
      });

      let NFTName = NFTsArray.name;
      let NFTImage = "";
      let NFTImages = "";


      for (let j = 0; j < activeNFTList.length; j++) {

        let metadata = await fetch(activeNFTList[j].tokenURI);
        if(activeNFTList[j].tokenURI.includes("json")){
          try {
            metadata = await metadata.json();
            NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

            NFTImages += `<div class="col"><div class="card-image" style="background-image: url('${metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}');"> </div></div>`;


            for (let i=0; i < metadata.attributes.length; i++) {
              NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
              NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
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
              <p class="card-text">0 ${symbol}</p>
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
              <p class="card-text">0</p>
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
                <p class="card-text">${collections[i].creator.substring(0,6) + "..." + collections[i].creator.slice(-4)}</p>
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


      <div class="lux collections"></div>
      </div>

    </div>
  </div>


  <div class="modal fade" id="my-wallet-collection-modal-${i}" tabindex="-1" aria-labelledby="my-wallet-collection-aria-modal-${i}" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
  <div class="modal-content">
  <div class="modal-header">
    <h5 class="modal-title h4" id="my-wallet-collection-aria-modal-${i}">${collections[i].name}</h5>
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
            <p class="card-text">0 ${symbol}</p>
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
            <p class="card-text">0</p>
          </div>
        </div>

        <div class="row">
          <div class="col text-end pe-1">
            <p class="card-text"><strong>Earnings: </strong></p>     
          </div>
          <div class="col ps-1">
            <p class="card-text">0 ${symbol}</p>
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
            <p class="card-text">${collections[i].creator.substring(0,6) + "..." + collections[i].creator.slice(-4)}</p>
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
  cardEffect('#my-collections');

  document.getElementById('collectionsCount').innerHTML = collectionsCount;

  // Delist collection 

  let arrayOfDelist = document.querySelectorAll(`#my-collections .btn-DelistCollection`);
  let arrayOfDelistModal = document.querySelectorAll(`#my-collections .btn-DelistCollectionModal`);
  // let arrayOfStakeModal = document.querySelectorAll(`#my-collections .btn-StakeCollectionModal`);
  let buttonCounter = 0;

  for (let i = 0; i < collections.length; i++) {

    if( (collections[i].creator.toLowerCase() === account.toLowerCase()) && collections[i].active ) {
      arrayOfDelist[buttonCounter].addEventListener("click", () => {
        delistCollection(collections[i].collectionId)}); 
      arrayOfDelistModal[buttonCounter].addEventListener("click", () => {
        delistCollection(collections[i].collectionId)});
      // arrayOfStakeModal[buttonCounter].addEventListener("click", () => {
      //   stakeCollection(collections[i].collectionId)});
      buttonCounter++;
    }
    
  }
  



  // Add Cards
  for( let i = 0; i < collections.length; i++){

    if(collections[i].creator.toLowerCase() == account.toLowerCase()) {

      let activeIds = [];
      for(let j = 0; j < collections[i].marketIds.length; j++) {
        activeIds.push( ethers.utils.formatUnits(collections[i].marketIds[j]._hex, 0) );
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
        if(activeNFTList[j].tokenURI.includes("json")){
          try {
            metadata = await metadata.json();
            NFTName = metadata.name;
            NFTDescription = metadata.description;
            NFTImage = (metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'));

            NFTImages += `<div class="col"><img src="${metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}" alt="${NFTName}" class="img-fluid"></div>`;


            for (let i=0; i < metadata.attributes.length; i++) {
              NFTAttributesTraits += "<br><small><b>" + metadata.attributes[i].trait_type + "</b>:</small>";
              NFTAttributesValues += "<br><small>" + metadata.attributes[i].value + "</small>";
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
                  <div class="col ps-1">
                    <p class="card-text">${activeNFTList[j].price} ${symbol}</p>
                  </div>
                </div>
  
                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">${activeNFTList[j].creator.substring(0,6) + "..." + activeNFTList[j].creator.slice(-4)}</p>
                    </div>
                  </div>
                </small>
  
                <div class="row text-center">
                  <div class="col">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#marketplace-nft-modalWallet-${activeNFTList[j].marketId}">View</button>
                  </div>
                </div>
  
            </div>

            <div class="lux"></div>
            </div>

          </div>
        </div>`;

      
      document.getElementById(`my-wallet-collection-nfts-modal-${i}`).innerHTML = htmlHolder;
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


// Create new collection

const listCollection = document.querySelector('#listCollection');
const listCollectionMessage = document.querySelector('#listCollectionMessage');

listCollection.addEventListener('click', (e) => {
    e.preventDefault();
    createCollection();
});

async function createCollection() {

  let name = document.querySelector('#new-collection-modal-1 #newCollectionName').value;
  let description = document.querySelector('#new-collection-modal-1 #newCollectionDescription').value;
  let totalMarketEls = document.querySelectorAll(".form-check-input")

  let selectedNFTs = [];

  for(let i = 0; i < totalMarketEls.length; i++) {
    if(totalMarketEls[i].checked) {
      console.log(totalMarketEls[i].id);
      selectedNFTs.push(totalMarketEls[i].id.slice(11)) //removes MARKET_ID: 
    }
  }

  try { 
    document.getElementById('listCollectionStatus').classList.remove('d-none');
    document.getElementById('listCollection').setAttribute('disabled', '');


    MARKET_WRITE.createCollection(name, description, selectedNFTs);

    document.getElementById('listCollectionStatus').classList.add('d-none');
    document.getElementById('listCollection').removeAttribute('disabled', '');
    showMessageCollection("Your new collection is listed!", 'success');
  } catch (error) {
    showMessageCollection("Something went wrong...", 'error');
  }

 }

const showMessageCollection = (message, type = 'success') => {
  listCollectionMessage.innerHTML += `
    <div class="alert alert-${type}">
    ${message}
    </div>
  `;
};



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


//////////////////////////////
///REAL dApp Staking !!///
///////////////////////////////
// function bond_and_stake(address, uint128) external;

 const DAPPS_WRITE = new ethers.Contract(addresses[chain].dAppsStaking, abis.dAppsStaking, signer);
 const DAPPS_READ = new ethers.Contract(addresses[chain].dAppsStaking, abis.dAppsStaking, provider);

//await DAPPS_WRITE.bond_and_stake("0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8", 1);

//console.log(await DAPPS_READ.read_current_era());

////////////////////
///ADAO STAKING ///
///////////////////

// console.log(account)

// const ADAO_WRITE = new ethers.Contract(addresses[chain].adaoContract, abis.adaoContract, signer);
// const ADAO_READ = new ethers.Contract(addresses[chain].adaoContract, abis.adaoContract, provider);


// await withdraw(1);
// //await deposit(account, .01);


// async function deposit(_address, _amount) {
// ADAO_WRITE.depositFor(_address, {value: ethers.utils.parseEther(_amount.toString()) });
  

//   console.log("deposited");
// }

// async function withdraw(_amount) {
//   ADAO_WRITE.withdraw(ethers.utils.parseEther(_amount.toString()));

//   console.log("withdrawn");
// }


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


// NFT Media Preview

var loadFile = function(event) {
  let nftMediaPreview = document.getElementById('nftMediaPreview');
  let previewPath = URL.createObjectURL(event.target.files[0]);

  if(event.target.files[0].type.includes('video/')) {
    nftMediaPreview.innerHTML = `<video controls style="width:100%;"><source src="${previewPath}" type="video/mp4"></video>`;
  } else {
    nftMediaPreview.innerHTML = `<div class="card__inner"> <div class="card-image image-radius" style="background-image: url('${previewPath}');"> </div> <div class="lux full"></div> </div>`;
  }

  cardEffect("#mint-nft-modal-1");

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



// Card Effect
function cardEffect(_parentId) {

  $(`${_parentId} .card__inner`).mousemove(function(e) {
    var off = $(this).offset();
    var h = $(this).height() / 2;
    var w = $(this).width() / 2;
    var x = event.pageY - off.top - h;
    var y = event.pageX - off.left - w;
    var xDeg = - (x * (Math.PI / 180));
    var yDeg = y * (Math.PI / 180);
    var rad = Math.atan2(x,y);
    var radPI = rad * 180 / Math.PI - 90;
    $(this).css('transform', 'rotateX(' + xDeg + 'deg) rotateY(' + yDeg + 'deg) scale3d(1.025,1.025,1.025) perspective(1000px)' );
    $(this).find('.lux').css('background', 'linear-gradient(' + radPI + 'deg, rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 80%)' );
  });
  
  $(`${_parentId} .card__inner`).mouseout(function() {
    $(this).css('transform', 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1) perspective(0)' );
  });
  $(`${_parentId} .lux`).mousedown(function() {
    $(this).hide();
  });
  $(`${_parentId} .lux`).mouseup(function() {
    $(this).show();
  });

}

cardEffect("#view-2");