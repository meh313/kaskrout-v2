const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { createSaleSchema } = require('../utils/validate');

const router = express.Router();

// Create new sale(s)
router.post('/', protect, async (req, res) => {
  try {
    const { items } = createSaleSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const salesData = [];
      let totalSaleValue = 0;

      // Process each item
      for (const item of items) {
        // Get product details
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const totalPrice = parseFloat(product.price) * item.quantity;
        totalSaleValue += totalPrice;

        // Create sale record
        const sale = await tx.sale.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: totalPrice,
          },
          include: {
            product: true,
          },
        });

        salesData.push(sale);
      }

      return { sales: salesData, totalSaleValue };
    });

    res.status(201).json({
      message: 'Sales recorded successfully',
      totalSaleValue: result.totalSaleValue,
      sales: result.sales,
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to record sale' });
  }
});

// Get sales with optional date filtering
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

        whereClause.saleTimestamp = {
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
          whereClause.saleTimestamp = {
            gte: startDate,
            lt: endDate,
          };
        }
      }
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: {
        saleTimestamp: 'desc',
      },
    });

    // Transform data to match frontend expectations
    const transformedSales = sales.map(sale => ({
      id: sale.id,
      product_id: sale.productId,
      product_name: sale.product.name,
      quantity: sale.quantity,
      total_price: sale.totalPrice,
      sale_timestamp: sale.saleTimestamp,
    }));

    res.json(transformedSales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;