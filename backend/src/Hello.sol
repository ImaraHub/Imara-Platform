// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IHellowWorld {
    function hello() external view returns (string memory);

    function setTextMemory(string memory _text) external payable;
}
interface sample {
    function hello() external view returns (string memory);
}

contract HelloWorld is IHellowWorld {

    string public text;
    address owner;

    constructor() {
        text = initialize();
    }
    function hello() public view returns (string memory) {
        return text;
    }



    //  function modifiers
    modifier ifNotHelloWorld() {
        require(IsChanged(), "Text is hello world");
        _;
        
    }
    modifier IsOwner(){
        require(msg.sender == owner, "You are not the owner");
        _;
    }
    function initialize() private pure returns (string memory) {
        return "hello world";
    }

    function setTextMemory(string memory _text) public payable {
        require(msg.value > 0.1 ether, "Not enough ether sent");
        text = _text;
    }
    function setTextCalldata(string calldata _text) public payable {
        // require(msg.value > 0.1 ether, "Not enough ether sent");
        require(keccak256(bytes(_text)) == keccak256(bytes("hello World")), "Not hello world");
        text = _text;
    }
    function test() internal returns (uint) {
        return msg.value;
        // msg.value need to be payable for public function
    }

    function IsChanged() private pure returns (bool) {
        return keccak256(bytes(initialize())) == keccak256(bytes("hello World"));
    }

    // Fallback function
    fallback(bytes calldata) external returns (bytes memory) {
        text = "Fallback function";
        return msg.data;
    }

    receive() external payable {
        text = "Receive function";
    }
}
// which is cheaper ? calldata or memory
//  calldata is cheaper than memory
//  calldata is a pointer to the data in the call data area of the calldata
//  memory is a pointer to the data in the memory area of the memory
//  calldata is read-only and memory is read-write
//  calldata is cheaper than memory because it is read-only and does not require any gas to write to it
//  memory is more expensive than calldata because it is read-write and requires gas to write to it

//  Functions
// Revert - Revert the transaction and return the remaining gas to the sender
// Require (error handling) - Require is used to validate the inputs to a function. If the condition is not met, the transaction is reverted and the remaining gas is returned to the sender
// Assert (panic)- Assert is used to check for internal errors. If the condition is not met, the transaction is reverted and all gas is consumed
// Modifiers - Modifiers are used to add functionality to functions. They are used to add checks before or after the function is executed

// Fallback functions
//  Fallback functions are functions that are executed when a contract receives ether without any data
// what happens to the ether sent in a fallback functions?
// 