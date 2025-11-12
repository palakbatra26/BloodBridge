const User = require('../models/User');

function isEligibleByLastDonation(lastDonation) {
  if (!lastDonation) return true;
  const MIN_DAYS = 56;
  const last = new Date(lastDonation);
  const now = new Date();
  const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return days >= MIN_DAYS;
}

function bloodTypeCompatible(donorType, requestType) {
  const compat = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  };
  return (compat[donorType] || []).includes(requestType);
}

async function sendSOS(req, res) {
  try {
    const { bloodType, unitsNeeded, city } = req.body || {};
    if (!bloodType || !unitsNeeded) {
      return res.status(400).json({ message: 'bloodType and unitsNeeded are required' });
    }

    const query = { userType: 'donor' };
    if (city) query.city = city;

    const donors = await User.find(query).select(
      'firstName lastName email phone bloodType city state pincode lastDonation createdAt'
    );

    const eligibleTargets = donors
      .filter((d) => bloodTypeCompatible(d.bloodType, bloodType))
      .filter((d) => isEligibleByLastDonation(d.lastDonation))
      .map((d) => ({
        id: String(d._id),
        name: `${d.firstName} ${d.lastName}`.trim(),
        bloodType: d.bloodType,
        contact: { email: d.email, phone: d.phone },
        address: { city: d.city, state: d.state, pincode: d.pincode },
      }));

    const suggestedCount = Math.min(eligibleTargets.length, unitsNeeded * 3);
    const targets = eligibleTargets.slice(0, suggestedCount);

    res.json({
      status: 'queued',
      message: 'SOS targets identified',
      targets,
      totalEligible: eligibleTargets.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process SOS', error: err.message });
  }
}

module.exports = { sendSOS };

