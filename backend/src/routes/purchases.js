const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { createPurchaseSchema } = require('../utils/validate');

const router = express.Router();

// Create new purchase and update stock
router.post('/', protect, async (req, res) => {
  try {
    const { consumableId, quantity, cost, purchaseDate } = createPurchaseSchema.parse(req.body);

    // Use provided date or default to today
    const date = purchaseDate ? new Date(purchaseDate) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          consumableId,
          quantity,
          cost,
          purchaseDate: date,
        },
        include: {
          consumable: true,
        },
      });

      // Update consumable stock
      await tx.consumable.update({
        where: { id: consumableId },
        data: {
          currentStock: {
            increment: quantity,
          },
        },
      });

      return purchase;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating purchase:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Consumable not found' });
    }
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Get all purchases
router.get('/', protect, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        consumable: true,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    // Transform data to match frontend expectations
    const transformedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      consumable_id: purchase.consumableId,
      consumable_name: purchase.consumable.name,
      quantity: purchase.quantity,
      cost: purchase.cost,
      purchase_date: purchase.purchaseDate,
    }));

    res.json(transformedPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

module.exports = router;