# QueueSaaS — E-commerce Queue System

A MicroSaaS application for processing e-commerce orders asynchronously using **BullMQ + Redis**, storing them in **MongoDB**, and visualizing metrics in a **React + Tailwind** dashboard.

## 📁 Project Structure

```
Nueva/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts          # MongoDB connection
│   │   │   ├── redis.ts       # IORedis connection
│   │   │   └── queue.ts       # BullMQ Queue setup
│   │   ├── models/
│   │   │   └── order.model.ts # Mongoose Order schema
│   │   ├── routes/
│   │   │   └── orders.routes.ts # REST API endpoints
│   │   ├── server.ts          # Express API entry point
│   │   └── worker.ts          # BullMQ Worker (runs separately)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── KPICards.tsx     # KPI metric cards
    │   │   ├── SalesChart.tsx   # Recharts composed chart
    │   │   └── OrdersTable.tsx  # Orders list table
    │   ├── pages/
    │   │   └── Dashboard.tsx    # Main dashboard page
    │   ├── services/
    │   │   └── api.ts           # Axios API client
    │   ├── types/
    │   │   └── index.ts         # TypeScript types
    │   ├── utils/
    │   │   └── exportExcel.ts   # ExcelJS export utility
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local: `redis-server` or Docker: `docker run -p 6379:6379 redis`)

### 1. Backend

```bash
cd backend
cp .env.example .env    # edit with your MongoDB/Redis URIs
npm install
npm run dev             # Start API server on :4000
```

In a separate terminal:
```bash
cd backend
npm run worker          # Start the BullMQ worker
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # Start Vite dev server on :5173
```

Open [http://localhost:5173](http://localhost:5173)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Enqueue a new order |
| `GET` | `/api/orders` | List orders (paginated) |
| `GET` | `/api/orders/kpis` | Dashboard KPIs |
| `GET` | `/api/orders/chart` | 30-day sales trend |
| `GET` | `/api/orders/export` | Export dataset (filterable) |

### Example: Enqueue an Order

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-001",
    "customer": "John Doe",
    "total": 149.99,
    "date": "2024-03-25T10:00:00Z",
    "products": [
      { "productId": "P1", "name": "Wireless Headphones", "quantity": 1, "price": 149.99 }
    ]
  }'
```

## ✨ Features

- **Async Queue**: Orders are instantly acknowledged (HTTP 202) and processed in the background.
- **Retry Logic**: Failed jobs retry up to 3× with exponential backoff.
- **Live Dashboard**: Auto-refreshes every 15 seconds.
- **Sales Chart**: Composed chart (area + bar) showing 30-day revenue and order volume.
- **KPI Cards**: Total orders, today's revenue, pending queue size, today's count.
- **Excel Export**: Styled workbook with filters (date range + status).
