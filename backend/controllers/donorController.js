const User = require('../models/User');

async function getDonors(req, res) {
  try {
    const { bloodType, city } = req.query || {};
    const query = { userType: 'donor' };
    if (bloodType) query.bloodType = bloodType;
    if (city) query.city = city;

    const donors = await User.find(query).select(
      'firstName lastName email phone bloodType city state pincode lastDonation createdAt'
    );

    const result = donors.map((d) => ({
      id: String(d._id),
      name: `${d.firstName} ${d.lastName}`.trim(),
      bloodType: d.bloodType,
      lastDonationDate: d.lastDonation ? new Date(d.lastDonation).toISOString() : undefined,
      contact: { email: d.email, phone: d.phone },
      address: { city: d.city, state: d.state, pincode: d.pincode },
      createdAt: d.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donors', error: err.message });
  }
}

module.exports = { getDonors };

