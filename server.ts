import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Middleware for JSON parsing, except for the webhook endpoint which needs raw body
app.use(express.json({
  verify: (req, res, buf) => {
    if ((req as express.Request).originalUrl.startsWith('/api/webhook')) {
      (req as any).rawBody = buf.toString();
    }
  }
}));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

// Create Order API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise for INR)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment API
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Webhook for Razorpay (Optional, for production robustness)
app.post('/api/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
  const signature = req.headers['x-razorpay-signature'] as string;

  try {
    const rawBody = (req as any).rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature === expectedSignature) {
      // Process webhook payload (e.g., payment.captured)
      console.log('Webhook valid:', req.body.event);
      // Here you would typically use Supabase Admin SDK to update order status
      res.status(200).send('OK');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook handling failed');
  }
});

// Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
