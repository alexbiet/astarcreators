
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
async function listMarketItem(_NFTContract, _tokenId, _price) {
  let market = new ethers.Contract(address.marketplace, abi.marketplace, signer)
  market.createMarketItem(_NFTContract, _tokenId, _price);
}
//cancelMarketItem(address.faceMinter, 2); //.001 Ether
async function cancelMarketItem(_NFTContract, _marketItemId) {
  let market = new ethers.Contract(address.marketplace, abi.marketplace, signer)
  market.cancelMarketItem(_NFTContract, _marketItemId);
}

fetchMarketItems();
async function fetchMarketItems() {

  let market = new ethers.Contract(address.marketplace, abi.marketplace, provider)
  let marketItems = await market.fetchAvailableMarketItems();
  let nftListing = document.getElementById("nftListing");
  let marketNFTs = [];
  let listingLimit = 5; //starts at 0

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


      // Draw NFTs
      if(i <= listingLimit) {
        nftListing.innerHTML += `
        <div class="col">
          <div class="card shadow-sm">
            <img id="card${i}-image" src="${marketNFTs[i].tokenURI}"/>

            <div class="card-body">
              <p id="card${i}-text" class="card-text">
                <strong>${marketNFTs[i].name} #${marketNFTs[i].tokenId}</strong>
                <br><small>${marketNFTs[i].price} SBY</small>
                <br><strong>Creator: </strong><small>${marketNFTs[i].creator}</small> 
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button id="card${i}-view" type="button" class="btn btn-sm btn-outline-secondary" onclick="${console.log("Yay")}">View</button>
                  <button id="card${i}-buy" type="button" class="btn btn-sm btn-outline-secondary" onclick="buyMarketItem(${marketNFTs[i].contractAddress}, ${marketNFTs[i].marketId}, ${marketNFTs[i].priceBN})">Buy</button>
                </div>
                <small class="text-muted">9 mins</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <!-- Alex to add modal HTML here :D -->

        `;
      }

    }
 
  }
 
  async function buyMarketItem(_NFTContract, _marketId, _price) {
    console.log(_price)
    let market = new ethers.Contract(address.marketplace, abi.marketplace, signer);
    market.createMarketSale(_NFTContract, _marketId, {value: _price});
  }

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