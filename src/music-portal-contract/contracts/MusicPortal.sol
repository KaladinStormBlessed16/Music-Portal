pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract MusicPortal {
    uint256 totalSongs;
    uint256 private seed;

    mapping(address => uint256) public lastCall;

    event NewSong(
        address indexed from,
        uint256 timestamp,
        string title,
        string link
    );
    event RewardGranted(
        address indexed from,
        uint256 timestamp,
        uint256 reward
    );

    struct Song {
        address sender;
        string title;
        string link;
        uint256 timestamp;
    }

    Song[] songs;

    constructor() payable {
        console.log("Contract deployed!");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function addSong(string memory _title, string memory _link) public {
        require(
            lastCall[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );
        lastCall[msg.sender] = block.timestamp;

        totalSongs += 1;
        console.log("%s sent a song: %s link: %s", msg.sender, _title, _link);

        songs.push(Song(msg.sender, _title, _link, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %d", seed);

        if (seed <= 20) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
            emit RewardGranted(msg.sender, block.timestamp, prizeAmount);
        }

        emit NewSong(msg.sender, block.timestamp, _title, _link);
    }

    function getAllSongs() public view returns (Song[] memory) {
        return songs;
    }

    function getTotalSongs() public view returns (uint256) {
        console.log("We have %d total songs!", totalSongs);
        return totalSongs;
    }
}
