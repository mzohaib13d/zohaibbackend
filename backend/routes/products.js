import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

// Product validation
const productValidation = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Product name is required')
    .trim(),
  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long')
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'])
    .withMessage('Please select a valid category')
];

// All product routes require authentication
router.use(authenticate);

router.post('/', productValidation, createProduct);
router.get('/', getProducts);
router.put('/:id', productValidation, updateProduct);
router.delete('/:id', deleteProduct);

export default router;