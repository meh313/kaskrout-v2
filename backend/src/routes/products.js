const express = require('express');
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { createProductSchema, updateProductSchema } = require('../utils/validate');

const router = express.Router();

// Get all products
router.get('/', protect, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
router.post('/', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { name, category, price } = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: { name, category, price },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Product with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Product with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', protect, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product has sales
    const salesCount = await prisma.sale.count({
      where: { productId: parseInt(id) },
    });

    if (salesCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete product with existing sales records' 
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;