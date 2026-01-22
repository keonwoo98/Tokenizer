# FortyTwoToken (F42T) - Technical Documentation

## Overview

FortyTwoToken is a BEP-20 compliant token deployed on BNB Smart Chain Testnet, featuring a built-in multisignature security system for sensitive operations.

**Contract Address**: `0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E`

**Network**: BSC Testnet (Chain ID: 97)

**BSCScan**: https://testnet.bscscan.com/address/0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E#code

---

## Token Specifications

| Property | Value |
|----------|-------|
| Name | Forty Two Token |
| Symbol | F42T |
| Decimals | 18 |
| Initial Supply | 42,000,000 F42T |
| Standard | BEP-20 (ERC-20 compatible) |
| Solidity Version | ^0.8.20 |

---

## Architecture

### Design Decisions

**Why BNB Smart Chain?**
- Partnership between 42 and BNB Chain
- Lower gas fees compared to Ethereum
- Full EVM compatibility
- Active developer community

**Why Custom Implementation (not OpenZeppelin)?**
- Educational purpose: understand every line of code
- Full control over contract logic
- Demonstrates understanding of BEP-20 standard
- Cleaner code review during evaluation

**Why Multisig for Bonus?**
- Most practical security enhancement
- Real-world use case (DAO treasuries, company wallets)
- Demonstrates advanced Solidity patterns
- Adds genuine value to the token

---

## Features

### Standard BEP-20 Functions

| Function | Description |
|----------|-------------|
| `transfer(to, value)` | Transfer tokens to an address |
| `approve(spender, value)` | Authorize spender to use tokens |
| `transferFrom(from, to, value)` | Transfer on behalf of token owner |
| `balanceOf(address)` | Query token balance |
| `allowance(owner, spender)` | Query approved amount |

### Additional Features

| Function | Access | Description |
|----------|--------|-------------|
| `burn(amount)` | Public | Permanently destroy tokens |
| `addSigner(address)` | Owner | Add multisig signer |
| `removeSigner(address)` | Owner | Remove multisig signer |
| `setRequiredSignatures(n)` | Owner | Change signature threshold |

### Multisig Functions (Bonus)

| Function | Access | Description |
|----------|--------|-------------|
| `proposeMint(to, amount)` | Signer | Propose token minting |
| `proposeTransferOwnership(newOwner)` | Signer | Propose ownership change |
| `confirmTransaction(txId)` | Signer | Approve pending transaction |
| `revokeConfirmation(txId)` | Signer | Withdraw approval |
| `executeTransaction(txId)` | Signer | Execute approved transaction |

---

## Multisig System

### How It Works

```
1. PROPOSE
   └─> Signer calls proposeMint() or proposeTransferOwnership()
   └─> Transaction created with ID, confirmations = 0

2. CONFIRM
   └─> Multiple signers call confirmTransaction(txId)
   └─> Each confirmation increments counter
   └─> Same signer cannot confirm twice

3. EXECUTE
   └─> Any signer calls executeTransaction(txId)
   └─> Requires confirmations >= requiredSignatures
   └─> Transaction marked as executed
```

### Security Benefits

| Risk | Mitigation |
|------|------------|
| Single key compromise | Multiple signatures required |
| Accidental transactions | Review period before execution |
| Centralization | Distributed decision-making |
| Unauthorized minting | Consensus required |

### Protected Operations

- **Mint**: Creating new tokens affects total supply
- **Ownership Transfer**: Full control handover requires consensus

### Unprotected Operations (by design)

- **Transfer**: Users control their own tokens
- **Burn**: Users can only burn their own tokens
- **Approve**: Individual allowance management

---

## Security Considerations

### Implemented Safeguards

| Pattern | Implementation |
|---------|----------------|
| Checks-Effects-Interactions | State changes before external calls |
| Zero Address Validation | All transfers check for address(0) |
| Overflow Protection | Solidity 0.8+ built-in checks |
| Access Control | onlyOwner, onlySigner modifiers |
| Reentrancy Prevention | No external calls in critical paths |

### Multisig-Specific Protections

```solidity
// Prevent breaking multisig threshold
require(signers.length - 1 >= requiredSignatures, "would break multisig");

// Prevent double confirmation
require(!hasConfirmed[txId][msg.sender], "already confirmed");

// Prevent re-execution
require(!transactions[txId].executed, "already executed");
```

---

## Events

### Standard Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### Multisig Events

```solidity
event SignerAdded(address indexed signer);
event SignerRemoved(address indexed signer);
event RequiredSignaturesChanged(uint256 oldRequired, uint256 newRequired);
event TransactionProposed(uint256 indexed txId, TransactionType txType, address indexed target, uint256 amount, address indexed proposer);
event TransactionConfirmed(uint256 indexed txId, address indexed signer);
event TransactionRevoked(uint256 indexed txId, address indexed signer);
event TransactionExecuted(uint256 indexed txId);
```

---

## Testing

### Test Coverage

**35 tests passing** across 9 categories:

| Category | Tests | Coverage |
|----------|-------|----------|
| Deployment | 7 | name, symbol, decimals, supply, owner, signers |
| Transfer | 4 | success, event, insufficient balance, zero address |
| Approve & TransferFrom | 4 | allowance, event, delegated transfer, excess |
| Burn | 2 | success, insufficient balance |
| Multisig Mint | 7 | propose, confirm, execute, edge cases |
| Multisig Ownership | 2 | propose, execute |
| Revoke Confirmation | 2 | success, not confirmed |
| Signer Management | 5 | add, remove, threshold protection |
| View Functions | 2 | getSigners, isConfirmed |

### Running Tests

```bash
cd code
npm install
npm test
```

---

## Deployment

### Prerequisites

- Node.js v18+
- MetaMask with BSC Testnet configured
- tBNB for gas fees

### Configuration

1. Create `.env` file:
```
PRIVATE_KEY=your_private_key
BSCSCAN_API_KEY=your_api_key  # optional
```

2. Deploy:
```bash
npm run deploy:testnet
```

3. Verify:
```bash
npx hardhat verify --network bscTestnet --constructor-args scripts/verify-args.js <CONTRACT_ADDRESS>
```

---

## Project Structure

```
Tokenizer/
├── README.md                      # Project overview
├── code/
│   ├── contracts/
│   │   └── FortyTwoToken.sol      # Main contract
│   ├── scripts/
│   │   ├── deploy.js              # Deployment script
│   │   └── verify-args.js         # Verification arguments
│   ├── test/
│   │   └── FortyTwoToken.test.js  # 35 unit tests
│   ├── hardhat.config.js          # Hardhat configuration
│   └── package.json               # Dependencies
├── deployment/
│   └── bsc-testnet.json           # Deployment info
└── documentation/
    ├── concepts.md                # Learning notes (Korean)
    └── whitepaper.md              # This document
```

---

## Usage Examples

### Adding Token to MetaMask

1. Open MetaMask
2. Switch to BSC Testnet
3. Click "Import tokens"
4. Enter contract address: `0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E`
5. F42T token appears in wallet

### Interacting via BSCScan

1. Go to [Contract Page](https://testnet.bscscan.com/address/0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E#code)
2. Click "Read Contract" for queries
3. Click "Write Contract" and connect wallet for transactions

### Multisig Workflow Example

```
Scenario: Mint 1000 tokens to address X with 2-of-3 multisig

1. Signer A: proposeMint(X, 1000 * 10^18)
   → Returns txId = 0

2. Signer A: confirmTransaction(0)
   → confirmations = 1

3. Signer B: confirmTransaction(0)
   → confirmations = 2 (threshold met)

4. Signer A or B: executeTransaction(0)
   → Tokens minted to X
```

---

## License

MIT

---

## Author

42 Student - Tokenizer Project

Built as part of the 42 x BNB Chain partnership program.
