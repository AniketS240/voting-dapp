// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {

    address public admin;
    bool public electionActive;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    uint public candidateCount;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint id,string name);
    event VoteCast(address voter,uint candidateId);

    modifier onlyAdmin(){
        require(msg.sender == admin,"Not admin");
        _;
    }

    modifier electionRunning(){
        require(electionActive,"Election not active");
        _;
    }

    constructor(){
        admin = msg.sender;
    }

    function startElection() public onlyAdmin {
        electionActive = true;
    }

    function endElection() public onlyAdmin {
        electionActive = false;
    }

    function addCandidate(string memory name) public onlyAdmin {

        candidateCount++;

        candidates[candidateCount] = Candidate(
            candidateCount,
            name,
            0
        );

        emit CandidateAdded(candidateCount,name);
    }

    function addToWhitelist(address voter) public onlyAdmin {

        whitelist[voter] = true;

    }

    function removeFromWhitelist(address voter) public onlyAdmin {
        whitelist[voter] = false;
    }

    function vote(uint candidateId) public electionRunning {

        require(whitelist[msg.sender],"Not whitelisted");
        require(!hasVoted[msg.sender],"Already voted");

        require(candidates[candidateId].id == candidateId, "Invalid candidate");

        candidates[candidateId].voteCount++;

        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender,candidateId);
    }
}