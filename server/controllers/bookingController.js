import Booking from "../models/Bookings.js"
import Car from "../models/Car.js";
import crypto from "node:crypto";
import Razorpay from "razorpay";

const getRazorpay = () => new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})


// Function to check Availability of Car for a given date
const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0;
}

// API to check Availability of cars for given Date and location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location, pickupDate,returnDate} = req.body

        // fetch all available cars for the given location
        const cars = await Car.find({location, isAvailable: true})

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car)=>{
           const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
           return {...car._doc, isAvailable: isAvailable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Create Booking
export const createBooking = async (req, res)=>{
    try {
        const{_id} = req.user;
        const {car, pickupDate, returnDate} = req.body;

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: "Car is not available"})
        }

        const carData = await Car.findById(car)
        if (!carData) {
            return res.json({success: false, message: "Car not found"})
        }
        
        // Calculate price based on pickupdate and returndate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price})

        res.json({success: true, message: "Booking Created"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Create a Razorpay order without creating a booking yet.
export const createPaymentOrder = async (req, res)=>{
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.json({success: false, message: "Razorpay is not configured"})
        }

        const {_id} = req.user
        const {car, pickupDate, returnDate} = req.body
        const {price} = await getBookingDetails(car, pickupDate, returnDate)
        const order = await getRazorpay().orders.create({
            amount: Math.round(price * 100),
            currency: process.env.RAZORPAY_CURRENCY || "INR",
            receipt: `booking_${Date.now()}`,
            notes: {carId: car, pickupDate, returnDate, userId: _id.toString()},
        })

        res.json({success: true, order, keyId: process.env.RAZORPAY_KEY_ID})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to List User Bookings
export const getUserBookings = async (req, res)=>{
    try {
      const {_id} = req.user;  
      const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
      res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}) 
    }
}

// API to get Owner Bookings

export const getOwnerBookings = async (req, res)=>{
    try {
         if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id}).populate('car user').select("-user.password").sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}) 
    }
}

// API to verify payment status
export const verifyPayment = async (req, res)=>{
    try {
        const {_id} = req.user
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({success: false, message: "Payment details are required"})
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")
        if (expectedSignature !== razorpay_signature) {
            return res.json({success: false, message: "Invalid payment signature"})
        }

        const existingBooking = await Booking.findOne({razorpayPaymentId: razorpay_payment_id})
        if (existingBooking) {
            return res.json({success: true, message: "Payment already verified", booking: existingBooking})
        }

        const order = await getRazorpay().orders.fetch(razorpay_order_id)
        const {carId, pickupDate, returnDate, userId} = order.notes || {}
        if (userId !== _id.toString() || order.status !== "paid") {
            return res.json({success: false, message: "Payment order could not be verified"})
        }

        const {carData, price} = await getBookingDetails(carId, pickupDate, returnDate)
        if (order.amount !== Math.round(price * 100)) {
            return res.json({success: false, message: "Payment amount does not match booking total"})
        }

        const booking = await Booking.create({
            car: carId,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            isPaid: true,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        })

        res.json({success: true, message: "Payment verified and booking created", booking})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}) 
    }
}

//API to change booking status
export const changeBookingsStatus = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body

        const booking = await Booking.findById(bookingId)

        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized"})
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message}) 
    }
}

const getBookingDetails = async (car, pickupDate, returnDate)=>{
    const picked = new Date(pickupDate)
    const returned = new Date(returnDate)

    if (Number.isNaN(picked.getTime()) || Number.isNaN(returned.getTime()) || returned <= picked) {
        throw new Error("Return date must be after pickup date")
    }

    if (!await checkAvailability(car, pickupDate, returnDate)) {
        throw new Error("Car is not available")
    }

    const carData = await Car.findById(car)
    if (!carData) {
        throw new Error("Car not found")
    }

    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
    return {carData, price: carData.pricePerDay * noOfDays}
}