async function sendNotifications(req, res) {
  try {
    const { type, message, targets } = req.body || {};
    if (!type || !message || !Array.isArray(targets)) {
      return res.status(400).json({ message: 'type, message, and targets[] are required' });
    }

    const acceptedTypes = ['sms', 'email', 'push'];
    if (!acceptedTypes.includes(type)) {
      return res.status(400).json({ message: `Unsupported type: ${type}` });
    }

    const count = targets.length;
    res.json({ status: 'ok', queued: count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to trigger notifications', error: err.message });
  }
}

module.exports = { sendNotifications };

