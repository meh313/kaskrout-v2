const { z } = require('zod');

// Auth validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  password: z.string().min(6),
  role: z.enum(['user', 'vip', 'admin']).optional().default('user'),
});

const loginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6).optional(),
});

// Product validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().optional(),
  price: z.number().positive(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
});

// Consumable validation schemas
const createConsumableSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
});

const updateConsumableSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
});

// Daily consumable usage validation schemas
const saveDailyConsumableUsageSchema = z.object({
  recordDate: z.string(),
  consumableId: z.number().int().positive(),
  startCount: z.number().int().nonnegative(),
  endCount: z.number().int().nonnegative(),
});

const updateDailyConsumableUsageSchema = z.object({
  startCount: z.number().int().nonnegative().optional(),
  endCount: z.number().int().nonnegative().optional(),
});

// Daily baguettes validation schemas
const saveDailyBaguettesSchema = z.object({
  recordDate: z.string(),
  startCount: z.number().int().nonnegative(),
  endCount: z.number().int().nonnegative(),
});

// Daily earnings validation schemas
const saveDailyEarningsSchema = z.object({
  recordDate: z.string(),
  totalEarnings: z.number().nonnegative(),
  notes: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createProductSchema,
  updateProductSchema,
  createConsumableSchema,
  updateConsumableSchema,
  saveDailyConsumableUsageSchema,
  updateDailyConsumableUsageSchema,
  saveDailyBaguettesSchema,
  saveDailyEarningsSchema,
};