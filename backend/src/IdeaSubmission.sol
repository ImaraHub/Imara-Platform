// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract IdeaSubmission {
    struct Idea {
        address owner;
        string title;
        string description;
        string link;
        string license;
        string image;
        uint256 timestamp;
    }

    mapping(uint256 => Idea) public ideas;
    uint256 public numberOfIdeas = 0;


    event IdeaSubmitted(
        uint256 id,
        address owner,
        string title,
        string description,
        string link,
        string license,
        string image,
        uint256 timestamp
    );

 
    function submitIdea(
        string memory _title,
        string memory _description,
        string memory _link,
        string memory _license,
        string memory _image
    ) public returns (uint256) {
        Idea storage idea = ideas[numberOfIdeas];

        idea.owner = msg.sender;
        idea.title = _title;
        idea.description = _description;
        idea.link = _link;
        idea.license = _license;
        idea.image = _image;
        idea.timestamp = block.timestamp;

        numberOfIdeas++;

        emit IdeaSubmitted(numberOfIdeas - 1, msg.sender, _title, _description, _link, _license, _image, block.timestamp);

        return numberOfIdeas - 1;
    }

    //
    function getIdea(uint256 _id) public view returns (Idea memory) {
        return ideas[_id];
    }

   
    function getAllIdeas() public view returns (Idea[] memory) {
        Idea[] memory allIdeas = new Idea[](numberOfIdeas);

        for (uint i = 0; i < numberOfIdeas; i++) {
            allIdeas[i] = ideas[i];
        }

        return allIdeas;
    }

    // Getters for the new properties
    function getLink(uint256 _id) public view returns (string memory) {
        return ideas[_id].link;
    }

    function getLicense(uint256 _id) public view returns (string memory) {
        return ideas[_id].license;
    }

    function getImage(uint256 _id) public view returns (string memory) {
        return ideas[_id].image;
    }
}






