const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { 
  saveDailyConsumableUsageSchema, 
  updateDailyConsumableUsageSchema,
  saveDailyBaguettesSchema,
  saveDailyEarningsSchema 
} = require('../utils/validate');

const router = express.Router();

// Helper function to calculate used count and costs
const calculateUsedCount = (startCount, endCount) => Math.max(0, startCount - endCount);

const calculateConsumablesCost = async (recordDate) => {
  const usages = await prisma.dailyConsumableUsage.findMany({
    where: { recordDate: new Date(recordDate) },
    include: { consumable: true },
  });

  return usages.reduce((total, usage) => {
    return total + (usage.usedCount * parseFloat(usage.consumable.price));
  }, 0);
};

// ===============================
// DAILY CONSUMABLE USAGE ROUTES
// ===============================

// Get all consumable usage for a specific date
router.get('/consumables/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);

    const usages = await prisma.dailyConsumableUsage.findMany({
      where: { recordDate },
      include: { consumable: true },
      orderBy: { consumable: { name: 'asc' } },
    });

    res.json(usages);
  } catch (error) {
    console.error('Error fetching daily consumable usage:', error);
    res.status(500).json({ error: 'Failed to fetch daily consumable usage' });
  }
});

// Save/Update daily consumable usage
router.post('/consumables', protect, async (req, res) => {
  try {
    const { recordDate, consumableId, startCount, endCount } = 
      saveDailyConsumableUsageSchema.parse(req.body);

    const date = new Date(recordDate);
    const usedCount = calculateUsedCount(startCount, endCount);

    const usage = await prisma.dailyConsumableUsage.upsert({
      where: {
        recordDate_consumableId: {
          recordDate: date,
          consumableId,
        },
      },
      update: {
        startCount,
        endCount,
        usedCount,
      },
      create: {
        recordDate: date,
        consumableId,
        startCount,
        endCount,
        usedCount,
      },
      include: { consumable: true },
    });

    // Recalculate and update daily earnings
    await updateDailyEarningsAfterConsumableChange(recordDate);

    res.json(usage);
  } catch (error) {
    console.error('Error saving daily consumable usage:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save daily consumable usage' });
  }
});

// Update daily consumable usage
router.put('/consumables/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateDailyConsumableUsageSchema.parse(req.body);

    // If both startCount and endCount are provided, calculate usedCount
    if (updateData.startCount !== undefined && updateData.endCount !== undefined) {
      updateData.usedCount = calculateUsedCount(updateData.startCount, updateData.endCount);
    } else if (updateData.startCount !== undefined || updateData.endCount !== undefined) {
      // If only one is updated, fetch the current record to calculate usedCount
      const currentUsage = await prisma.dailyConsumableUsage.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!currentUsage) {
        return res.status(404).json({ error: 'Daily consumable usage not found' });
      }

      const newStartCount = updateData.startCount ?? currentUsage.startCount;
      const newEndCount = updateData.endCount ?? currentUsage.endCount;
      updateData.usedCount = calculateUsedCount(newStartCount, newEndCount);
    }

    const usage = await prisma.dailyConsumableUsage.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { consumable: true },
    });

    // Recalculate daily earnings
    const recordDate = usage.recordDate.toISOString().split('T')[0];
    await updateDailyEarningsAfterConsumableChange(recordDate);

    res.json(usage);
  } catch (error) {
    console.error('Error updating daily consumable usage:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Daily consumable usage not found' });
    }
    res.status(500).json({ error: 'Failed to update daily consumable usage' });
  }
});

// Delete daily consumable usage
router.delete('/consumables/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const usage = await prisma.dailyConsumableUsage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usage) {
      return res.status(404).json({ error: 'Daily consumable usage not found' });
    }

    await prisma.dailyConsumableUsage.delete({
      where: { id: parseInt(id) },
    });

    // Recalculate daily earnings
    const recordDate = usage.recordDate.toISOString().split('T')[0];
    await updateDailyEarningsAfterConsumableChange(recordDate);

    res.json({ message: 'Daily consumable usage deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily consumable usage:', error);
    res.status(500).json({ error: 'Failed to delete daily consumable usage' });
  }
});

// ===============================
// DAILY BAGUETTES ROUTES
// ===============================

// Get baguettes data for a specific date
router.get('/baguettes/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);

    const baguettes = await prisma.dailyBaguettes.findUnique({
      where: { recordDate },
    });

    if (!baguettes) {
      return res.json({
        recordDate: date,
        startCount: 0,
        endCount: 0,
        usedCount: 0,
      });
    }

    res.json(baguettes);
  } catch (error) {
    console.error('Error fetching daily baguettes:', error);
    res.status(500).json({ error: 'Failed to fetch daily baguettes' });
  }
});

// Save/Update daily baguettes
router.post('/baguettes', protect, async (req, res) => {
  try {
    const { recordDate, startCount, endCount } = saveDailyBaguettesSchema.parse(req.body);

    const date = new Date(recordDate);
    const usedCount = calculateUsedCount(startCount, endCount);

    const baguettes = await prisma.dailyBaguettes.upsert({
      where: { recordDate: date },
      update: {
        startCount,
        endCount,
        usedCount,
      },
      create: {
        recordDate: date,
        startCount,
        endCount,
        usedCount,
      },
    });

    res.json(baguettes);
  } catch (error) {
    console.error('Error saving daily baguettes:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save daily baguettes' });
  }
});

// ===============================
// DAILY EARNINGS ROUTES
// ===============================

// Get earnings data for a specific date
router.get('/earnings/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);

    const earnings = await prisma.dailyEarnings.findUnique({
      where: { recordDate },
    });

    if (!earnings) {
      return res.json({
        recordDate: date,
        totalEarnings: 0,
        consumablesCost: 0,
        netProfit: 0,
        notes: '',
      });
    }

    res.json(earnings);
  } catch (error) {
    console.error('Error fetching daily earnings:', error);
    res.status(500).json({ error: 'Failed to fetch daily earnings' });
  }
});

// Save/Update daily earnings
router.post('/earnings', protect, async (req, res) => {
  try {
    const { recordDate, totalEarnings, notes } = saveDailyEarningsSchema.parse(req.body);

    const date = new Date(recordDate);
    const consumablesCost = await calculateConsumablesCost(recordDate);
    const netProfit = totalEarnings - consumablesCost;

    const earnings = await prisma.dailyEarnings.upsert({
      where: { recordDate: date },
      update: {
        totalEarnings,
        consumablesCost,
        netProfit,
        notes: notes || '',
      },
      create: {
        recordDate: date,
        totalEarnings,
        consumablesCost,
        netProfit,
        notes: notes || '',
      },
    });

    res.json(earnings);
  } catch (error) {
    console.error('Error saving daily earnings:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save daily earnings' });
  }
});

// ===============================
// DASHBOARD SUMMARY ROUTE
// ===============================

// Get complete dashboard data for a specific date
router.get('/summary/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const recordDate = new Date(date);

    // Get all data in parallel
    const [consumableUsages, baguettes, earnings] = await Promise.all([
      prisma.dailyConsumableUsage.findMany({
        where: { recordDate },
        include: { consumable: true },
        orderBy: { consumable: { name: 'asc' } },
      }),
      prisma.dailyBaguettes.findUnique({ where: { recordDate } }),
      prisma.dailyEarnings.findUnique({ where: { recordDate } }),
    ]);

    // Calculate totals
    const totalConsumablesCost = consumableUsages.reduce((total, usage) => {
      return total + (usage.usedCount * parseFloat(usage.consumable.price));
    }, 0);

    const response = {
      date,
      consumables: consumableUsages,
      baguettes: baguettes || { recordDate: date, startCount: 0, endCount: 0, usedCount: 0 },
      earnings: earnings || { recordDate: date, totalEarnings: 0, consumablesCost: 0, netProfit: 0, notes: '' },
      summary: {
        totalConsumablesCost,
        totalConsumablesUsed: consumableUsages.reduce((total, usage) => total + usage.usedCount, 0),
        totalBaguettesUsed: baguettes?.usedCount || 0,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// ===============================
// HELPER FUNCTIONS
// ===============================

async function updateDailyEarningsAfterConsumableChange(recordDate) {
  try {
    // Recalculate consumables cost
    const consumablesCost = await calculateConsumablesCost(recordDate);
    
    // Get current earnings or create with 0 if not exists
    const currentEarnings = await prisma.dailyEarnings.findUnique({
      where: { recordDate: new Date(recordDate) },
    });

    const totalEarnings = currentEarnings?.totalEarnings || 0;
    const netProfit = totalEarnings - consumablesCost;

    await prisma.dailyEarnings.upsert({
      where: { recordDate: new Date(recordDate) },
      update: {
        consumablesCost,
        netProfit,
      },
      create: {
        recordDate: new Date(recordDate),
        totalEarnings: 0,
        consumablesCost,
        netProfit: -consumablesCost, // Negative if no earnings yet
        notes: '',
      },
    });
  } catch (error) {
    console.error('Error updating daily earnings after consumable change:', error);
  }
}

module.exports = router;