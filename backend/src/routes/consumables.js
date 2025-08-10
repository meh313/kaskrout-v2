const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { createConsumableSchema, updateConsumableSchema } = require('../utils/validate');

const router = express.Router();

// Get all consumables (with prices)
router.get('/', protect, async (req, res) => {
  try {
    const consumables = await prisma.consumable.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(consumables);
  } catch (error) {
    console.error('Error fetching consumables:', error);
    res.status(500).json({ error: 'Failed to fetch consumables' });
  }
});

// Create new consumable
router.post('/', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { name, price } = createConsumableSchema.parse(req.body);

    const consumable = await prisma.consumable.create({
      data: { name, price },
    });

    res.status(201).json(consumable);
  } catch (error) {
    console.error('Error creating consumable:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Consumable with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create consumable' });
  }
});

// Update consumable
router.put('/:id', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateConsumableSchema.parse(req.body);

    const consumable = await prisma.consumable.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(consumable);
  } catch (error) {
    console.error('Error updating consumable:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consumable not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Consumable with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update consumable' });
  }
});

// Delete consumable
router.delete('/:id', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if consumable has daily usage records
    const usageCount = await prisma.dailyConsumableUsage.count({
      where: { consumableId: parseInt(id) },
    });

    if (usageCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete consumable with existing usage records' 
      });
    }

    await prisma.consumable.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Consumable deleted successfully' });
  } catch (error) {
    console.error('Error deleting consumable:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consumable not found' });
    }
    res.status(500).json({ error: 'Failed to delete consumable' });
  }
});

module.exports = router;