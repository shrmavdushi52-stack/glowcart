import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Initialize a variable, but only instantiate it when keys are guaranteed to be loaded
let razorpay;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay API keys are missing from the environment configuration!");
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// @route POST /api/payment/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const rzp = getRazorpayInstance(); // Safely fetch the instance here

    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Razorpay order generation failed', error: error.message });
  }
};

// @route POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const newOrder = await Order.create({
        ...orderDetails,
        userId: req.user.id, 
        paymentStatus: 'Completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      return res.status(201).json({ success: true, message: "Payment verified, order placed!", orderId: newOrder._id });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error during verification", error: error.message });
  }
};

// @route POST /api/payment/cod
export const placeCODOrder = async (req, res) => {
  try {
    const { orderDetails } = req.body;
    
    const newOrder = await Order.create({
      ...orderDetails,
      userId: req.user.id,
      paymentMethod: 'COD',
      paymentStatus: 'Pending'
    });

    res.status(201).json({ success: true, message: 'COD Order placed successfully!', orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place COD order', error: error.message });
  }
};