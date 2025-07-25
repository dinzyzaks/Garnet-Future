# Garnet Future - Public Crisis Ledger

This Clarinet project implements a simple, yet powerful smart contract for a "Public Crisis Ledger".

## The Problem

In times of crisis (natural disasters, public health emergencies, etc.), misinformation can spread rapidly, causing confusion and harm. It's crucial for the public to have a reliable way to verify official announcements from authorized entities like government agencies or NGOs.

## The Solution

This project provides a smart contract that acts as an immutable, on-chain ledger.

- **Verifiable Truth:** Authorized organizations can register a unique fingerprint (a SHA256 hash) of their official messages on the Stacks blockchain.
- **Transparency:** Anyone can look up a message's hash on the blockchain to confirm its authenticity and see who announced it and when.
- **Simplicity:** The contract is intentionally minimal, making it easy to understand, audit, and use.

This creates a single source of truth that is resistant to censorship and tampering, helping to build public trust during critical events.

## How it Works

The `public-crisis-ledger.clar` contract allows a designated owner (the deployer of the contract) to record message hashes.

- `register-message`: The owner calls this function with the hash of a message. The contract stores the hash, the announcer's address, and the block height, assigning it a new, sequential ID.
- `get-message`: Anyone can call this read-only function with a message ID to retrieve its details.

This project serves as a foundational example of how blockchain technology can be used for social good in a practical and straightforward way.
