const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { createExpenseSchema } = require('../utils/validate');

const router = express.Router();

// Create new expense
router.post('/', protect, async (req, res) => {
  try {
    const { type, amount, description, expenseDate } = createExpenseSchema.parse(req.body);

    // Use provided date or default to today
    const date = expenseDate ? new Date(expenseDate) : new Date();

    const expense = await prisma.expense.create({
      data: {
        type,
        amount,
        description,
        expenseDate: date,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Get expenses with optional date filtering
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    let whereClause = {};

    if (date) {
      if (date === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        whereClause.expenseDate = {
          gte: today,
          lt: tomorrow,
        };
      } else {
        // Handle YYYY-MM-DD, YYYY-MM, or YYYY format
        const dateParts = date.split('-').map(p => parseInt(p, 10));
        let startDate, endDate;

        if (dateParts.length === 3) { // YYYY-MM-DD
          startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
        } else if (dateParts.length === 2) { // YYYY-MM
          startDate = new Date(dateParts[0], dateParts[1] - 1, 1);
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 1);
        } else if (dateParts.length === 1 && date.length === 4) { // YYYY
          startDate = new Date(dateParts[0], 0, 1);
          endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + 1);
        }

        if (startDate && endDate) {
          whereClause.expenseDate = {
            gte: startDate,
            lt: endDate,
          };
        }
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        expenseDate: 'desc',
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

module.exports = router;