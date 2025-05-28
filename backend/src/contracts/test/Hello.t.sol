// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {HelloWorld} from "../src/Hello.sol";

contract HelloWorldTest is Test {
    HelloWorld public helloWorld;

    function setUp() public {
        helloWorld = new HelloWorld();
    }

    function test_Hello() public view {
        assertEq(helloWorld.hello(), "hello world");
    }

    function test_SetTextMemory() public {
        helloWorld.setTextMemory("hello world");
        assertEq(helloWorld.hello(), "hello world");
    }

    function test_SetTextCalldata() public {
        helloWorld.setTextCalldata("hello world");
        assertEq(helloWorld.hello(), "hello world");
    }

    function test_Fallback() public {
        bytes memory data = abi.encodeWithSignature("hello()");
        (bool success, bytes memory result) = address(helloWorld).call(data);
        assertTrue(success);
        assertEq(abi.decode(result, (string)), "hello world");
    }
}