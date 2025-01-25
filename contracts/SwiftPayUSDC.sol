// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// INTERFACE USDC TOKEN CONTRACT
interface IUSDC {
    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function balanceOf(address owner) external view returns (uint);
}

contract SwiftPayUSDC {
    uint256 totalTxns;
    address public usdcContractAddress;
    IUSDC usdcContract;

    constructor(address _usdcContractAddress) {
        usdcContractAddress = _usdcContractAddress;
        usdcContract = IUSDC(usdcContractAddress);
    }

    function transferUsdc(address recipient, uint256 value) external {
        uint256 balance = getUsdcBalance(msg.sender);
        if (balance > 0) {
            require(usdcContract.transferFrom(msg.sender, recipient, value));
            totalTxns++;
        }
    }

    function batchTransferUsdc(
        address[] memory recipients,
        uint256[] memory values
    ) external {
        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                usdcContract.transferFrom(msg.sender, recipients[i], values[i])
            );
            totalTxns++;
        }
    }

    /// fn to check usdc balance
    function getUsdcBalance(address addr) public view returns (uint) {
        uint balance = usdcContract.balanceOf(addr);
        return balance;
    }

    /// fn to check total txns
    function getTotalTxns() public view returns (uint256) {
        return totalTxns;
    }
}
