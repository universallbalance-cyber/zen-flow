const { PAYPAL_API_BASE, getAccessToken } = require('./_lib/paypal');
const { signToken } = require('./_lib/token');

const EXPECTED_VALUE = '0.99';
const EXPECTED_CURRENCY = 'USD';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let orderID;
  try {
    orderID = req.body && req.body.orderID;
  } catch {
    orderID = undefined;
  }
  if (typeof orderID !== 'string' || !orderID.trim()) {
    res.status(400).json({ error: 'orderID is required' });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('PayPal capture failed', response.status, await response.text());
      res.status(502).json({ error: 'Could not capture PayPal order' });
      return;
    }

    const order = await response.json();
    const capture = order?.purchase_units?.[0]?.payments?.captures?.[0];

    const isPaid =
      capture &&
      capture.status === 'COMPLETED' &&
      capture.amount?.value === EXPECTED_VALUE &&
      capture.amount?.currency_code === EXPECTED_CURRENCY;

    if (!isPaid) {
      console.error('PayPal capture did not match expected payment', JSON.stringify(order));
      res.status(402).json({ error: 'Payment not completed' });
      return;
    }

    const token = signToken({ entitled: true, orderId: orderID, iat: Date.now() });
    res.status(200).json({ token });
  } catch (err) {
    console.error('paypal-capture-order error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};
