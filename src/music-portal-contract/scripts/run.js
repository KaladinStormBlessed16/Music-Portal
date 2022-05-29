const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const musicContractFactory = await hre.ethers.getContractFactory(
    "MusicPortal"
  );
  const musicContract = await musicContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await musicContract.deployed();

  console.log("Contract deployed to:", musicContract.address);
  console.log("Contract deployed by:", owner.address);

  let musicTxn = await musicContract.addSong("Ride the Lightning", "#4154444564");
  await musicTxn.wait();

  let contractBalance = await hre.ethers.provider.getBalance(musicContract.address);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allSongs = await musicContract.getAllSongs();
  console.log(allSongs);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
