const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { saveLeftoversSchema } = require('../utils/validate');

const router = express.Router();

// Get leftovers for a specific date
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const leftover = await prisma.dailyLeftover.findUnique({
      where: { recordDate: new Date(date) },
    });

    if (!leftover) {
      // Return default values if no record exists
      return res.json({
        record_date: date,
        bread_baguettes: 0,
        cooked_eggs: 0,
        salami_pieces: 0,
        notes: '',
      });
    }

    // Transform response to match frontend expectations
    res.json({
      record_date: leftover.recordDate.toISOString().split('T')[0],
      bread_baguettes: leftover.breadBaguettes,
      cooked_eggs: leftover.cookedEggs,
      salami_pieces: leftover.salamiPieces,
      notes: leftover.notes,
    });
  } catch (error) {
    console.error('Error fetching leftovers:', error);
    res.status(500).json({ error: 'Failed to fetch leftovers' });
  }
});

// Save or update leftovers for a specific date
router.post('/', protect, async (req, res) => {
  try {
    const { recordDate, breadBaguettes, cookedEggs, salamiPieces, notes } = 
      saveLeftoversSchema.parse(req.body);

    const date = new Date(recordDate);

    const leftover = await prisma.dailyLeftover.upsert({
      where: { recordDate: date },
      update: {
        breadBaguettes: breadBaguettes || 0,
        cookedEggs: cookedEggs || 0,
        salamiPieces: salamiPieces || 0,
        notes: notes || '',
      },
      create: {
        recordDate: date,
        breadBaguettes: breadBaguettes || 0,
        cookedEggs: cookedEggs || 0,
        salamiPieces: salamiPieces || 0,
        notes: notes || '',
      },
    });

    // Transform response
    res.json({
      message: 'Leftovers saved successfully',
      data: {
        record_date: leftover.recordDate.toISOString().split('T')[0],
        bread_baguettes: leftover.breadBaguettes,
        cooked_eggs: leftover.cookedEggs,
        salami_pieces: leftover.salamiPieces,
        notes: leftover.notes,
      },
    });
  } catch (error) {
    console.error('Error saving leftovers:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save leftovers' });
  }
});

module.exports = router;