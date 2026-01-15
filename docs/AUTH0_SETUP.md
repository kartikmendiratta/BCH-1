# Auth0 Integration Guide

## Setup Steps

### 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create new **Single Page Application**
3. Note your **Domain** and **Client ID**

### 2. Configure Auth0 Application

**Allowed Callback URLs:**
```
http://localhost:5173/dashboard
```

**Allowed Logout URLs:**
```
http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5173
```

### 3. Create Auth0 API

1. Go to APIs in Auth0 Dashboard
2. Create new API
3. Set **Identifier** (e.g., `https://bch-p2p-api`)
4. Note the **API Identifier**

### 4. Update Environment Variables

**Frontend (.env):**
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=https://bch-p2p-api
```

**Backend (.env):**
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://bch-p2p-api
```

### 5. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend  
cd backend
npm install
```

### 6. Run Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

## What Changed

✅ **Removed custom auth:**
- No more login/register pages
- No password handling
- No JWT generation

✅ **Added Auth0:**
- Hosted authentication
- Secure token validation
- User management

✅ **Benefits:**
- Professional login UI
- Social logins ready
- MFA support
- Better security

## Testing

1. Visit `http://localhost:5173`
2. Click "Get Started" → Auth0 login
3. Register/login with email
4. Redirected to dashboard

No passwords to manage! 🎉