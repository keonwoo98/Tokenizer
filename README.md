# Tokenizer

A BEP-20 token project built on BNB Smart Chain for the 42 x BNB Chain partnership.

## Project Overview

**FortyTwoToken (F42T)** is a fully compliant BEP-20 token deployed on BSC Testnet with mint, burn, ownership management, and **multisig security** features.

## Token Information

| Property | Value |
|----------|-------|
| Token Name | Forty Two Token |
| Symbol | F42T |
| Decimals | 18 |
| Total Supply | 42,000,000 F42T |
| Network | BSC Testnet (Chain ID: 97) |
| Contract Address | `0x195B7b68Cd3D9648FbD5e387a22377de922A22Fa` |

**BSCScan:** https://testnet.bscscan.com/address/0x195B7b68Cd3D9648FbD5e387a22377de922A22Fa#code

## Features

### Mandatory Features
- **BEP-20 Standard Compliant**: transfer, approve, transferFrom, allowance
- **Burnable**: Any holder can burn their tokens
- **Ownable**: Ownership transfer capability

### Bonus Feature: Multisig System
- **Multi-signature Security**: Sensitive operations require multiple approvals
- **Configurable Threshold**: Set required number of signatures (e.g., 2-of-3)
- **Protected Operations**: Mint and ownership transfer require multisig approval
- **Signer Management**: Owner can add/remove signers

## Project Structure

```
Tokenizer/
├── code/
│   ├── contracts/
│   │   └── FortyTwoToken.sol    # Main token contract with multisig
│   ├── scripts/
│   │   ├── deploy.js            # Deployment script
│   │   └── verify-args.js       # Verification arguments
│   ├── test/
│   │   └── FortyTwoToken.test.js # Unit tests (35 tests)
│   ├── hardhat.config.js        # Hardhat configuration
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment variables template
├── deployment/
│   └── bsc-testnet.json         # Deployment information
├── documentation/
│   └── concepts.md              # Blockchain & token concepts
└── README.md                    # This file
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm
- MetaMask wallet with BSC Testnet configured

### Installation

```bash
cd code
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your private key:
```
PRIVATE_KEY=your_metamask_private_key
BSCSCAN_API_KEY=your_etherscan_api_key  # Optional, for verification
```

### Run Tests

```bash
npm test
```

### Deploy

**Local (Hardhat Network):**
```bash
npm run deploy:local
```

**BSC Testnet:**
```bash
npm run deploy:testnet
```

### Verify Contract

```bash
npx hardhat verify --network bscTestnet --constructor-args scripts/verify-args.js <CONTRACT_ADDRESS>
```

## Smart Contract Details

### BEP-20 Standard Functions

| Function | Access | Description |
|----------|--------|-------------|
| `transfer(to, value)` | Public | Transfer tokens to address |
| `approve(spender, value)` | Public | Approve spender allowance |
| `transferFrom(from, to, value)` | Public | Transfer on behalf of owner |
| `burn(amount)` | Public | Destroy caller's tokens |

### Multisig Functions (Bonus)

| Function | Access | Description |
|----------|--------|-------------|
| `proposeMint(to, amount)` | Signer | Propose new token mint |
| `proposeTransferOwnership(newOwner)` | Signer | Propose ownership transfer |
| `confirmTransaction(txId)` | Signer | Confirm a pending transaction |
| `revokeConfirmation(txId)` | Signer | Revoke confirmation |
| `executeTransaction(txId)` | Signer | Execute after enough confirmations |
| `addSigner(address)` | Owner | Add new signer |
| `removeSigner(address)` | Owner | Remove signer |
| `setRequiredSignatures(n)` | Owner | Change required signature count |

### How Multisig Works

```
1. Signer proposes transaction (mint or ownership transfer)
   └─> proposeMint(recipient, amount)

2. Multiple signers confirm the transaction
   └─> confirmTransaction(txId)  [repeat until threshold met]

3. Any signer executes once threshold is reached
   └─> executeTransaction(txId)

4. Transaction is executed on-chain
```

### Events

**Standard Events:**
- `Transfer(from, to, value)` - Token transfer
- `Approval(owner, spender, value)` - Allowance approval
- `OwnershipTransferred(previousOwner, newOwner)` - Ownership change

**Multisig Events:**
- `SignerAdded(signer)` - New signer added
- `SignerRemoved(signer)` - Signer removed
- `TransactionProposed(txId, txType, target, amount, proposer)` - New proposal
- `TransactionConfirmed(txId, signer)` - Confirmation received
- `TransactionRevoked(txId, signer)` - Confirmation revoked
- `TransactionExecuted(txId)` - Transaction executed

## Security Considerations

- Follows Checks-Effects-Interactions pattern
- Uses Solidity 0.8.20 (built-in overflow protection)
- Zero address validation on all transfers
- **Multisig protection for sensitive operations**
- Signer count validation prevents breaking multisig threshold

## Development

### Tech Stack

- **Solidity**: ^0.8.20
- **Framework**: Hardhat
- **Testing**: Chai, Mocha
- **Network**: BNB Smart Chain Testnet

### Test Coverage

All 35 tests passing:
- Deployment (7 tests)
- Transfer (4 tests)
- Approve & TransferFrom (4 tests)
- Burn (2 tests)
- Multisig Mint (7 tests)
- Multisig Ownership Transfer (2 tests)
- Revoke Confirmation (2 tests)
- Signer Management (5 tests)
- View Functions (2 tests)

## License

MIT

## Author

42 Student - Tokenizer Project
