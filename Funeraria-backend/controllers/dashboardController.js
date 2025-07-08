const dashboardService = require('../services/dashboardService');

async function adminDashboard(req, res) {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Eroare dashboard admin', error: err.message });
  }
}

async function funeralHomeDashboard(req, res) {
  try {
    const funeralHomeId = req.user.funeralHomeId;
    const data = await dashboardService.getFuneralHomeDashboard(funeralHomeId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Eroare dashboard casă funerară', error: err.message });
  }
}

async function userDashboard(req, res) {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getUserDashboard(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Eroare dashboard user', error: err.message });
  }
}

module.exports = { adminDashboard, funeralHomeDashboard, userDashboard }; 