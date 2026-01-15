# BCH P2P Exchange PoC - Hackathon Project

## Project Overview
A minimal P2P Bitcoin Cash (BCH) exchange platform with multi-fiat support and business invoicing. This is a **Proof of Concept (PoC)** designed for a hackathon.

* **Team:**
    * **Dev A:** Frontend Specialist
    * **Dev B:** Full-stack (Frontend + Backend + Smart Contracts)
    * **Dev C:** Backend + Smart Contracts
* **Timeline:** 3-5 days

---

## MVP Features (Minimal for Demo)

### 1. P2P Trading (Core)
* Simple user registration (email + password, no KYC).
* Create buy/sell BCH offers.
* View available offers with filters.
* Basic escrow mechanism (smart contract).
* Manual payment confirmation.
* Simple chat for trades.

### 2. Multi-Fiat Support
* Support USD, INR, EUR (easily extensible).
* Live BCH price in multiple fiats.
* Users select their preferred fiat.
* Payment methods per fiat (bank transfer, UPI for INR, etc.).

### 3. Invoice System (Unique Feature)
* Create invoice with BCH payment.
* Generate QR code for payment.
* Track payment status.
* Simple invoice template.
* Payment notification.

### 4. Basic Wallet
* Display BCH balance.
* Deposit address with QR.
* Simple withdrawal.
* Transaction history.

---

## Tech Stack (Simplified)

### Frontend
* React + TypeScript + Vite
* TailwindCSS
* Zustand (lightweight state)
* Socket.io client
* `bitcoin-cash-js`

### Backend
* Node.js + Express
* SQLite (quick setup) / PostgreSQL
* Socket.io
* JWT auth
* CashScript for escrow

### Deployment
* **Frontend:** Vercel/Netlify
* **Backend:** Railway/Render
* **Database:** Built-in/hosted

---

## Task Distribution

### DEV A - Frontend (Day 1-4)

**Day 1: Setup & Landing**
* [ ] Initialize React + Vite + TypeScript.
* [ ] Configure TailwindCSS.
* [ ] Setup routing (React Router) & Basic layout component.
* [ ] **Landing Page:** Hero section, Features section, How it works, Simple footer.
* [ ] Responsive design.

**Day 2: Auth & Dashboard**
* [ ] **Authentication UI:** Login form, Register form, Simple validation, Auth state management.
* [ ] **Dashboard Layout:** Sidebar, Header, Main content, Mobile menu.
* [ ] **Marketplace View:** Offer list cards, Fiat/Buy/Sell filters, Create offer modal.

**Day 3: Trading Interface**
* [ ] **Create Offer Form:** Amount (BCH), Price (Fiat), Payment method, Trade limits.
* [ ] **Trade Flow UI:** Trade details card, Chat box, Payment instructions, "I have paid" / "Release BCH" buttons, Status indicators.
* [ ] **Wallet UI:** Balance display, Deposit QR, Transaction table.

**Day 4: Invoice System + Polish**
* [ ] **Invoice UI:** Create invoice form, Preview, QR code, Invoice list, Payment status badge, Share link.
* [ ] **Polish:** Loading spinners, Toast notifications, Error messages, Animations, Mobile check, Dark theme (optional).

### DEV B - Full-stack Bridge (Day 1-5)

**Day 1: Backend Setup**
* [ ] Initialize Node.js + Express + TypeScript.
* [ ] Setup Database (SQLite/PG) & Environment variables.
* [ ] **Schema:** Users, Offers, Trades, Invoices, Messages tables.
* [ ] **Auth:** Register/Login endpoints (JWT), Auth middleware, Password hashing.

**Day 2: Trading APIs**
* [ ] **Offers:** Create, Get (with filters), Get by ID, Delete endpoints.
* [ ] **Trades:** Initiate, Get details, Update status, Get user trades endpoints.
* [ ] **Real-time Chat:** Socket.io setup, Join room, Send/Receive, Store messages.

**Day 3: Smart Contracts**
* [ ] **CashScript Escrow:** Write simple 2-of-2 multisig contract.
* [ ] Functions: Deployment, Fund, Release, Refund (timeout).
* [ ] **Integration:** Create escrow on trade init, Monitor funding/release.

**Day 4: Wallet & Price APIs**
* [ ] **Wallet:** Generate address, Get balance, Create transaction, History, Validation.
* [ ] **Price Service:** Fetch from CoinGecko, Convert to fiats, Cache prices.

**Day 5: Frontend Integration**
* [ ] Connect all components to APIs.
* [ ] WebSocket integration for chat.
* [ ] Handle API errors gracefully.

### DEV C - Backend & Contracts (Day 1-5)

**Day 1: BCH Integration**
* [ ] Setup BCH node connection / Public APIs.
* [ ] HD wallet service, Address generation, Balance checking.
* [ ] Helper functions: UTXO fetching, Transaction builder, Fee estimation.

**Day 2: Invoice Backend**
* [ ] **Invoice APIs:** Create (generate unique address), Get by ID, List, Update status.
* [ ] **Payment Monitoring:** Monitor addresses, Webhook/Socket notification on payment.
* [ ] **QR Generation:** BCH address + amount → Base64/URL.

**Day 3: Smart Contract Assistance**
* [ ] Work with Dev B on contracts.
* [ ] Test contract on testnet.
* [ ] **Transaction Monitoring:** Listen for escrow funding/release, Update DB, Alert via WebSocket.

**Day 4: Advanced Features**
* [ ] **Fiat Exchange Rates:** Integrate APIs, Fallback logic.
* [ ] **Notification System:** Email service (SendGrid/Mailgun) for trade events & invoices.
* [ ] **Security:** Rate limiting, Input validation, SQLi/XSS prevention.

**Day 5: Testing & Deployment**
* [ ] Test critical endpoints, Escrow flow, and Invoice detection.
* [ ] Deploy backend & database.
* [ ] API Documentation.

---

## Database Schema (Simplified)

```sql
-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME
);

-- Offers
CREATE TABLE offers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    type TEXT, -- 'buy' or 'sell'
    amount_bch REAL,
    price REAL,
    fiat_currency TEXT, -- 'USD', 'INR', 'EUR'
    payment_method TEXT,
    min_limit REAL,
    max_limit REAL,
    status TEXT, -- 'active', 'inactive'
    created_at DATETIME
);

-- Trades
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    offer_id INTEGER,
    buyer_id INTEGER,
    seller_id INTEGER,
    amount_bch REAL,
    price REAL,
    fiat_currency TEXT,
    escrow_address TEXT,
    status TEXT, -- 'initiated', 'funded', 'paid', 'completed', 'disputed'
    created_at DATETIME
);

-- Invoices
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    amount_fiat REAL,
    fiat_currency TEXT,
    amount_bch REAL,
    payment_address TEXT,
    status TEXT, -- 'pending', 'paid'
    created_at DATETIME
);

---

## Daily Schedule

**Day 1 (Setup)**
* **Morning:** All devs setup projects, align on APIs.
* **Afternoon:** Dev A (Landing), Dev B (Backend + Auth), Dev C (BCH integration).
* **Evening:** Quick sync, test auth flow.

**Day 2 (Core Features)**
* **Morning:** Dev A (Marketplace UI), Dev B (Trading APIs), Dev C (Invoice backend).
* **Afternoon:** Continue features, start integration.
* **Evening:** Test offer creation and viewing.

**Day 3 (Trading + Contracts)**
* **Morning:** Dev A (Trade UI), Dev B (Smart contracts), Dev C (Contract assistance).
* **Afternoon:** Integration, escrow testing.
* **Evening:** End-to-end trade test on testnet.

**Day 4 (Invoice + Polish)**
* **Morning:** Dev A (Invoice UI), Dev B (Wallet APIs), Dev C (Payment monitoring).
* **Afternoon:** Full integration.
* **Evening:** Test complete user journey.

**Day 5 (Final Day)**
* **Morning:** Bug fixes, polish UI.
* **Afternoon:** Deploy, test production.
* **Evening:** Prepare demo, presentation.

---

## Hackathon Presentation Tips

**Demo Structure (5-7 mins)**
1.  **Problem (30s):** P2P trading is complex, no BCH focus, businesses need crypto invoicing.
2.  **Solution (30s):** Simple P2P platform with multi-fiat + invoicing.
3.  **Live Demo (4 mins):**
    * Show landing page & Create account.
    * Create sell offer.
    * Initiate trade (use test accounts).
    * Show escrow on blockchain.
    * Create and pay invoice.
4.  **Tech Stack (1 min):** Highlight smart contracts, BCH integration.
5.  **Future (30s):** Mobile app, more fiats, merchant API.

**Key Highlights**
* [x] Real BCH transactions (testnet/mainnet).
* [x] Smart contract escrow (trustless).
* [x] Multi-fiat support (easily add more).
* [x] Unique invoicing feature (business use case).
* [x] Clean UI/UX.

---

## Backup Plans

**If Smart Contracts are Too Complex:**
* Use simple multisig addresses instead.
* Manual escrow release by platform (centralized but works for demo).

**If BCH Integration is Hard:**
* Use testnet only.
* Mock blockchain calls with dummy data.
* Focus on UI/UX and flow.

**If Time is Short:**
* Drop wallet feature (just show escrow address).
* Simplify chat (just show payment instructions).
* Focus on ONE fiat (USD) instead of multi-fiat.

---

## Git Workflow (Fast)
* **Main branch** for stable code.
* Feature branches optional (time sensitive).
* Frequent commits and pushes.
* Quick code reviews via Discord/Slack.
* Deploy early (Day 3) to catch issues.

---

## Communication
* **Daily standup:** Morning (10 mins).
* **Quick syncs:** After each major feature.
* **Shared doc:** Track blockers and dependencies.
* **Demo dry-run:** Day 4 evening.
* **Tools:** GitHub, Discord/Slack, Figma (optional).

---

## Resources
* **BCH Testnet Faucet:** `https://tbch.googol.cash/`
* **CashScript Docs:** `https://cashscript.org/`
* **BCH Libraries:** `bitcoin-cash-js`, `bitcore-lib-cash`
* **Price APIs:** CoinGecko, CoinMarketCap
* **BCH Explorer:** `https://blockchair.com/bitcoin-cash`

---

## Judging Criteria Alignment
* **Innovation:** Invoice feature + multi-fiat is unique.
* **Technical Complexity:** Smart contracts + blockchain integration.
* **Usability:** Clean UI, simple flow.
* **Completeness:** Full working PoC.
* **Presentation:** Clear demo, strong pitch.