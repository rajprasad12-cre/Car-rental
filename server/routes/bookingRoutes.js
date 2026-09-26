import express from "express";
import { changeBookingsStatus, checkAvailabilityOfCar, createPaymentOrder, getOwnerBookings, getUserBookings, verifyPayment } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";


const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar)
bookingRouter.post('/create-order', protect, createPaymentOrder)
bookingRouter.post('/verify-payment' , protect , verifyPayment)
bookingRouter.get('/user', protect, getUserBookings)
bookingRouter.get('/owner', protect, getOwnerBookings)
bookingRouter.post('/change-status', protect, changeBookingsStatus)

export default bookingRouter;