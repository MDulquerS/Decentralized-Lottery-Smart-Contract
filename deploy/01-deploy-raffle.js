const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  networkConfig,
  developmentChains,
  VERIFICAION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");

const FUND_AMOUNT = ethers.utils.parseEther("1");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinator, vrfCoordinatorV2Address, subscriptionId;
  if (chainId == 31337) {
    vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinator.address;
    const transactionResponse = await vrfCoordinator.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    await vrfCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subId"];
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICAION_BLOCK_CONFIRMATIONS;
  console.log("--------------------------------------");
  const raf_arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["interval"],
    networkConfig[chainId]["entranceFee"],
    networkConfig[chainId]["callbackGasLimit"],
  ];
  console.log("Deploying Lottray...");
  const lottery = await deploy("Raffle", {
    from: deployer,
    log: true,
    args: raf_arguments,
    waitConfirmations: waitBlockConfirmations,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(lottery.address, raf_arguments);
  }
  console.log(`Lottery deployed at ${lottery.address}`);
};

module.exports.tags = ["all", "raffle"];
