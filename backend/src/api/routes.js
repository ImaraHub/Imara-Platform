const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const projectController = require('./projects/projectController');
const teamController = require('./teams/teamController');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await authController.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
router.post('/auth/login/email', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authController.loginWithEmail(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/login/github', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await authController.loginWithGitHub(code);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/login/wallet', async (req, res) => {
  try {
    const { address, signature } = req.body;
    const result = await authController.loginWithWallet(address, signature);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Project routes
router.post('/projects', verifyToken, async (req, res) => {
  try {
    const project = await projectController.createProject(req.body, req.user.address);
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await projectController.getProject(parseInt(req.params.id));
    res.json(project);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/projects/:id/milestones', verifyToken, async (req, res) => {
  try {
    const milestone = await projectController.createMilestone(
      parseInt(req.params.id),
      req.body
    );
    res.json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/projects/:projectId/milestones/:milestoneId', verifyToken, async (req, res) => {
  try {
    const milestone = await projectController.updateMilestoneStatus(
      parseInt(req.params.projectId),
      parseInt(req.params.milestoneId),
      req.body.status
    );
    res.json(milestone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Team routes
router.post('/teams', verifyToken, async (req, res) => {
  try {
    const team = await teamController.createTeam(req.body, req.user.address);
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/teams/match', verifyToken, async (req, res) => {
  try {
    const matches = await teamController.findMatchingTeams(req.query);
    res.json(matches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/teams/:id/members', verifyToken, async (req, res) => {
  try {
    const { memberAddress, role } = req.body;
    const team = await teamController.addTeamMember(
      parseInt(req.params.id),
      memberAddress,
      role
    );
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/teams/:id/reputation', verifyToken, async (req, res) => {
  try {
    const { points } = req.body;
    const team = await teamController.updateTeamReputation(
      parseInt(req.params.id),
      points
    );
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 