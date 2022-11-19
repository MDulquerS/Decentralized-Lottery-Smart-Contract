const { network } = require("hardhat");
const BASE_FEE = "25000000000000000";
const GAS_PRICE_LINK = 1e9;
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  chainId = network.config.chainId;
  if (chainId == 31337) {
    console.log("local network detected! deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
    console.log("Mocks deployed");
    console.log("----------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
