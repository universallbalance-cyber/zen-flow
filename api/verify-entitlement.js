const { verifyToken } = require('./_lib/token');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let token;
  try {
    token = req.body && req.body.token;
  } catch {
    token = undefined;
  }

  const payload = verifyToken(token);
  res.status(200).json({ valid: Boolean(payload && payload.entitled) });
};
