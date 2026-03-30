const http = require('http');

const orders = [
  {
    orderId: `AUTO-${Date.now()}-1`,
    customer: "Ana Gomez",
    total: 120.50,
    date: new Date().toISOString(),
    products: [{ productId: "A1", name: "Mouse", quantity: 1, price: 120.50 }]
  },
  {
    orderId: `AUTO-${Date.now()}-2`,
    customer: "Luis Martinez",
    total: 890.00,
    date: new Date().toISOString(),
    products: [{ productId: "B2", name: "Laptop", quantity: 1, price: 890.00 }]
  },
  {
    orderId: `AUTO-${Date.now()}-3`,
    customer: "Sofia Rojas",
    total: 45.00,
    date: new Date().toISOString(),
    products: [{ productId: "C3", name: "Cable USB-C", quantity: 3, price: 15.00 }]
  }
];

function sendOrder(order) {
  const data = JSON.stringify(order);

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      console.log(`✅ Status: ${res.statusCode} | Guardado:`, JSON.parse(responseData).orderId);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error enviando pedido:', error.message);
  });

  req.write(data);
  req.end();
}

console.log("🚀 Enviando 3 pedidos de prueba automáticamente...");
orders.forEach((o, i) => setTimeout(() => sendOrder(o), i * 500));
