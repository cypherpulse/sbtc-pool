# SBTC Lucky Raffle

[![Stacks](https://img.shields.io/badge/Stacks-3.0-blue.svg)](https://stacks.co/)
[![Clarity](https://img.shields.io/badge/Clarity-2.1-orange.svg)](https://clarity-lang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A decentralized raffle system built on the Stacks blockchain using Clarity smart contracts. Participants purchase raffle tickets using sBTC tokens, with the prize pool distributed to a randomly selected winner.

## Overview

This project implements a simple yet robust lottery system on the Stacks blockchain, leveraging the security and transparency of blockchain technology. The system consists of two main smart contracts:

- **sbtc-token.clar**: A SIP-010 compliant fungible token representing sBTC (Stacks Bitcoin) for testing and demonstration purposes.
- **sbtc-lucky-raffle.clar**: The core raffle contract that manages ticket purchases, winner selection, and prize distribution.

Key features include:
- Secure ticket purchasing with sBTC tokens
- Pseudo-random winner selection based on block height
- Owner-controlled raffle management
- Transparent prize pool tracking
- Reset functionality for subsequent raffle rounds

## Deployment

### Testnet Deployment
The contract has been successfully deployed to Stacks testnet:

- **Contract Name**: `sbtc-lucky-raffle`
- **Contract Address**: `STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle`
- **Deployer**: `STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y`
- **Network**: Stacks Testnet
- **Stacks Node**: `https://api.testnet.hiro.so`
- **Deployment Cost**: 0.048700 STX
- **Clarity Version**: 3.0
- **Epoch**: 3.0

### Contract Functions

#### Public Functions
- `buy-tickets(num-tickets)`: Purchase raffle tickets with sBTC
- `draw-winner()`: Owner draws winner using pseudo-random selection
- `claim-prize()`: Winner claims the full sBTC prize pool

### Usage Examples

#### Buying Tickets
```clarity
;; Buy 5 tickets (0.05 sBTC total)
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle buy-tickets u5)
```

#### Drawing Winner (Owner Only)
```clarity
;; Draw winner using block height randomness
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle draw-winner)
```

#### Claiming Prize (Winner Only)
```clarity
;; Winner claims entire prize pool
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle claim-prize)
```

#### Checking Status
```clarity
;; Get your ticket count
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle get-my-tickets)

;; Get total tickets sold
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle get-total-tickets)

;; Get current prize pool
(contract-call? 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle get-pot-balance)
```

## Getting Started
- **Transparency**: All contract state is publicly readable

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Clarinet](https://github.com/hirosystems/clarinet) (Stacks development framework)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd clarity-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Clarinet (if not already installed):
   ```bash
   # Follow instructions at https://github.com/hirosystems/clarinet
   ```

## Usage

### Development Environment

1. Check contracts for syntax errors:
   ```bash
   clarinet check
   ```

2. Run the development console:
   ```bash
   clarinet console
   ```

### Testing

Run the test suite:
```bash
npm test
```

For test coverage and cost analysis:
```bash
npm run test:report
```

Watch mode for continuous testing:
```bash
npm run test:watch
```

### Deployment

1. Configure your deployment settings in `settings/` directory for the desired network (Devnet, Testnet, or Mainnet).

2. Deploy using Clarinet:
   ```bash
   clarinet deployments generate --devnet
   clarinet deployments apply
   ```

## Contract Functions

### sbtc-lucky-raffle Contract

#### Public Functions
- `buy-tickets(num-tickets)`: Purchase raffle tickets with sBTC
- `draw-winner()`: Select winner (owner only)
- `claim-prize()`: Claim prize (winner only)

#### Read-Only Functions
- `get-my-tickets()`: Get caller's ticket count
- `get-total-tickets()`: Get total tickets sold
- `get-winner()`: Get current winner
- `get-raffle-active()`: Check if raffle is active
- `get-ticket-price()`: Get ticket price
- `get-player-tickets(player)`: Get specific player's tickets

### sbtc-token Contract

#### Public Functions
- `transfer(amount, sender, recipient, memo)`: Transfer sBTC tokens
- `mint(amount, recipient)`: Mint new sBTC tokens (owner only)

#### Read-Only Functions
- `get-balance(who)`: Get token balance
- `get-name()`: Get token name
- `get-symbol()`: Get token symbol

## Configuration

The project uses Clarinet for configuration. Key settings:

- **Epoch**: 3.0 (Stacks 2.1)
- **Ticket Price**: 1,000,000 micro-sBTC (0.01 sBTC)
- **Contract Owner**: Deployer address

## Testing on Testnet

The contract is now live on Stacks testnet! You can interact with it using:

1. **Stacks Explorer**: View transactions at [explorer.stacks.co](https://explorer.stacks.co)
2. **Clarinet Console**: Use `clarinet console --testnet` for interactive testing
3. **Direct API calls**: Use the Stacks API at `https://api.testnet.hiro.so`

### Next Steps

1. **Get Test sBTC**: Obtain sBTC tokens from the testnet faucet
2. **Test Transactions**: Try buying tickets and drawing winners
3. **Monitor Contract**: Watch the prize pool grow and winners claim prizes
4. **Mainnet Deployment**: Once thoroughly tested, deploy to mainnet

## Testing Strategy

The test suite covers:
- Ticket purchasing functionality
- Winner selection process
- Prize claiming mechanism
- Error handling for invalid operations
- Edge cases and security validations

Tests are written using Vitest with the Clarinet SDK, ensuring comprehensive coverage of contract logic.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Submit a pull request with a clear description

### Development Guidelines

- Follow Clarity best practices
- Add comprehensive tests for new features
- Update documentation for contract changes
- Ensure all checks pass before submitting

## Security Considerations

- Winner selection uses block height for pseudo-randomness (not suitable for high-value raffles)
- All token transfers are validated
- Owner controls critical functions (draw-winner)
- Contract state is transparent and publicly verifiable

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://clarity-lang.org/)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)
- [SIP-010 Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)

## Support

For questions or support:
- Open an issue on GitHub
- Join the Stacks Discord community
- Check the Stacks documentation

---

Built with ❤️ on the Stacks blockchain</content>
<parameter name="filePath">g:\2025\Learning\Blockchain\Stacks\Counter\sbtcRaffle\clarity-contract\README.md