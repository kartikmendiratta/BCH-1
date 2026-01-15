# Smart Contracts Documentation

> **Note:** This is a reference document. Smart contract development is handled separately.

---

## Overview

The escrow smart contract holds BCH during a P2P trade until both parties confirm the transaction.

---

## How It Works

```
1. Trade Initiated
   └── Seller creates escrow contract

2. Escrow Funded
   └── Seller sends BCH to contract address

3. Payment Made
   └── Buyer sends fiat to seller (off-chain)

4. BCH Released
   └── Seller confirms → BCH sent to buyer

5. (Optional) Dispute
   └── Timeout or manual intervention
```

---

## Contract Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SELLER    │     │   ESCROW    │     │    BUYER    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │   Create Escrow   │                   │
       │──────────────────>│                   │
       │                   │                   │
       │   Fund BCH        │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │   Fiat Payment    │
       │<──────────────────────────────────────│
       │                   │                   │
       │   Release BCH     │                   │
       │──────────────────>│──────────────────>│
       │                   │                   │
```

---

## CashScript Contract (Simple)

```solidity
// escrow.cash
pragma cashscript ^0.8.0;

contract Escrow(
    pubkey seller,
    pubkey buyer,
    int timeout
) {
    // Seller releases BCH to buyer
    function release(sig sellerSig) {
        require(checkSig(sellerSig, seller));
    }

    // Refund to seller after timeout
    function refund(sig sellerSig) {
        require(checkSig(sellerSig, seller));
        require(tx.time >= timeout);
    }

    // Both parties agree (dispute resolution)
    function resolve(sig sellerSig, sig buyerSig) {
        require(checkSig(sellerSig, seller));
        require(checkSig(buyerSig, buyer));
    }
}
```

---

## Backend Integration Points

### 1. Create Escrow
```ts
// When trade is initiated
POST /api/trades
→ Generate escrow contract
→ Return escrow address to seller
```

### 2. Check Funding
```ts
// Monitor escrow address for incoming BCH
GET /api/trades/:id/escrow-status
→ Check balance of escrow address
→ Update trade status if funded
```

### 3. Release BCH
```ts
// When seller confirms payment received
POST /api/trades/:id/release
→ Execute release function
→ BCH sent to buyer address
```

---

## API Endpoints (for frontend)

| Endpoint | Description |
|----------|-------------|
| `GET /api/trades/:id/escrow` | Get escrow address & status |
| `POST /api/trades/:id/release` | Release BCH to buyer |
| `POST /api/trades/:id/refund` | Refund BCH to seller (timeout) |

---

## Trade Statuses

| Status | Description |
|--------|-------------|
| `initiated` | Trade created, awaiting funding |
| `funded` | BCH locked in escrow |
| `paid` | Buyer marked fiat as sent |
| `completed` | BCH released to buyer |
| `refunded` | BCH returned to seller |
| `disputed` | Under review |

---

## Frontend Display

### Escrow Status Card
```
┌────────────────────────────────────┐
│  Escrow Status: FUNDED ✓           │
│                                    │
│  Address: bitcoincash:qz...        │
│  Amount: 0.5 BCH                   │
│                                    │
│  [View on Explorer]                │
└────────────────────────────────────┘
```

### Action Buttons (Seller)
```
┌────────────────────────────────────┐
│  Buyer has marked payment as sent  │
│                                    │
│  [ Release BCH ]  [ Open Dispute ] │
└────────────────────────────────────┘
```

---

## Resources

- **CashScript Docs:** https://cashscript.org/docs/
- **BCH Testnet Faucet:** https://tbch.googol.cash/
- **Block Explorer:** https://blockchair.com/bitcoin-cash

---

## Fallback (No Smart Contract)

If smart contracts are not ready:

1. Use platform-controlled multisig address
2. Platform acts as escrow holder
3. Manual release via admin panel

This works for demo purposes but is centralized.
