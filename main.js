
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

//mintFaceNFT();
document.getElementById("mint-face").addEventListener("click", mintFaceNFT)
async function mintFaceNFT() {
  let faceMinter = new ethers.Contract(address.faceMinter, abi.faceMinter, signer);
  faceMinter.safeMint();
}
 //approveNFT(address.faceMinter, 1);
async function approveNFT(_NFTContract, _tokenId) {
  let NFTContract = new ethers.Contract(_NFTContract, abi.ERC721, signer);
  NFTContract.approve(address.marketplace, _tokenId);
}

//approveAll(address.faceMinter, true);
async function approveAll(_NFTContract, _bool) {
  let NFTContract = new ethers.Contract(_NFTContract, abi.ERC721, signer);
  NFTContract.setApprovalForAll(address.marketplace, _bool);
}

//listMarketItem(address.faceMinter, 1, 2000000000000000); //.002 Ether
let inputEl = document.getElementById("list-input");
document.getElementById("list-face").addEventListener("click", () => {
  approveNFT(address.faceMinter, inputEl.value);
  listMarketItem(address.faceMinter, inputEl.value, 1000000000000000);});
async function listMarketItem(_NFTContract, _tokenId, _price) {
  let market = new ethers.Contract(address.marketplace, abi.marketplace, signer)
  market.createMarketItem(_NFTContract, _tokenId, _price);
}
//cancelMarketItem(address.faceMinter, 2); //.001 Ether
async function cancelMarketItem(_NFTContract, _marketItemId) {
  let market = new ethers.Contract(address.marketplace, abi.marketplace, signer)
  market.cancelMarketItem(_NFTContract, _marketItemId);
}

async function buyMarketItem(_NFTContract, _marketId, _price) {
  console.log(_price)
  let market = new ethers.Contract(address.marketplace, abi.marketplace, signer);
  market.createMarketSale(_NFTContract, _marketId, {value: _price});
}


console.log( await fetchNFTsFromContract(address.faceMinter) );

async function fetchNFTsFromContract(_NftContractAddress) {
  let NFTContract = new ethers.Contract(_NftContractAddress, abi.ERC721, provider);
  let userbalance = await NFTContract.balanceOf(account);
  let NFTArray = [];
  let currentOwner;

  if( userbalance > 0 ) {
    for( let i = 0; i <= 100; i++ ) {
      try { currentOwner = await NFTContract.ownerOf(i);
      } catch (e) {
        if (i != 0){
          return NFTArray;
        }
      }
          if( currentOwner.toLowerCase() == account.toLowerCase() ) {
            let cardOBJ = {
              name: await NFTContract.name(),
              tokenURI: await NFTContract.tokenURI(i),
            }
            NFTArray.push(cardOBJ);
          }
        }
        return NFTArray;
    }
  }


let nftListing = document.getElementById("nftListing");
let walletNFTs = document.getElementById("wallet-NFTs");


async function fetchMarketItemsArray() {
  let market = new ethers.Contract(address.marketplace, abi.marketplace, provider)
  let marketItems = await market.fetchAvailableMarketItems();
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
    let NFTContract = new ethers.Contract(marketNFTs[i].contractAddress, abi.ERC721, provider);
    marketNFTs[i].tokenURI = await NFTContract.tokenURI(marketNFTs[i].tokenId);
    marketNFTs[i].name = await NFTContract.name();
  }
  return marketNFTs;
}


walletNFTs.innerHTML = await fetchMarketCards(3);
nftListing.innerHTML = await fetchMarketCards(8);

async function fetchMarketCards(maxAmount) {
  let marketNFTs = await fetchMarketItemsArray();
  let listingLimit = maxAmount -1;
  let htmlHolder = "";

    for (let i = 0; i < marketNFTs.length && i <= listingLimit; i++) {
        htmlHolder += `
        <!-- Card Listing -->
        <div class="col">
          <div class="card shadow-sm">
            <img src="${marketNFTs[i].tokenURI}" alt="${marketNFTs[i].name} #${marketNFTs[i].tokenId}"/>

            <div class="card-body">

              <div class="row text-center border-bottom pb-3 mb-3">
                <div class="col"> 
                    <p class="card-text">
                      <strong>${marketNFTs[i].name} #${marketNFTs[i].tokenId}</strong>
                    </p>
                </div>
              </div>
        
              <small>
                <div class="row">
                  <div class="col text-end pe-1">
                    <p class="card-text"><strong>Price: </strong></p>      
                  </div>
                  <div class="col ps-1">
                    <p class="card-text">${marketNFTs[i].price} SBY</p>
                  </div>
                </div>

                <div class="row border-bottom pb-3 mb-3">
                    <div class="col text-end pe-1">
                      <p class="card-text"><strong>Creator: </strong></p>       
                    </div>
                    <div class="col ps-1">
                      <p class="card-text">${marketNFTs[i].creator.substring(0,6) + "..." + account.slice(-4)}</p>
                    </div>
                  </div>
                </small>

                <div class="row text-center">
                  <div class="col">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#nft-modal${i}">View</button>
                      <button type="button" class="btn btn-sm btn-primary" id="nftcard-buy${i}">Buy</button>
                    </div>
                  </div>
                </div>

            </div>
          </div>
        </div>

        <!-- Modal (default hidden) -->
        <div class="modal fade" id="nft-modal${i}" tabindex="-1" aria-labelledby="nft-aria-modal${i}" style="display: none;" aria-hidden="true">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title h4" id="nft-aria-modal${i}">${marketNFTs[i].name} #${marketNFTs[i].tokenId}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <img src="${marketNFTs[i].tokenURI}" alt="${marketNFTs[i].name} #${marketNFTs[i].tokenId}"/>
                  <p class="card-text">${marketNFTs[i].price} SBY
                    <br><strong>Creator: </strong>${marketNFTs[i].creator}
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <button id="nftmodal-buy${i}" type="button" class="btn btn-primary">Buy</button>
                    <small class="text-muted">9 mins</small>
                  </div>

                </div>
              </div>
            </div>
          </div>
        `;
    }
    return htmlHolder;
  }

  





// // Get the tokens that the account received
//   const eventsReceivedTokens = await contract.getPastEvents("Transfer", {
//     filter: {
//       to: account,
//     },
//     fromBlock: 0,
//   });

//   // Count the number of times the account received the token
//   let receivedTokensCount = {};
//   for (let key in eventsReceivedTokens) {
//     let tokenId = eventsReceivedTokens[key]["returnValues"]["tokenId"];
//     receivedTokensCount[tokenId] = (receivedTokensCount[tokenId] || 0) + 1;
//   }

//   let receivedTokenIds = Object.keys(receivedTokensCount);

//   // Get the tokens that the account sent
//   const eventsSentTokens = await contract.getPastEvents("Transfer", {
//     filter: {
//       from: account,
//       tokenId: receivedTokenIds,
//     },
//     fromBlock: 0,
//   });

//   let sentTokensCount = {};
//   for (let key in eventsSentTokens) {
//     let tokenId = eventsSentTokens[key]["returnValues"]["tokenId"];
//     sentTokensCount[tokenId] = (sentTokensCount[tokenId] || 0) + 1;
//   }

//   // Substract the tokens received by the sent to get the tokens owned by account
//   // Store them on ownedTokenIds
//   let ownedTokenIds = [];
//   for (let tokenId in receivedTokensCount) {
//     if (
//       (sentTokensCount[tokenId] ? sentTokensCount[tokenId] : 0) <
//       receivedTokensCount[tokenId]
//     ) {
//       ownedTokenIds.push(tokenId);
//     }
//   }





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