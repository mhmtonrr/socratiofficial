# Socratiofficial

A luxury fashion e-commerce platform built with Next.js 14, Prisma, PostgreSQL, and integrated with PayFast, Peach Payments, and HappyPay.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL 16 (via Docker) |
| ORM | Prisma 5 |
| Auth | NextAuth.js |
| Payments | PayFast · Peach Payments · HappyPay |
| Images | Cloudinary |
| Address Autocomplete | Google Maps Places API |
| Styling | Tailwind CSS |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- [ngrok](https://ngrok.com/) (for payment webhooks during local dev)

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/socratiofficial.git
cd socratiofficial
npm install
```

---

## 2. Environment Variables

Create `.env.local` in the project root (never commit this file):

```env
# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="postgresql://socrati:socrati_dev_password@localhost:5432/socratiofficial"

# =============================================================================
# NEXTAUTH
# =============================================================================
NEXTAUTH_SECRET="your-long-random-secret"      # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# =============================================================================
# CLOUDINARY  (image uploads)
# https://cloudinary.com/console
# =============================================================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# =============================================================================
# PAYFAST  (payment gateway — redirect-based)
# https://developers.payfast.co.za/api
# Sandbox credentials: https://sandbox.payfast.co.za
# =============================================================================
PAYFAST_MERCHANT_ID="your-merchant-id"
PAYFAST_MERCHANT_KEY="your-merchant-key"
PAYFAST_PASSPHRASE="your-passphrase"
PAYFAST_SANDBOX="true"           # set to "false" for production

# =============================================================================
# PEACH PAYMENTS  (payment gateway — embedded checkout)
# https://sandbox-dashboard.peachpayments.com
# =============================================================================
PEACH_SANDBOX="true"             # set to "false" for production
PEACH_CLIENT_ID="your-client-id"
PEACH_CLIENT_SECRET="your-client-secret"
PEACH_MERCHANT_ID="your-merchant-id"
NEXT_PUBLIC_PEACH_ENTITY_ID="your-entity-id"   # safe to expose — used by the browser SDK

# =============================================================================
# APP URL
# For payment webhooks (PayFast ITN, Peach notify) you need a public URL.
# Locally: run `ngrok http 3000` and paste the https URL here.
# =============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"     # replace with ngrok URL for webhook testing

# =============================================================================
# GOOGLE MAPS  (address autocomplete on checkout)
# https://console.cloud.google.com  — enable Maps JavaScript API + Places API
# =============================================================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

---

## 3. Start the Database

```bash
# Start a PostgreSQL 16 container
docker run \
  --name socratiofficial-postgres \
  -e POSTGRES_USER=socrati \
  -e POSTGRES_PASSWORD=socrati_dev_password \
  -e POSTGRES_DB=socratiofficial \
  -p 5432:5432 \
  -d postgres:16
```

To stop/start it later:
```bash
docker stop socratiofficial-postgres
docker start socratiofficial-postgres
```

---

## 4. Run Migrations

```bash
npx prisma migrate dev
```

This creates all tables from `prisma/schema.prisma`.

---

## 5. Seed the Database

Seeds categories, products, variants, and a default admin user:

```bash
npx prisma db seed
```

**Default admin credentials:**
| Field | Value |
|---|---|
| Email | `admin@socrati.com` |
| Password | `admin123` |

> ⚠️ Change the admin password after first login in production.

The seed creates:
- **Categories**: Women (Heels, Boots, Sneakers, Loafers, Sandals, Handbags, Totes, Wallets, Jewelry) · Men (Classic, Boots, Sneakers, Loafers, Backpacks, Briefcases, Wallets, Belts)
- **9 products** with full variants and stock

To re-seed (wipes products/categories first):
```bash
npx prisma db seed
```

---

## 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| URL | Description |
|---|---|
| `/` | Homepage |
| `/shop` | Product listing |
| `/cart` | Shopping cart |
| `/payment` | Checkout (PayFast + Peach Payments) |
| `/account` | Customer account |
| `/admin` | Admin dashboard |
| `/admin/orders` | Order management |
| `/admin/payments` | Payment transactions |
| `/admin/products` | Product management |
| `/admin/users` | User management |

---

## 7. Payment Webhooks (Local Testing)

PayFast and Peach Payments need to call back to your server after a transaction. Locally you need a public URL.

```bash
# Install ngrok globally if needed
npm install -g ngrok

# Expose local port 3000
ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL and set it in `.env.local`:
```env
NEXT_PUBLIC_APP_URL="https://xxxx.ngrok.io"
```

Webhook endpoints:
| Provider | Endpoint |
|---|---|
| PayFast ITN | `POST /api/payfast/notify` |
| Peach notify | `POST /api/peach/notify` |

Also allowlist your ngrok domain in the **Peach Payments dashboard** (required for the embedded checkout to create sessions).

---

## 8. Useful Prisma Commands

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Apply a new migration after schema changes
npx prisma migrate dev --name your-migration-name

# Reset DB and re-seed (⚠️ destroys all data)
npx prisma migrate reset

# Regenerate Prisma Client after schema changes
npx prisma generate
```

---

## Payment Integrations

### PayFast
- Redirect-based checkout
- Sandbox: [sandbox.payfast.co.za](https://sandbox.payfast.co.za)
- ITN (Instant Transaction Notification) at `/api/payfast/notify`
- Set `PAYFAST_SANDBOX="false"` for production

### Peach Payments
- Embedded checkout (no redirect, inline on the checkout page)
- Supports: Card, Apple Pay, Samsung Pay, SnapScan
- Sandbox dashboard: [sandbox-dashboard.peachpayments.com](https://sandbox-dashboard.peachpayments.com)
- Webhook at `/api/peach/notify`
- Set `PEACH_SANDBOX="false"` for production

### HappyPay
- Buy Now Pay Later widget (informational only — actual payment processed by HappyPay at checkout)
- Shown on product pages and checkout

---

## Project Structure

```
app/
├── admin/           # Admin dashboard pages
├── api/
│   ├── admin/       # Admin data APIs
│   ├── orders/      # PayFast + Peach order initiation
│   ├── payfast/     # PayFast ITN webhook
│   └── peach/       # Peach notify webhook
├── components/      # Shared UI components
├── payment/         # Checkout page
└── ...

lib/
├── auth.ts          # NextAuth config
├── payfast.ts       # PayFast helper
├── peach.ts         # Peach Payments helper
└── prisma.ts        # Prisma client singleton

prisma/
├── schema.prisma    # Database schema
├── seed.ts          # Seed script
└── migrations/      # Migration history

context/
└── CartContext.tsx  # Cart state (localStorage persistent)
```
