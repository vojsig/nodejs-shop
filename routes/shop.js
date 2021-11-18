const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// : means thats dynamic parameter
router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

// /cart => POST
router.post('/cart', shopController.postProductToCart);

// /cart-pop => POST
router.post('/cart-pop', shopController.deleteProductFromCart);

// /cart => POST
router.post('/create-order', shopController.createOrder);

// /payoff => POST
router.post('/payoff', shopController.payOffOrder);



module.exports = router;
