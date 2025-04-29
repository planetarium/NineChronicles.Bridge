# NineChronicles Bridge

A bridge for transferring NCG between different planets (Planet A and Planet B) in Nine Chronicles.

## Overview

This project acts as a bridge for transferring NCG tokens between different planets. The basic structure is as follows:

```mermaid
sequenceDiagram
    participant User
    participant UpstreamAddress as Planet A Address (Upstream)
    participant Bridge as Bridge
    participant Vault as Planet B Vault Address
    participant DownstreamAddress as Planet B Address (Downstream)
    
    User->>UpstreamAddress: NCG Transfer (+ Destination Address Info)
    UpstreamAddress-->>Bridge: Transaction Verification
    Bridge->>Bridge: Transaction Validation
    Bridge->>Vault: Transfer Instruction
    Vault->>DownstreamAddress: NCG Transfer
    DownstreamAddress-->>User: Final Receipt Confirmation
    
    Note over User,DownstreamAddress: The reverse direction (Planet B → Planet A) works the same way
```

## Implementation

- **Transaction Monitoring**: Real-time monitoring of transactions on each planet through Headless GraphQL client.
- **State Storage**: Using PostgreSQL database to track the processing status and progress of each transaction.
- **Token Transfer**: The bridge directly signs and sends NCG to the destination address specified by the user.

## Getting Started

For detailed information on project setup and execution, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.
