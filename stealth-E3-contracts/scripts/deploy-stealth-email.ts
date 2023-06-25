import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

async function main() {
  console.log("Deploying Stealth Email")
  const provider = ethers.provider
  const from = await provider.getSigner().getAddress()
  console.log(`Deployer of Stealth Email Contract : ${from}`)
  
    const stealthMailArtifact = await ethers.getContractFactory('StealthMail',  provider.getSigner());
    const stealthMail = await stealthMailArtifact.deploy();
    await stealthMail.deployed();
    console.log('StealthMail contract deployed to address: ', stealthMail.address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

