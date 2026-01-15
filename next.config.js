const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig