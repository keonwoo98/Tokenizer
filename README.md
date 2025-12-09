# Tokenizer

A BEP-20 token project built on BNB Smart Chain for the 42 x BNB Chain partnership.

## Project Overview

**FortyTwoToken (F42T)** is a fully compliant BEP-20 token deployed on BSC Testnet with mint, burn, and ownership management features.

## Token Information

| Property | Value |
|----------|-------|
| Token Name | Forty Two Token |
| Symbol | F42T |
| Decimals | 18 |
| Total Supply | 42,000,000 F42T |
| Network | BSC Testnet (Chain ID: 97) |
| Contract Address | `0xa2b57d8502bd619693E4f00EF2756B721D3699E5` |

**BSCScan:** https://testnet.bscscan.com/address/0xa2b57d8502bd619693E4f00EF2756B721D3699E5

## Features

- **BEP-20 Standard Compliant**: transfer, approve, transferFrom, allowance
- **Mintable**: Owner can mint new tokens
- **Burnable**: Any holder can burn their tokens
- **Ownable**: Ownership transfer capability

## Project Structure

```
Tokenizer/
├── code/
│   ├── contracts/
│   │   └── FortyTwoToken.sol    # Main token contract
│   ├── scripts/
│   │   └── deploy.js            # Deployment script
│   ├── test/
│   │   └── FortyTwoToken.test.js # Unit tests (21 tests)
│   ├── hardhat.config.js        # Hardhat configuration
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment variables template
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
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> 42000000
```

## Smart Contract Details

### Functions

| Function | Access | Description |
|----------|--------|-------------|
| `transfer(to, value)` | Public | Transfer tokens to address |
| `approve(spender, value)` | Public | Approve spender allowance |
| `transferFrom(from, to, value)` | Public | Transfer on behalf of owner |
| `mint(to, amount)` | Owner only | Create new tokens |
| `burn(amount)` | Public | Destroy caller's tokens |
| `transferOwnership(newOwner)` | Owner only | Transfer contract ownership |

### Events

- `Transfer(from, to, value)` - Emitted on token transfer
- `Approval(owner, spender, value)` - Emitted on approval
- `OwnershipTransferred(previousOwner, newOwner)` - Emitted on ownership change

## Security Considerations

- Follows Checks-Effects-Interactions pattern
- Uses Solidity 0.8.20 (built-in overflow protection)
- Zero address validation on all transfers
- Owner-only access control for minting

## Development

### Tech Stack

- **Solidity**: ^0.8.20
- **Framework**: Hardhat
- **Testing**: Chai, Mocha
- **Network**: BNB Smart Chain Testnet

### Test Coverage

All 21 tests passing:
- Deployment (5 tests)
- Transfer (4 tests)
- Approve & TransferFrom (4 tests)
- Mint (2 tests)
- Burn (2 tests)
- Ownership (4 tests)

## License

MIT

## Author

42 Student - Tokenizer Project
