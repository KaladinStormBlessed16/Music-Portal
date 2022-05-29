import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import contractABI from "./music-portal-contract/artifacts/contracts/MusicPortal.sol/MusicPortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songLink, setSongLink] = useState("");
  const [allSongs, setAllSongs] = useState([]);

  const contractAddress = "0xD6a8057d6158F7D68dd8778E850ace903F47C7ec";

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        getAllSongs();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const addSong = async (event) => {
    event.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const musicPortalContract = new ethers.Contract(
          contractAddress,
          contractABI.abi,
          signer
        );

        const musicTxn = await musicPortalContract.addSong(
          songTitle,
          songLink,
          {
            gasLimit: 300000,
          }
        );
        await musicTxn.wait();
        setSongTitle("");
        setSongLink("");
        getAllSongs();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("Send only a song each 15 minutes.");
      setSongTitle("");
      setSongLink("");
    }
  };

  const getAllSongs = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI.abi,
          signer
        );

        const songs = await wavePortalContract.getAllSongs();

        let songsCleaned = [];
        songs.forEach((song) => {
          songsCleaned.push({
            address: song.sender,
            timestamp: formatDate(song.timestamp * 1000),
            title: song.title,
            link: song.link,
          });
        });

        setAllSongs(songsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  function formatDate(dateVal) {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);

    if (iHourCheck > 12) {
      sAMPM = "PM";
      sHour = iHourCheck - 12;
    } else if (iHourCheck === 0) {
      sHour = "12";
    }

    sHour = padValue(sHour);

    return (
      sMonth +
      "-" +
      sDay +
      "-" +
      sYear +
      " " +
      sHour +
      ":" +
      sMinute +
      " " +
      sAMPM
    );
  }

  function padValue(value) {
    return value < 10 ? "0" + value : value;
  }

  const onRewardGranted = (from, timestamp, reward) => {
    alert(
      "Congrats! You won a reward of " +
        ethers.utils.formatEther(reward) +
        " ether."
    );
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen Event

    let musicPortalContract;
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      musicPortalContract = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        signer
      );
      musicPortalContract.on("RewardGranted", onRewardGranted);
    }

    return () => {
      if (musicPortalContract) {
        musicPortalContract.off("RewardGranted", onRewardGranted);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <img src="favicon.ico" width="50" />
          <span>Welcome to Music Portal!</span>
        </div>

        <div className="bio">
          I am David, a web3 developer who loves music.
          <br /> Connect your Ethereum wallet at Rinkeby testnet and send me
          your favourite music!
          <br />
          There is a 20% of getting a reward in the process!
        </div>

        <form onSubmit={addSong} className="form-group mt-5">
          <div className="row text-center">
            <div className="col-6">
              <label>
                Song Title:
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="form-control mt-2"
                />
              </label>
            </div>
            <div className="col-6">
              <label>
                Song Link:
                <input
                  type="text"
                  value={songLink}
                  onChange={(e) => setSongLink(e.target.value)}
                  className="form-control mt-2"
                />
              </label>
            </div>
            <div className="col-12 my-4 text-center">
              <input
                type="submit"
                value="Send me Music!"
                className="btn btn-dark"
                disabled={songLink === "" || songTitle === ""}
              />
            </div>
          </div>
        </form>

        {!currentAccount && (
          <button className="customButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allSongs.map((song, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "#222",
                marginTop: "16px",
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <div>
                <span className="highlihted-yellow">Address:</span>{" "}
                {song.address}
              </div>
              <div>
                <span className="highlihted-yellow">Time:</span>:{" "}
                {song.timestamp.toString()}
              </div>
              <div>
                <span className="highlihted-yellow">Song:</span>
                <a href={song.link} target="_blank">
                  {song.title}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
