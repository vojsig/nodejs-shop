const fs = require('fs');
const path = require('path');
const Product = require('./product');


const ordersPath = path.join(
  path.dirname(require.main.filename),
  'data',
  'orders.json'
);

const getOrdersFromFile = cb => {
  fs.readFile(ordersPath, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Order {
  constructor(productsData) {
    this.productsData = productsData;
  }

  save(cb) {
    this.number = Date.now();
    Product.fetchAll(products => {
      let total = 0;
      this.productsData.forEach((productData, index) => {
        const productInfo = products.find(product => product.id === productData.id);
        const price = productInfo.price;
        this.productsData[index].name = productInfo.title;
        const prodSum = parseInt(price*productData.quantity);
        this.productsData[index].sum = prodSum;
        total = total + prodSum;
      });
      this.total = total;
      let statusData = getOrderAndShouldPayOffStatus();
      this.shouldPayOff = statusData.payOffStatus;
      this.status = statusData.orderStatus;
      getOrdersFromFile(orders => {
        orders.push(this);
        fs.writeFile(ordersPath, JSON.stringify(orders), err => {
          if (err) {
            console.log(err);
          } 
          cb();
        });
      });
    });
  }

  static finalizePayment(orderId,cb) {
    //inject some payment popup etc
    //simulate payment accepted
    const paymentSucceeded = 1;
    if (paymentSucceeded) {
      getOrdersFromFile(orders => {
        const objIndex = orders.findIndex((obj => obj.number == orderId));
        const nextStatusData = getNextStatusData(orders[objIndex].status);
        orders[objIndex].status = nextStatusData.orderStatus;
        orders[objIndex].shouldPayOff = nextStatusData.payOffStatus;
        fs.writeFile(ordersPath, JSON.stringify(orders), err => {
          if (err) {
            console.log(err);
          } 
          cb();
        });
      });
    }
  }

  static fetchAll(cb) {
    getOrdersFromFile(cb);
  }

  static fetchOne(number, cb) {
    getOrdersFromFile(orders => {
      const order = orders.find(p => p.number === number);
      cb(order);
    });
  }

};

getOrderAndShouldPayOffStatus = () => {
  let orderStatus = "Payment unrealized";
  let payOffStatus = 1;
  return {
    orderStatus: orderStatus,
    payOffStatus: payOffStatus
  }
};

getNextStatusData = orderStatus => {
  if (orderStatus === "Payment unrealized") {
    return {
      orderStatus: "Shipping",
      payOffStatus: 0
    }
  } else if (orderStatus === "Shipping") {
    return {
      orderStatus: "Finalized",
      payOffStatus: 0
    }
  } else {
    return {
      orderStatus: "Unknown",
      payOffStatus: 0
    }
  }
};
