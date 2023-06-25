
const fs = require('fs');
const hre = require('hardhat');
const { exit } = require('process'); // eslint-disable-line @typescript-eslint/unbound-method
const { ethers } = hre;

const network = process.env.HARDHAT_NETWORK || '';

// Initialize object that will hold all deploy info. We'll continually update this and save it to
// a file using the save() method below
const parameters = {
  deployer: null,
  contracts: {}, // will be populated with all contract addresses
  actions: {}, // will be populated with deployment actions
};

// Setup for saving off deploy info to JSON files
const now = new Date().toISOString();
const folderName = './deploy-history';
const fileName = `${folderName}/registry-${network}-${now}.json`;
const latestFileName = `${folderName}/registry-${network}-latest.json`;
fs.mkdir(folderName, (err) => {
  if (err && err.code !== 'EEXIST') throw err;
});


const save = (value, field, subfield = undefined) => {
  if (subfield) {
    parameters[field][subfield] = value;
  } else {
    parameters[field] = value;
  }
  fs.writeFileSync(fileName, JSON.stringify(parameters));
};


(async function () {
  try {
    const deployParams = require('./deployParams-registry.json');
    const deployParamsForNetwork = deployParams[network];

    if (!deployParamsForNetwork) {
      console.log('Invalid network requested', network);
      save(network, 'actions', 'InvalidNetworkRequested');
      exit();
    }

    
    const { expectedDeployer, expectedNonce } = deployParamsForNetwork;

    console.log('Deploying to: ', network);
    save(network, 'actions', 'DeployingContractsToNetwork');

    const [deployerWallet] = await ethers.getSigners();
    save(deployerWallet.address, 'deployer');

    if (deployerWallet.address !== expectedDeployer) {
      throw new Error(`Unexpected deployer address. Found ${deployerWallet.address}, expected ${expectedDeployer}.`);
    }

    const deployerNonce = await deployerWallet.getTransactionCount();

    if (deployerNonce !== expectedNonce) {
      throw new Error(`Unexpected deployer nonce. Found ${deployerNonce}, expected ${expectedNonce}.`);
    }

    // deploy the E3-EEE contracts
    const StealthKeyRegistry = await ethers.getContractFactory('StealthKeyRegistry', deployerWallet);
    const registry = await StealthKeyRegistry.deploy();
    await registry.deployed();
    save(registry.address, 'contracts', 'StealthKeyRegistry');
    console.log('StealthKeyRegistry contract deployed to address: ', registry.address);

    // everything went well, save the deployment info in the 'latest' JSON file
    fs.writeFileSync(latestFileName, JSON.stringify(parameters));

    // catch any error from operations above, log it and save it to deploy history file
  } catch (error) {
    save(error.toString(), 'actions', 'Error');
    console.log('Deployment Error: ', error.toString());
  }
})();
