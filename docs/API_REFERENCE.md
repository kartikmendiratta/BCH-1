# API Reference

Quick reference for all API endpoints.

---

## Base URL
```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

---

## Authentication

All protected routes require:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-01-12T10:00:00Z"
}
```

---

### Offers

#### List Offers
```http
GET /offers?type=sell&fiat=USD&page=1&limit=20

Response:
{
  "offers": [
    {
      "id": 1,
      "user_id": 2,
      "type": "sell",
      "amount_bch": 0.5,
      "price_per_bch": 450,
      "fiat_currency": "USD",
      "payment_method": "bank_transfer",
      "min_limit": 50,
      "max_limit": 500,
      "status": "active",
      "created_at": "2026-01-12T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1
}
```

#### Get Offer
```http
GET /offers/:id

Response:
{
  "id": 1,
  "user_id": 2,
  "user_email": "seller@example.com",
  ...
}
```

#### Create Offer
```http
POST /offers
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "sell",
  "amount_bch": 0.5,
  "price_per_bch": 450,
  "fiat_currency": "USD",
  "payment_method": "bank_transfer",
  "min_limit": 50,
  "max_limit": 500
}

Response:
{
  "id": 1,
  "message": "Offer created"
}
```

#### Delete Offer
```http
DELETE /offers/:id
Authorization: Bearer <token>

Response:
{
  "message": "Offer deleted"
}
```

---

### Trades

#### Initiate Trade
```http
POST /trades
Authorization: Bearer <token>
Content-Type: application/json

{
  "offer_id": 1,
  "amount_bch": 0.25
}

Response:
{
  "id": 1,
  "escrow_address": "bitcoincash:qz...",
  "status": "initiated"
}
```

#### Get User Trades
```http
GET /trades
Authorization: Bearer <token>

Response:
{
  "trades": [
    {
      "id": 1,
      "offer_id": 1,
      "buyer_id": 3,
      "seller_id": 2,
      "amount_bch": 0.25,
      "amount_fiat": 112.5,
      "fiat_currency": "USD",
      "status": "funded",
      "created_at": "2026-01-12T10:00:00Z"
    }
  ]
}
```

#### Get Trade Details
```http
GET /trades/:id
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "offer_id": 1,
  "buyer": { "id": 3, "email": "buyer@example.com" },
  "seller": { "id": 2, "email": "seller@example.com" },
  "amount_bch": 0.25,
  "amount_fiat": 112.5,
  "fiat_currency": "USD",
  "payment_method": "bank_transfer",
  "escrow_address": "bitcoincash:qz...",
  "status": "funded",
  "messages": [
    { "sender_id": 3, "content": "Hi!", "created_at": "..." }
  ]
}
```

#### Update Trade Status
```http
PATCH /trades/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "paid"
}

Response:
{
  "message": "Status updated",
  "status": "paid"
}
```

#### Release BCH
```http
POST /trades/:id/release
Authorization: Bearer <token>

Response:
{
  "message": "BCH released",
  "txid": "abc123..."
}
```

---

### Invoices

#### Create Invoice
```http
POST /invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Web Development Service",
  "description": "Frontend development work",
  "amount_fiat": 500,
  "fiat_currency": "USD"
}

Response:
{
  "id": 1,
  "payment_address": "bitcoincash:qz...",
  "amount_bch": 1.11,
  "status": "pending"
}
```

#### List Invoices
```http
GET /invoices
Authorization: Bearer <token>

Response:
{
  "invoices": [
    {
      "id": 1,
      "title": "Web Development Service",
      "amount_fiat": 500,
      "fiat_currency": "USD",
      "amount_bch": 1.11,
      "status": "pending",
      "created_at": "2026-01-12T10:00:00Z"
    }
  ]
}
```

#### Get Invoice (Public)
```http
GET /invoices/public/:id

Response:
{
  "id": 1,
  "title": "Web Development Service",
  "description": "Frontend development work",
  "amount_fiat": 500,
  "fiat_currency": "USD",
  "amount_bch": 1.11,
  "payment_address": "bitcoincash:qz...",
  "status": "pending"
}
```

---

### Wallet

#### Get Balance
```http
GET /wallet/balance
Authorization: Bearer <token>

Response:
{
  "balance_bch": 1.25,
  "balance_usd": 562.5
}
```

#### Get Deposit Address
```http
GET /wallet/address
Authorization: Bearer <token>

Response:
{
  "address": "bitcoincash:qz...",
  "qr_code": "data:image/png;base64,..."
}
```

#### Get Transactions
```http
GET /wallet/transactions
Authorization: Bearer <token>

Response:
{
  "transactions": [
    {
      "txid": "abc123...",
      "type": "deposit",
      "amount_bch": 0.5,
      "confirmations": 3,
      "timestamp": "2026-01-12T10:00:00Z"
    }
  ]
}
```

---

### Price

#### Get BCH Prices
```http
GET /price

Response:
{
  "usd": 450,
  "inr": 37500,
  "eur": 415
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Missing or invalid token |
| `INVALID_INPUT` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `FORBIDDEN` | Not authorized for this action |
| `INSUFFICIENT_FUNDS` | Not enough BCH |
| `TRADE_NOT_FUNDED` | Escrow not funded yet |
