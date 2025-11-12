const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtp(req, res) {
  try {
    const { email, phone } = req.body || {};
    const key = email || phone;
    if (!key) return res.status(400).json({ message: 'email or phone is required' });
    const otp = generateOtp();
    otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.json({ status: 'sent', delivery: email ? 'email' : 'sms' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, phone, otp } = req.body || {};
    const key = email || phone;
    const record = key ? otpStore.get(key) : null;
    if (!record) return res.status(400).json({ message: 'No OTP requested' });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    if (String(record.otp) !== String(otp)) return res.status(400).json({ message: 'Invalid OTP' });
    otpStore.delete(key);
    res.json({ status: 'verified' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
  }
}

module.exports = { sendOtp, verifyOtp };

