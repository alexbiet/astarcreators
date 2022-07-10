const addresses = {
  Shibuya: {
    dAppsStaking: "0x0000000000000000000000000000000000005001",
    faceMinter: "0x1206b3eB5920720e292903B30b61546c37C7792c",
    marketplace: "0xa501504cBbCE4086C9319938f7E589557947e0D6", //0xE9CedB215bf0b509140EA4c9D1175Fc78c1A6aF8", 0x798B1cedD44d9bA51708f36abf09EF0cDf6bBB2A
    astarMinter: "0x7Fe4E59b858B907e4640730731108f9234461929",
  },
  Mumbai: {
    marketplace: "",  //0xE15aEf6d89B32384ff0897b10623dD0b7a391f3d" old
    faceMinter: "0xCbD54056ba671ddF74756F18668a96C76E0C44d9",
    astarMinter: "0xb44C8f4880601B2cF51c38c7c083650bbc4FF5C4",
  },
  Astar: {
    marketplace: "0x8485d2d055601503145eCE6fc784dd9Aa62dbA14",
    adaoContract: "0x3BFcAE71e7d5ebC1e18313CeCEbCaD8239aA386c",
    astarMinter: "0x7ecf20A28b2DFf9CaE85c060e9632ae5aF877209",

  },
}
const trustedContracts = {
  Shibuya: [addresses["Shibuya"].faceMinter, addresses["Shibuya"].astarMinter],
  Mumbai: [addresses["Mumbai"].faceMinter, addresses["Mumbai"].astarMinter],
  Astar: [addresses["Astar"].astarMinter]
}

const abis = {
    dAppsStaking: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "name": "bond_and_stake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "name": "claim_dapp",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "claim_staker",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "origin_smart_contract",
                    "type": "address"
                },
                {
                    "internalType": "uint128",
                    "name": "amount",
                    "type": "uint128"
                },
                {
                    "internalType": "address",
                    "name": "target_smart_contract",
                    "type": "address"
                }
            ],
            "name": "nomination_transfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "enum DappsStaking.RewardDestination",
                    "name": "reward_destination",
                    "type": "uint8"
                }
            ],
            "name": "set_reward_destination",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "name": "unbond_and_unstake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "smart_contract",
                    "type": "address"
                }
            ],
            "name": "withdraw_from_unregistered",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdraw_unbonded",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "contract_id",
                    "type": "address"
                }
            ],
            "name": "read_contract_stake",
            "outputs": [
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "read_current_era",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint32",
                    "name": "era",
                    "type": "uint32"
                }
            ],
            "name": "read_era_reward",
            "outputs": [
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint32",
                    "name": "era",
                    "type": "uint32"
                }
            ],
            "name": "read_era_staked",
            "outputs": [
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "staker",
                    "type": "bytes"
                }
            ],
            "name": "read_staked_amount",
            "outputs": [
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "contract_id",
                    "type": "address"
                },
                {
                    "internalType": "bytes",
                    "name": "staker",
                    "type": "bytes"
                }
            ],
            "name": "read_staked_amount_on_contract",
            "outputs": [
                {
                    "internalType": "uint128",
                    "name": "",
                    "type": "uint128"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "read_unbonding_period",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    ERC721: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "name_",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "symbol_",
                    "type": "string"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "_data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    faceMinter: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    marketplace: [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "previousAdmin",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "newAdmin",
            "type": "address"
          }
        ],
        "name": "AdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "beacon",
            "type": "address"
          }
        ],
        "name": "BeaconUpgraded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "version",
            "type": "uint8"
          }
        ],
        "name": "Initialized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "marketItemId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "NFTContract",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "sold",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "canceled",
            "type": "bool"
          }
        ],
        "name": "MarketItemCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "implementation",
            "type": "address"
          }
        ],
        "name": "Upgraded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "itemsCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "soldCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "canceledItemsCount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "availableCount",
            "type": "uint256"
          }
        ],
        "name": "countMessage",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "thisContractAddress",
            "type": "address"
          }
        ],
        "name": "ownerAddress",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "NFTContractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "marketItemId",
            "type": "uint256"
          }
        ],
        "name": "cancelMarketItem",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_description",
            "type": "string"
          },
          {
            "internalType": "uint256[]",
            "name": "_marketIdsArray",
            "type": "uint256[]"
          }
        ],
        "name": "createCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "NFTContractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          }
        ],
        "name": "createMarketItem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "NFTContractAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "marketItemId",
            "type": "uint256"
          }
        ],
        "name": "createMarketSale",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_collectionId",
            "type": "uint256"
          }
        ],
        "name": "delistCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fetchAvailableMarketItems",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "marketItemId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "NFTContractAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "canceled",
                "type": "bool"
              }
            ],
            "internalType": "struct Marketplace.MarketItem[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_addressProperty",
            "type": "string"
          }
        ],
        "name": "fetchMarketItemsByAddressProperty",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "marketItemId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "NFTContractAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "canceled",
                "type": "bool"
              }
            ],
            "internalType": "struct Marketplace.MarketItem[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fetchOwnedMarketItems",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "marketItemId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "NFTContractAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "canceled",
                "type": "bool"
              }
            ],
            "internalType": "struct Marketplace.MarketItem[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fetchSellingMarketItems",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "marketItemId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "NFTContractAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "canceled",
                "type": "bool"
              }
            ],
            "internalType": "struct Marketplace.MarketItem[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getActiveCollections",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "description",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "collectionId",
                "type": "uint256"
              },
              {
                "internalType": "uint256[]",
                "name": "marketIds",
                "type": "uint256[]"
              },
              {
                "internalType": "address",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "reportCount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Marketplace.Collection[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getLatestMarketItemByTokenId",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "marketItemId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "NFTContractAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "seller",
                "type": "address"
              },
              {
                "internalType": "address payable",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "canceled",
                "type": "bool"
              }
            ],
            "internalType": "struct Marketplace.MarketItem",
            "name": "",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getListingFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "proxiableUUID",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_collectionId",
            "type": "uint256"
          }
        ],
        "name": "reportCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_listingFee",
            "type": "uint256"
          }
        ],
        "name": "updateListingFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newImplementation",
            "type": "address"
          }
        ],
        "name": "upgradeTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newImplementation",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "upgradeToAndCall",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ],
    astarMinter: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "uri",
            "type": "string"
          }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    adaoContract: [{"type":"event","name":"Approval","inputs":[{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"address","name":"spender","internalType":"address","indexed":true},{"type":"uint256","name":"value","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ClaimFailed","inputs":[{"type":"uint256","name":"era","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","internalType":"address","indexed":true},{"type":"address","name":"newOwner","internalType":"address","indexed":true}],"anonymous":false},{"type":"event","name":"PoolUpdate","inputs":[{"type":"uint256","name":"_recordsIndex","internalType":"uint256","indexed":false},{"type":"uint256","name":"_ibASTR","internalType":"uint256","indexed":false},{"type":"uint256","name":"_ratio","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"to","internalType":"address","indexed":true},{"type":"uint256","name":"value","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract DappsStaking"}],"name":"DAPPS_STAKING","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"MAX_TRANSFERS","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"MINIMUM_REMAINING","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"MINIMUM_WITHDRAW","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"RATIO_PRECISION","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"allowance","inputs":[{"type":"address","name":"owner","internalType":"address"},{"type":"address","name":"spender","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"approve","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balanceOf","inputs":[{"type":"address","name":"account","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"calcDailyApr","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"contractAddress","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint8","name":"","internalType":"uint8"}],"name":"decimals","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"decreaseAllowance","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"subtractedValue","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"depositFor","inputs":[{"type":"address","name":"account","internalType":"address payable"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256[]","name":"","internalType":"uint256[]"}],"name":"erasToClaim","inputs":[]},{"type":"function","stateMutability":"pure","outputs":[{"type":"uint256","name":"_formatedEra","internalType":"uint256"}],"name":"formatEra","inputs":[{"type":"uint256","name":"_era","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint128","name":"_balance","internalType":"uint128"}],"name":"getBalance","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"_length","internalType":"uint256"}],"name":"getRecordsLength","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"_NStakedAmount","internalType":"uint256"}],"name":"getStaked","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"_length","internalType":"uint256"}],"name":"getUserRecordsLength","inputs":[{"type":"address","name":"account","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"tuple[]","name":"","internalType":"struct AdaoDappsStaking.WithdrawRecord[]","components":[{"type":"uint256","name":"era","internalType":"uint256"},{"type":"address","name":"account","internalType":"address payable"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint256","name":"index","internalType":"uint256"}]}],"name":"getUserWithdrawRecords","inputs":[{"type":"address","name":"account","internalType":"address"},{"type":"uint256","name":"_startIndex","internalType":"uint256"},{"type":"uint256","name":"_capacity","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"tuple[]","name":"","internalType":"struct AdaoDappsStaking.WithdrawRecord[]","components":[{"type":"uint256","name":"era","internalType":"uint256"},{"type":"address","name":"account","internalType":"address payable"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint256","name":"index","internalType":"uint256"}]}],"name":"getWithdrawRecords","inputs":[{"type":"uint256","name":"_startIndex","internalType":"uint256"},{"type":"uint256","name":"_capacity","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"increaseAllowance","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"addedValue","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"initialize","inputs":[{"type":"string","name":"name","internalType":"string"},{"type":"string","name":"symbol","internalType":"string"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"isWithdrawDone","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"lastClaimedEra","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"name","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"owner","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"queuedAmount","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"ratio","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"era","internalType":"uint256"},{"type":"address","name":"account","internalType":"address payable"},{"type":"uint256","name":"amount","internalType":"uint256"},{"type":"uint256","name":"index","internalType":"uint256"}],"name":"records","inputs":[{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"recordsIndex","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"renounceOwnership","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"resetEra","inputs":[{"type":"uint256","name":"_index","internalType":"uint256"},{"type":"uint256","name":"_era","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setContractAddress","inputs":[{"type":"address","name":"_contract","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setWhiteList","inputs":[{"type":"address","name":"_contract","internalType":"address payable"},{"type":"bool","name":"isTrue","internalType":"bool"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"symbol","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"toWithdrawed","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"totalSupply","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transfer","inputs":[{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"transferOwnership","inputs":[{"type":"address","name":"newOwner","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"unbondingPeriod","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"updateUnbondingPeriod","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"userRecordsIndexes","inputs":[{"type":"address","name":"","internalType":"address"},{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"whiteList","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"ibASTRAmount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdrawTo","inputs":[{"type":"address","name":"account","internalType":"address payable"},{"type":"uint256","name":"ibASTRAmount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}],
    

}

const chainIdMap = {
  1:{
      name: "Ethereum Mainnet",
      symbol: "ETH",
  } ,
  3: {
       name: "Ropsten Testnet",
       symbol: "ETH",
  },
  4: {
       name: "Rinkeby Testnet",
       symbol: "ETH",
      },
  5: {
       name: "Goerli Testnet",
       symbol: "ETH",
      },
  42: {
       name: "Kovan Testnet",
       symbol: "ETH",
      },
  137: {
       name: "Polygon Mainnet",
       symbol: "MATIC",
      },
  80001: {
       name: "Mumbai",
       symbol: "MATIC",
      },
  43114: {
       name: "Avalanche Mainnet",
       symbol: "AVAX",
      },
  43113: {
       name: "Fuji Testnet",
       symbol: "AVAX",
      },
  1088: {
       name: "Metis Andromeda Mainnet",
       symbol: "METIS",
      },
  588: {
       name: "Metis Stardust Testnet",
       symbol: "METIS",
      },
  1313161554: {
       name: "Aurora Mainnet",
       symbol: "AOA",
      },
  1313161555: {
       name: "Aurora Testnet",
       symbol: "AOA",
      },
  56: {
       name: "Binance Smart Chain Mainnet",
       symbol: "BNB",
      },
  97: {
       name: "Binance Smart Chain Testnet",
       symbol: "BNB",
      },
  250: {
       name: "Fantom Opera Mainnet",
       symbol: "FTM",
      },
  4002: {
       name: "Fantom Testnet",
       symbol: "FTM",
  },
  81: {
       name: "Shibuya",
       symbol: "SBY",
  },
  592: {
       name: "Astar",
       symbol: "ASTR",
  },
  }



const nftCollections = {
  faces: [
    {
      id: 1,
      image: "face-1.png",
      name: "Smirky Blue",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Smirk",
      trait_type_2: "Color",
      trait_value_2: "Blue",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 2,
      image: "face-2.png",
      name: "Hyped Orange",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Hyped",
      trait_type_2: "Color",
      trait_value_2: "Orange",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 3,
      image: "face-3.png",
      name: "Angry Red",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Angry",
      trait_type_2: "Color",
      trait_value_2: "Red",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 4,
      image: "face-4.png",
      name: "Cool Green",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Cool",
      trait_type_2: "Color",
      trait_value_2: "Green",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 5,
      image: "face-5.png",
      name: "Sus Purple",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Sus",
      trait_type_2: "Color",
      trait_value_2: "Purple",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 6,
      image: "face-6.png",
      name: "Crazy Yellow",
      description: "Smiley Faces is an NFT collection of funky and expressive faces.",
      trait_type_1: "Emotion",
      trait_value_1: "Crazy",
      trait_type_2: "Color",
      trait_value_2: "Yellow",
      trait_type_3: "Rarity",
      trait_value_3: "Ultra Rare",
    },
  ],

  pixel_avatars: [
    {
      id: 1,
      image: "pixel-alex-1.png",
      name: "Pixel Alex",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Alex",
      trait_type_2: "Accessory",
      trait_value_2: "none",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 2,
      image: "pixel-alex-2.png",
      name: "Pixel Alex",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Alex",
      trait_type_2: "Accessory",
      trait_value_2: "Sunglasses",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 3,
      image: "pixel-alex-3.png",
      name: "Pixel Alex",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Alex",
      trait_type_2: "Accessory",
      trait_value_2: "Laser Eyes",
      trait_type_3: "Rarity",
      trait_value_3: "Ultra Rare",
    },
    {
      id: 4,
      image: "pixel-albo-1.png",
      name: "Pixel Albo",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Albo",
      trait_type_2: "Accessory",
      trait_value_2: "none",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 5,
      image: "pixel-albo-2.png",
      name: "Pixel Albo",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Albo",
      trait_type_2: "Accessory",
      trait_value_2: "Sunglasses & Headphones",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 6,
      image: "pixel-albo-3.png",
      name: "Pixel Albo",
      description: "Pixel avatars is your NFT collection of virtual and customisable pixelated avatars. You can wear them on Twitter and other social media platforms.",
      trait_type_1: "Name",
      trait_value_1: "Albo",
      trait_type_2: "Accessory",
      trait_value_2: "Laser Eyes",
      trait_type_3: "Rarity",
      trait_value_3: "Ultra Rare",
    },
  ],
  bonsais: [
    {
      id: 1,
      image: "bonsai-1.jpg",
      name: "Bonsai Ono",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "Green",
      trait_type_2: "Size",
      trait_value_2: "Small",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 2,
      image: "bonsai-2.jpg",
      name: "Pure Bonsai",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "White",
      trait_type_2: "Size",
      trait_value_2: "Medium",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 3,
      image: "bonsai-3.jpg",
      name: "Lively Bonsai",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "Pink",
      trait_type_2: "Size",
      trait_value_2: "Medium",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 4,
      image: "bonsai-4.jpg",
      name: "Forrest Bonsai",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "Green",
      trait_type_2: "Size",
      trait_value_2: "Medium",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 5,
      image: "bonsai-5.jpg",
      name: "Autumn Bonsai",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "Yellow",
      trait_type_2: "Size",
      trait_value_2: "Large",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 6,
      image: "bonsai-6.jpg",
      name: "Super Bonsai",
      description: "Lovely NFT collection of Bonsai trees, some of them painted by Tim Cantor.",
      trait_type_1: "Color",
      trait_value_1: "Purple",
      trait_type_2: "Size",
      trait_value_2: "Large",
      trait_type_3: "Rarity",
      trait_value_3: "Ultra Rare",
    },
  ],
  fake_apes: [
    {
      id: 1,
      image: "fake-apes-1.png",
      name: "Fake Ape Party Boy",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Eyeballs Monkey",
      trait_type_2: "Accessory",
      trait_value_2: "Party Hat",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 2,
      image: "fake-apes-2.png",
      name: "Fake Ape Tart",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Inbreed",
      trait_type_2: "Accessory",
      trait_value_2: "Blue Hat",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    { 
      id: 3,
      image: "fake-apes-3.png",
      name: "Fake Ape Leopard",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Leopard Skin",
      trait_type_2: "Accessory",
      trait_value_2: "Red Robe",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
    {
      id: 4,
      image: "fake-apes-4.png",
      name: "Fake Ape Poked Eye",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Floaty Eye",
      trait_type_2: "Accessory",
      trait_value_2: "Gold Jacket",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 5,
      image: "fake-apes-5.png",
      name: "Fake Ape Captain",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Bored Authority",
      trait_type_2: "Accessory",
      trait_value_2: "Capitain Hat",
      trait_type_3: "Rarity",
      trait_value_3: "Common",
    },
    {
      id: 6,
      image: "fake-apes-6.png",
      name: "Fake Ape Cool",
      description: "A fake collection of BAYC apes. Go to BoredApeYachtClub.com for the real ones.",
      trait_type_1: "Trait",
      trait_value_1: "Bored Coolness",
      trait_type_2: "Accessory",
      trait_value_2: "Skeleton Tshirt",
      trait_type_3: "Rarity",
      trait_value_3: "Rare",
    },
  ],

};