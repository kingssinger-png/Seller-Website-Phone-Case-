// 文件路径：/api/checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // 允许跨域请求（CORS）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { cart } = req.body;

      const lineItems = cart.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
      }));

      // 🚀 升级版创建 Session 逻辑
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        // 🌟 核心改变：让 Stripe 自动管理并启用你在后台开启的所有支付方式（含 Google/Apple Pay）
        // 这样可以完美避开因为单独指定 'card' 导致的账户限制报错
        automatic_payment_methods: {
          enabled: true,
        },
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("Stripe Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
