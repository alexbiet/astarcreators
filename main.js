
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
  alert("To disconnect, open MetaMask and manualy disconnect.")
}

async function fetchAccountData() {
  let provider;
    try {
        provider = new ethers.providers.Web3Provider(ethereum);
        let account = await provider.send("eth_requestAccounts").then( accounts => {
          return accounts[0];});
        let balance = await provider.getBalance(account);
        let formatedBalance = ethers.BigNumber.from(balance);
        formatedBalance = balance.mod(1e14);
        formatedBalance = ethers.utils.formatEther(balance.sub(formatedBalance));
        
        //updateHTMLElements network/balances/button
        document.getElementById("selected-account").innerHTML = `(${account})`;
        document.getElementById("account-balance").innerHTML = `${formatedBalance} ${chainIdMap[ethereum.networkVersion].symbol}`;
        document.getElementById("network-name").innerHTML = `${chainIdMap[ethereum.networkVersion].name}`;
        document.getElementById("btn-connect").style.display = "none";
        document.getElementById("btn-disconnect").style.display = "block";
        localStorage.setItem("CACHED_PROVIDER", "TRUE");
    } catch (error) {
        console.log("Error connecting to metamask account:\n", error)
      }

  ethereum.on("accountsChanged", (accounts) => {
      if(accounts[0]) {
        fetchAccountData();
      } else {
        localStorage.removeItem("CACHED_PROVIDER");
        document.getElementById("btn-disconnect").style.display = "none";
        document.getElementById("btn-connect").style.display = "block";
      }
  });
  ethereum.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  useContracts();
  async function useContracts(){
    let dAppsStaking = new ethers.Contract(address.dAppsStaking, abi.dAppsStaking, provider)
    let currentEra = (await dAppsStaking.read_current_era()).toNumber();
    console.log(currentEra);

    let NFTMarketplace = new ethers.Contract(address.NFTMarketplace, abi.NFTMarketplace, provider)
    console.log(await NFTMarketplace.fetchMarketItems());
  }

};