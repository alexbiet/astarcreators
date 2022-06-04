
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

  //listMarketItem(address.faceMinter, 1, 2000000000000000); //.001 Ether
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
    console.log(await market.fetchAvailableMarketItems());

    let marketObjects = [];
     for (let i = 0; i < marketItems.length; i++) {
       marketObjects.push({});
       marketObjects[i].marketId = ethers.utils.formatUnits(marketItems[i][0], 0);
       marketObjects[i].contractAddress = marketItems[i][1];
       marketObjects[i].tokenId = ethers.utils.formatUnits(marketItems[i][2], 0);
       marketObjects[i].creator = marketItems[i][3]; //?
       marketObjects[i].seller = marketItems[i][4];
       marketObjects[i].owner = marketItems[i][5];
       marketObjects[i].price = ethers.utils.formatUnits(marketItems[i][6], 18);
       marketObjects[i].sold = marketItems[i][7];
       marketObjects[i].canceled = marketItems[i][8];

       let NFTContract = new ethers.Contract(marketObjects[i].contractAddress, abi.ERC721, provider);
       let fetchedURI = await NFTContract.tokenURI(marketObjects[i].tokenId);

      marketObjects[i].tokenURI = fetchedURI;

    //  console.log(marketObjects[i].marketId);
    //  console.log(marketObjects[i].tokenId);
    //  console.log(marketObjects[i].contractAddress);
    //  console.log(marketObjects[i].tokenURI);
     }
      for (let i = 0; i < 3; i++) {
       document.getElementById(`explore-image${i}`).src = marketObjects[i].tokenURI;
      }
     
     
  }

 //mintFaceNFT();
  async function mintFaceNFT() {
    let faceMinter = new ethers.Contract(address.faceMinter, abi.faceMinter, signer);
    faceMinter.safeMint();
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