const Product = require('../models/product');

const Order = require('../models/order');

const cartContent = [];

exports.cartContent = cartContent;

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId
  Product.fetchOne(prodId, product => {

    res.render('shop/product-detail', {
      product: product,
      pageTitle: `${prodId} details`,
      path: `/products`
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  Product.fetchAll(products => {

    const cartProductsData = [];
    cartContent.forEach(cartElement => {
      const productData = products.find(product => product.id === cartElement.id);
      cartProductsData.push({
        ...productData,
        quantity: cartElement.quantity
      });
    });

    res.render('shop/cart', {
      prods: cartProductsData,
      path: '/cart',
      pageTitle: 'Your Cart'
    });
  });

};

exports.getOrders = (req, res, next) => {
  Order.fetchAll(orders => {
    res.render('shop/orders', {
      orders: orders,
      path: '/orders',
      pageTitle: 'Your Orders'
    });
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.postProductToCart = (req, res, next) => {
  const productId = req.body.productId
  const prodIdIndex = cartContent.findIndex(element => element.id === productId)
  if (prodIdIndex>-1) {
    //add quantity
    cartContent[prodIdIndex].quantity = parseInt(cartContent[prodIdIndex].quantity) + 1;
  } else {
    //add product
    cartContent.push({
      id: req.body.productId,
      quantity: 1
    });
  }
  res.redirect('/cart');
};


exports.deleteProductFromCart = (req, res, next) => {
  const productIdToRemove = req.body.productId;
  cartContent.splice(cartContent.findIndex(element => element.id === productIdToRemove),1);
  res.redirect('/cart');
};


exports.createOrder = (req, res, next) => {
  const orderContent = [];
  cartContent.forEach(element => orderContent.push({
    id: element.id,
    name: element.title,
    quantity: element.quantity
  }));
  const order = new Order(orderContent);
  order.save(() => {
    cartContent.splice(0,cartContent.length);
    res.redirect('/orders');
  });

};

exports.payOffOrder = (req, res, next) => {
  const orderId = req.body.orderNumber;
  Order.finalizePayment(orderId, () => {
    res.redirect('/orders');
  });
};

