# Development Environment Setup and Contribution Guide

This document explains how to contribute to the NineChronicles Bridge project or set up a local development environment.

## Requirements

- Node.js (>=16)
- Yarn
- Docker and Docker Compose
- PostgreSQL

## Local Development Environment Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Variable Setup

Create a `.env` file in the project root and set it up as follows:

```
# Database settings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/local_db

# Planet settings
PLANETS_JSON_PATH=./local-test/local-planet-sample.json

# Account settings
NC_UPSTREAM__PRIVATE_KEY=YOUR_UPSTREAM_PRIVATE_KEY
NC_DOWNSTREAM__PRIVATE_KEY=YOUR_DOWNSTREAM_PRIVATE_KEY

# Vault settings
NC_VAULT_ADDRESS=YOUR_VAULT_ADDRESS_HEX
NC_VAULT_AVATAR_ADDRESS=YOUR_VAULT_AVATAR_ADDRESS_HEX

# Initial block index settings (tracking start point)
NC_UPSTREAM__RDB__START_BLOCK_INDEX=YOUR_UPSTREAM_START_BLOCK_INDEX
NC_DOWNSTREAM__RDB__START_BLOCK_INDEX=YOUR_DOWNSTREAM_START_BLOCK_INDEX

# PostgreSQL usage setting
USE_RDB=true

# Optional settings
NC_UPSTREAM_NCG_MINTER=YOUR_UPSTREAM_NCG_MINTER_ADDRESS
```

> Note: In production environments, make sure to securely set `NC_UPSTREAM__PRIVATE_KEY` and `NC_DOWNSTREAM__PRIVATE_KEY`.

### 3. PostgreSQL Setup

Run PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

### 4. Planet Setup

Planet information is managed in JSON files. A sample file is located at `local-test/local-planet-sample.json`.
You can modify this file or create a new one as needed.

For local testing, you can run a simple HTTP server to serve the Planet information:

```bash
cd local-test
npx http-server -p 8080
```

Then, you can set PLANETS_JSON_PATH to `http://localhost:8080/local-planet-sample.json`.

### 5. Project Build and Run

```bash
# Generate GraphQL code and Prisma client
yarn codegen

# Run the project
yarn start
```

## Code Style

This project uses Biome as a code formatter:

```bash
npx @biomejs/biome check --apply .
``` 
