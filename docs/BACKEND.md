# Backend Documentation

## Tech Stack
- Node.js + Express
- TypeScript
- SQLite (dev) / PostgreSQL (prod)
- Socket.io
- JWT Authentication
- bcrypt (password hashing)

---

## Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── offer.controller.ts
│   │   ├── trade.controller.ts
│   │   ├── invoice.controller.ts
│   │   └── wallet.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── offer.routes.ts
│   │   ├── trade.routes.ts
│   │   ├── invoice.routes.ts
│   │   └── wallet.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validate.middleware.ts
│   ├── services/
│   │   ├── bch.service.ts
│   │   ├── price.service.ts
│   │   └── email.service.ts
│   ├── models/
│   │   └── index.ts
│   ├── socket/
│   │   └── chat.socket.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── config/
│   │   └── db.ts
│   └── index.ts
├── .env
└── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Offers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offers` | List all offers (with filters) |
| GET | `/api/offers/:id` | Get offer by ID |
| POST | `/api/offers` | Create new offer |
| DELETE | `/api/offers/:id` | Delete offer |

### Trades
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trades` | Initiate trade |
| GET | `/api/trades` | Get user's trades |
| GET | `/api/trades/:id` | Get trade details |
| PATCH | `/api/trades/:id/status` | Update trade status |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices` | List user invoices |
| GET | `/api/invoices/:id` | Get invoice details |
| GET | `/api/invoices/public/:id` | Public invoice view |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get BCH balance |
| GET | `/api/wallet/address` | Get deposit address |
| POST | `/api/wallet/withdraw` | Withdraw BCH |
| GET | `/api/wallet/transactions` | Transaction history |

### Price
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/price` | Get BCH price (all fiats) |
| GET | `/api/price/:fiat` | Get BCH price (specific fiat) |

---

## Database Schema

### Users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bch_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Offers
```sql
CREATE TABLE offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,           -- 'buy' or 'sell'
    amount_bch REAL NOT NULL,
    price_per_bch REAL NOT NULL,
    fiat_currency TEXT NOT NULL,  -- 'USD', 'INR', 'EUR'
    payment_method TEXT NOT NULL,
    min_limit REAL,
    max_limit REAL,
    status TEXT DEFAULT 'active', -- 'active', 'inactive'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Trades
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    amount_bch REAL NOT NULL,
    amount_fiat REAL NOT NULL,
    fiat_currency TEXT NOT NULL,
    escrow_address TEXT,
    status TEXT DEFAULT 'initiated', -- 'initiated', 'funded', 'paid', 'completed', 'disputed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

### Messages
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

### Invoices
```sql
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount_fiat REAL NOT NULL,
    fiat_currency TEXT NOT NULL,
    amount_bch REAL NOT NULL,
    payment_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'expired'
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Code Examples

### Server Setup
```ts
// src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDB } from './config/db';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*' }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/price', priceRoutes);

// Socket.io
io.on('connection', (socket) => {
  socket.on('join_trade', (tradeId) => socket.join(`trade_${tradeId}`));
  socket.on('send_message', (data) => {
    io.to(`trade_${data.tradeId}`).emit('new_message', data);
  });
});

initDB().then(() => {
  httpServer.listen(3000, () => console.log('Server running on :3000'));
});
```

### Auth Middleware
```ts
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Auth Controller
```ts
// src/controllers/auth.controller.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';

export const register = async (req, res) => {
  const { email, password } = req.body;
  
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const hash = await bcrypt.hash(password, 10);
  const result = await db.run(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hash]
  );
  
  const token = jwt.sign({ userId: result.lastID }, process.env.JWT_SECRET);
  res.json({ token, user: { id: result.lastID, email } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email } });
};
```

### Price Service
```ts
// src/services/price.service.ts
import axios from 'axios';

let priceCache = { prices: null, timestamp: 0 };
const CACHE_TTL = 60000; // 1 minute

export const getBCHPrices = async () => {
  if (priceCache.prices && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.prices;
  }

  const res = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd,inr,eur'
  );
  
  priceCache = {
    prices: res.data['bitcoin-cash'],
    timestamp: Date.now()
  };
  
  return priceCache.prices;
};
```

---

## Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_trade` | `tradeId` | Join trade chat room |
| `leave_trade` | `tradeId` | Leave trade chat room |
| `send_message` | `{ tradeId, content }` | Send chat message |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ senderId, content, timestamp }` | New chat message |
| `trade_update` | `{ tradeId, status }` | Trade status changed |
| `payment_received` | `{ invoiceId }` | Invoice paid |

---

## Setup Commands
```bash
# Create project
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express cors socket.io jsonwebtoken bcrypt better-sqlite3 axios dotenv
npm install -D typescript ts-node @types/node @types/express @types/cors @types/bcrypt

# Init TypeScript
npx tsc --init

# Run dev
npx ts-node src/index.ts
```

---

## Environment Variables
```env
PORT=3000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
DATABASE_URL=./database.sqlite
```

---

## Response Format

### Success
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
