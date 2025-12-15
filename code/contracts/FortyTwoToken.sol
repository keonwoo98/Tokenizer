// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FortyTwoToken
 * @dev BEP-20 token implementation with Multisig support
 * @notice 42 Tokenizer Project - 42 x BNB Chain Partnership
 *
 * BONUS FEATURE: Multisig system for sensitive operations
 * - Mint and ownership transfer require multiple signer approvals
 * - Configurable required signatures (e.g., 2-of-3)
 */
contract FortyTwoToken {
    // ============ Token Metadata ============
    string public name = "Forty Two Token";
    string public symbol = "F42T";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // ============ Basic State Variables ============
    address public owner;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ============ Multisig State Variables ============
    address[] public signers;                           // List of authorized signers
    mapping(address => bool) public isSigner;           // Quick lookup for signer status
    uint256 public requiredSignatures;                  // Number of signatures required

    // Transaction tracking
    uint256 public transactionCount;                    // Total transactions proposed
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public hasConfirmed;

    // Transaction types for multisig operations
    enum TransactionType { Mint, TransferOwnership }

    struct Transaction {
        TransactionType txType;     // Type of transaction
        address target;             // Target address (mint recipient or new owner)
        uint256 amount;             // Amount (for mint, 0 for ownership transfer)
        uint256 confirmations;      // Current confirmation count
        bool executed;              // Whether transaction has been executed
        bool exists;                // Whether transaction exists
    }

    // ============ Events ============
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Multisig events
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event RequiredSignaturesChanged(uint256 oldRequired, uint256 newRequired);
    event TransactionProposed(uint256 indexed txId, TransactionType txType, address indexed target, uint256 amount, address indexed proposer);
    event TransactionConfirmed(uint256 indexed txId, address indexed signer);
    event TransactionRevoked(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "FortyTwoToken: caller is not the owner");
        _;
    }

    modifier onlySigner() {
        require(isSigner[msg.sender], "FortyTwoToken: caller is not a signer");
        _;
    }

    modifier txExists(uint256 txId) {
        require(transactions[txId].exists, "FortyTwoToken: transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "FortyTwoToken: transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 txId) {
        require(!hasConfirmed[txId][msg.sender], "FortyTwoToken: transaction already confirmed");
        _;
    }

    // ============ Constructor ============
    /**
     * @dev Deploys token with initial supply and multisig configuration
     * @param initialSupply Initial token supply (before decimals)
     * @param _signers Array of initial signer addresses
     * @param _requiredSignatures Number of signatures required for multisig operations
     */
    constructor(
        uint256 initialSupply,
        address[] memory _signers,
        uint256 _requiredSignatures
    ) {
        require(_signers.length >= _requiredSignatures, "FortyTwoToken: not enough signers");
        require(_requiredSignatures > 0, "FortyTwoToken: required signatures must be > 0");

        owner = msg.sender;

        // Initialize signers
        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "FortyTwoToken: invalid signer address");
            require(!isSigner[signer], "FortyTwoToken: duplicate signer");

            isSigner[signer] = true;
            signers.push(signer);
            emit SignerAdded(signer);
        }
        requiredSignatures = _requiredSignatures;

        // Mint initial supply to deployer
        totalSupply = initialSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // ============ ERC-20 / BEP-20 Standard Functions ============

    /**
     * @dev Transfers tokens to another address
     */
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "FortyTwoToken: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "FortyTwoToken: insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approves spender to use tokens on behalf of caller
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        require(spender != address(0), "FortyTwoToken: approve to zero address");

        allowance[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfers tokens on behalf of another address
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(from != address(0), "FortyTwoToken: transfer from zero address");
        require(to != address(0), "FortyTwoToken: transfer to zero address");
        require(balanceOf[from] >= value, "FortyTwoToken: insufficient balance");
        require(allowance[from][msg.sender] >= value, "FortyTwoToken: insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @dev Burns tokens from caller's balance
     */
    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "FortyTwoToken: insufficient balance to burn");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }

    // ============ Multisig Functions ============

    /**
     * @dev Proposes a new mint transaction (signer only)
     * @param to Address to receive minted tokens
     * @param amount Amount to mint
     * @return txId Transaction ID
     */
    function proposeMint(address to, uint256 amount) public onlySigner returns (uint256 txId) {
        require(to != address(0), "FortyTwoToken: mint to zero address");
        require(amount > 0, "FortyTwoToken: amount must be > 0");

        txId = transactionCount++;

        transactions[txId] = Transaction({
            txType: TransactionType.Mint,
            target: to,
            amount: amount,
            confirmations: 0,
            executed: false,
            exists: true
        });

        emit TransactionProposed(txId, TransactionType.Mint, to, amount, msg.sender);
    }

    /**
     * @dev Proposes ownership transfer (signer only)
     * @param newOwner Address of new owner
     * @return txId Transaction ID
     */
    function proposeTransferOwnership(address newOwner) public onlySigner returns (uint256 txId) {
        require(newOwner != address(0), "FortyTwoToken: new owner is zero address");

        txId = transactionCount++;

        transactions[txId] = Transaction({
            txType: TransactionType.TransferOwnership,
            target: newOwner,
            amount: 0,
            confirmations: 0,
            executed: false,
            exists: true
        });

        emit TransactionProposed(txId, TransactionType.TransferOwnership, newOwner, 0, msg.sender);
    }

    /**
     * @dev Confirms a pending transaction (signer only)
     * @param txId Transaction ID to confirm
     */
    function confirmTransaction(uint256 txId)
        public
        onlySigner
        txExists(txId)
        notExecuted(txId)
        notConfirmed(txId)
    {
        Transaction storage txn = transactions[txId];
        txn.confirmations += 1;
        hasConfirmed[txId][msg.sender] = true;

        emit TransactionConfirmed(txId, msg.sender);
    }

    /**
     * @dev Revokes confirmation from a pending transaction (signer only)
     * @param txId Transaction ID to revoke confirmation from
     */
    function revokeConfirmation(uint256 txId)
        public
        onlySigner
        txExists(txId)
        notExecuted(txId)
    {
        require(hasConfirmed[txId][msg.sender], "FortyTwoToken: transaction not confirmed");

        Transaction storage txn = transactions[txId];
        txn.confirmations -= 1;
        hasConfirmed[txId][msg.sender] = false;

        emit TransactionRevoked(txId, msg.sender);
    }

    /**
     * @dev Executes a transaction after required confirmations are met
     * @param txId Transaction ID to execute
     */
    function executeTransaction(uint256 txId)
        public
        onlySigner
        txExists(txId)
        notExecuted(txId)
    {
        Transaction storage txn = transactions[txId];
        require(txn.confirmations >= requiredSignatures, "FortyTwoToken: not enough confirmations");

        txn.executed = true;

        if (txn.txType == TransactionType.Mint) {
            // Execute mint
            totalSupply += txn.amount;
            balanceOf[txn.target] += txn.amount;
            emit Transfer(address(0), txn.target, txn.amount);
        } else if (txn.txType == TransactionType.TransferOwnership) {
            // Execute ownership transfer
            address oldOwner = owner;
            owner = txn.target;
            emit OwnershipTransferred(oldOwner, txn.target);
        }

        emit TransactionExecuted(txId);
    }

    // ============ Signer Management (Owner Only) ============

    /**
     * @dev Adds a new signer (owner only)
     * @param signer Address to add as signer
     */
    function addSigner(address signer) public onlyOwner {
        require(signer != address(0), "FortyTwoToken: invalid signer address");
        require(!isSigner[signer], "FortyTwoToken: already a signer");

        isSigner[signer] = true;
        signers.push(signer);

        emit SignerAdded(signer);
    }

    /**
     * @dev Removes a signer (owner only)
     * @param signer Address to remove from signers
     */
    function removeSigner(address signer) public onlyOwner {
        require(isSigner[signer], "FortyTwoToken: not a signer");
        require(signers.length - 1 >= requiredSignatures, "FortyTwoToken: cannot remove, would break multisig");

        isSigner[signer] = false;

        // Remove from array
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }

        emit SignerRemoved(signer);
    }

    /**
     * @dev Changes required signature count (owner only)
     * @param newRequired New required signature count
     */
    function setRequiredSignatures(uint256 newRequired) public onlyOwner {
        require(newRequired > 0, "FortyTwoToken: required must be > 0");
        require(newRequired <= signers.length, "FortyTwoToken: required exceeds signer count");

        uint256 oldRequired = requiredSignatures;
        requiredSignatures = newRequired;

        emit RequiredSignaturesChanged(oldRequired, newRequired);
    }

    // ============ View Functions ============

    /**
     * @dev Returns all signers
     */
    function getSigners() public view returns (address[] memory) {
        return signers;
    }

    /**
     * @dev Returns signer count
     */
    function getSignerCount() public view returns (uint256) {
        return signers.length;
    }

    /**
     * @dev Returns transaction details
     */
    function getTransaction(uint256 txId) public view returns (
        TransactionType txType,
        address target,
        uint256 amount,
        uint256 confirmations,
        bool executed
    ) {
        Transaction storage txn = transactions[txId];
        return (txn.txType, txn.target, txn.amount, txn.confirmations, txn.executed);
    }

    /**
     * @dev Checks if transaction has enough confirmations
     */
    function isConfirmed(uint256 txId) public view returns (bool) {
        return transactions[txId].confirmations >= requiredSignatures;
    }
}
