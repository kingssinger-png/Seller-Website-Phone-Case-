// 文件路径：/api/checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { cart } = req.body;

      const lineItems = cart.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
