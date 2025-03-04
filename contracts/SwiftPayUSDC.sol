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

    function balanceOf(address owner) external view returns (uint256);
}

contract SwiftPayUSDC {
    uint256 totalTxns;
    uint256 totalVolume;
    uint256 public feePercentage; // In basis points (e.g., 50 = 0.5%, 100 = 1%)
    address public owner;
    address public feeCollector;
    address public immutable usdcContractAddress;
    IUSDC usdcContract;

    event Transfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event BatchTransfer(
        address indexed sender,
        uint256 noOfRecipients,
        uint256 totalAmount
    );
    event FeeUpdated(uint256 newFeePercentage, address updatedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(
        address _usdcContractAddress,
        address _feeCollector,
        uint256 _feePercentage
    ) {
        require(_feeCollector != address(0), "Invalid collector address");
        require(_feePercentage <= 100, "Fee cannot exceed 1%");

        usdcContractAddress = _usdcContractAddress;
        usdcContract = IUSDC(usdcContractAddress);
        owner = msg.sender;
        feeCollector = _feeCollector;
        feePercentage = _feePercentage;
    }

    function transferUsdc(address recipient, uint256 value) external {
        require(usdcContract.transferFrom(msg.sender, recipient, value));

        totalTxns++;
        totalVolume += value;

        emit Transfer(msg.sender, recipient, value);
    }

    function batchTransferUsdc(
        address[] memory recipients,
        uint256[] memory values
    ) external {
        require(recipients.length == values.length, "Mismatched batch arrays");
        uint256 totalAmount;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 fee = (values[i] * feePercentage) / 10000;
            uint256 netAmount = values[i] - fee;

            require(
                usdcContract.transferFrom(msg.sender, recipients[i], netAmount),
                "Transfer failed"
            );

            if (fee > 0) {
                require(
                    usdcContract.transferFrom(msg.sender, feeCollector, fee),
                    "TransferFailed"
                );
            }

            totalTxns++;
            totalAmount += values[i];
            totalVolume += values[i];
        }

        emit BatchTransfer(msg.sender, recipients.length, totalAmount);
    }

    /// @notice since solidity doesn't support float/decimal values
    /// @notice fees are calculated via basis points(bps) 100bps = 1.00% | 50bs = 0.5%
    function setTransactionFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee cannot exceed 1%");
        feePercentage = newFee;
        emit FeeUpdated(newFee, msg.sender);
    }

    function setFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    /// fn to check usdc balance
    function getUsdcBalance(address addr) public view returns (uint256) {
        uint256 balance = usdcContract.balanceOf(addr);
        return balance;
    }

    /// fn to check total txns
    function getTotalTxns() public view returns (uint256) {
        return totalTxns;
    }

    // fn to check txn volume
    function getTotalVolume() public view returns (uint256) {
        return totalVolume;
    }
}
