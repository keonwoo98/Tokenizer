// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FortyTwoToken
 * @dev BEP-20 token implementation (ERC-20 compatible)
 * @notice 42 Tokenizer Project - 42 x BNB Chain Partnership
 */
contract FortyTwoToken {
    // ============ Token Metadata ============
    string public name = "Forty Two Token";  // Token name (must contain "42")
    string public symbol = "F42T";           // Ticker symbol
    uint8 public decimals = 18;              // Decimal places (industry standard)
    uint256 public totalSupply;              // Total token supply

    // ============ State Variables ============
    address public owner;                                        // Contract owner
    mapping(address => uint256) public balanceOf;               // Balance per address
    mapping(address => mapping(address => uint256)) public allowance;  // Delegated amounts

    // ============ Events ============
    // ERC-20 required event: emitted on token transfer
    event Transfer(address indexed from, address indexed to, uint256 value);

    // ERC-20 required event: emitted on approval
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Ownership transfer event
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Modifiers ============
    /**
     * @dev Restricts function access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "FortyTwoToken: caller is not the owner");
        _;
    }

    // ============ Constructor ============
    /**
     * @dev Mints initial token supply on contract deployment
     * @param initialSupply Initial supply (before applying decimals)
     */
    constructor(uint256 initialSupply) {
        owner = msg.sender;

        // Calculate actual supply with decimals
        // Example: initialSupply=42000000 → 42,000,000 * 10^18
        totalSupply = initialSupply * 10 ** decimals;

        // Assign all tokens to deployer
        balanceOf[msg.sender] = totalSupply;

        // Emit Transfer event (from 0x0 indicates token creation)
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // ============ ERC-20 Required Functions ============

    /**
     * @dev Transfers tokens directly to another address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "FortyTwoToken: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "FortyTwoToken: insufficient balance");

        // Update balances (Checks-Effects-Interactions pattern)
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Grants a third party permission to spend tokens
     * @param spender Address to grant permission to
     * @param value Amount to authorize
     * @return success Whether the approval succeeded
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        require(spender != address(0), "FortyTwoToken: approve to zero address");

        allowance[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfers tokens on behalf of another address (used by DEX, etc.)
     * @param from Token owner address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(from != address(0), "FortyTwoToken: transfer from zero address");
        require(to != address(0), "FortyTwoToken: transfer to zero address");
        require(balanceOf[from] >= value, "FortyTwoToken: insufficient balance");
        require(allowance[from][msg.sender] >= value, "FortyTwoToken: insufficient allowance");

        // Update balance and allowance
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    // ============ Additional Features ============

    /**
     * @dev Creates new tokens (owner only)
     * @param to Address to receive new tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "FortyTwoToken: mint to zero address");

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Permanently destroys tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "FortyTwoToken: insufficient balance to burn");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @dev Transfers contract ownership (owner only)
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "FortyTwoToken: new owner is zero address");

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
