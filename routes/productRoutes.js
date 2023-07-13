const express = require('express');
const { createProduct, getAllProducts, getSingleProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');

const {upload} = require('../utils/fileUpload')

const router = express.Router();

router.post('/',protect,upload.single('image'),createProduct)
router.get('/',protect,getAllProducts)
router.get('/:id',protect,getSingleProduct)
router.delete('/:id',protect,deleteProduct)
router.patch('/:id',protect,upload.single('image'),updateProduct)







module.exports= router;