const { PAYPAL_API_BASE, getAccessToken } = require('./_lib/paypal');
const crypto = require('crypto');

const PRICE = { currency_code: 'USD', value: '0.99' };

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: PRICE }],
      }),
    });

    if (!response.ok) {
      console.error('PayPal create-order failed', response.status, await response.text());
      res.status(502).json({ error: 'Could not create PayPal order' });
      return;
    }

    const order = await response.json();
    res.status(200).json({ id: order.id });
  } catch (err) {
    console.error('paypal-create-order error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};
