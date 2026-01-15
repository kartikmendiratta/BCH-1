# Frontend Documentation

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS
- Zustand (state)
- Socket.io-client
- React Router v6

---

## Design System (Monochromatic)

### Color Palette
```css
/* Base Colors */
--bg-primary: #0a0a0a;      /* Main background */
--bg-secondary: #141414;    /* Cards, sections */
--bg-tertiary: #1f1f1f;     /* Inputs, hover states */

--text-primary: #ffffff;    /* Headings */
--text-secondary: #a3a3a3;  /* Body text */
--text-muted: #525252;      /* Placeholders */

--border: #262626;          /* Borders */
--border-hover: #404040;    /* Hover borders */

/* Accent (BCH Green - use sparingly) */
--accent: #0ac18e;
--accent-hover: #0bd69e;
```

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1f1f1f',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a3a3a3',
          muted: '#525252',
        },
        border: '#262626',
        accent: '#0ac18e',
      }
    }
  }
}
```

---

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # Buttons, Inputs, Cards
│   │   ├── layout/        # Header, Sidebar, Footer
│   │   └── shared/        # Modals, Loaders, Toasts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Trade.tsx
│   │   ├── Wallet.tsx
│   │   └── Invoice.tsx
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom hooks
│   ├── services/          # API calls
│   ├── types/             # TypeScript types
│   └── utils/             # Helpers
├── public/
└── index.html
```

---

## Pages Overview

### 1. Landing Page
- Hero with tagline
- 3 feature cards
- How it works (3 steps)
- CTA button

### 2. Auth Pages
- Login form (email + password)
- Register form (email + password + confirm)
- Simple validation

### 3. Dashboard
- Overview stats (balance, active trades, pending invoices)
- Recent activity list
- Quick actions

### 4. Marketplace
- Filter bar (Buy/Sell, Fiat currency)
- Offer cards grid
- Create offer modal

### 5. Trade Page
- Trade details card
- Chat box
- Action buttons (Mark Paid / Release)
- Status timeline

### 6. Wallet
- Balance display
- Deposit address + QR
- Transaction history table

### 7. Invoice
- Create invoice form
- Invoice list
- Invoice detail with QR
- Share link

---

## Component Examples

### Button Component
```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const base = "font-medium rounded-lg transition-colors";
  
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-bg-tertiary text-white border border-border hover:border-border-hover",
    ghost: "text-text-secondary hover:text-white hover:bg-bg-tertiary"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}
```

### Card Component
```tsx
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-bg-secondary border border-border rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
```

### Input Component
```tsx
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-text-secondary">{label}</label>}
      <input
        className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 
                   text-white placeholder:text-text-muted
                   focus:outline-none focus:border-white transition-colors"
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
```

---

## State Management (Zustand)

### Auth Store
```tsx
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
```

---

## API Service
```tsx
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Routes
```tsx
// App.tsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/marketplace" element={<Marketplace />} />
    <Route path="/trade/:id" element={<Trade />} />
    <Route path="/wallet" element={<Wallet />} />
    <Route path="/invoices" element={<InvoiceList />} />
    <Route path="/invoice/:id" element={<InvoiceDetail />} />
  </Route>
</Routes>
```

---

## Setup Commands
```bash
# Create project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install react-router-dom zustand axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run dev server
npm run dev
```

---

## Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```
