import imagekit from "../configs/imageKit.js";
import Booking from "../models/Bookings.js";
import User from "../models/User.js";
import fs from "fs";
import Car from "../models/Car.js";
import path from "path";

// API to Change Role of User
export const changeRoleToOwner = async (req, res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: "owner"})
        res.json({success: true, message: "Now you can list cars"})
    } catch (error) {
       console.log(error.message); 
       res.json({success: false, message: error.message})
    }
}

// API to List Car

export const addCar = async (req, res) => {
    try {
        console.log("1. Add car request received");

        const { _id } = req.user;

        const car = JSON.parse(req.body.carData);

        console.log("2. Car data received");

        const imageFiles = req.files || [];

        if (imageFiles.length === 0) {
            return res.json({success: false, message: "Car image is required"});
        }

        console.log("3. Images received:", imageFiles.map((file) => file.originalname).join(", "));

        console.log("4. Uploading to ImageKit...");

        const responses = await Promise.all(imageFiles.map((imageFile) => imagekit.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: "/cars"
        })));

        console.log("5. ImageKit upload completed");

        const images = responses.map((response) => response.url);
        const image = images[0];

        console.log("6. Image URL received");

        await Car.create({...car, owner: _id, image, images});

        console.log("7. Car saved to MongoDB");

        res.json({success: true, message: "Car Added"});

    } catch (error) {
        console.log("ADD CAR ERROR:", error.message);

        res.json({success: false, message: error.message});
    }
}

// API to Update a Car
export const updateCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.params;
        const carData = JSON.parse(req.body.carData);
        const existingImages = JSON.parse(req.body.existingImages || '[]');
        const car = await Car.findOne({ _id: carId, owner: _id });

        if (!car) {
            return res.status(404).json({success: false, message: "Car not found"});
        }

        const imageFiles = req.files || [];
        const responses = await Promise.all(imageFiles.map((imageFile) => imagekit.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: "/cars"
        })));
        const newImages = responses.map((response) => response.url);
        const images = [...existingImages, ...newImages];

        if (images.length === 0) {
            return res.status(400).json({success: false, message: "At least one car image is required"});
        }

        Object.assign(car, carData, { image: images[0], images });
        await car.save();

        res.json({success: true, message: "Car updated"});
    } catch (error) {
        console.log("UPDATE CAR ERROR:", error.message);
        res.status(400).json({success: false, message: error.message});
    }
}

//API TO List Cars
export const getOwnersCars = async (req, res)=>{
    try {
        const { _id } = req.user;
        const cars = await Car.find({owner: _id })
        res.json({success: true, cars})
    } catch (error) {
        console.log("GET OWNER CARS ERROR:", error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res)=>{
    try {
        const { _id } = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        if (!car) {
            return res.json({success: false, message: "Car not found"});
        }

        // checking is car belongs to the user
        if(car.owner.toString() !==_id.toString()){
            return res.json({success: false, message: "Unauthorized" });
        }

        car.isAvailable = !car.isAvailable;
        await car.save()

        res.json({success: true, message: "Availability Toggled"})
    } catch (error) {
        console.log(error.message); 
        res.json({success: false, message: error.message})
    }
}

// API to To delete a Car 
export const deleteCar = async (req, res)=>{
    try {
        const { _id } = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        if (!car) {
            return res.json({success: false, message: "Car not found"});
        }

        // checking is car belongs to the user
        if(car.owner.toString() !==_id.toString()){
            return res.json({success: false, message: "Unauthorized" });
        }

        car.owner = null;
        car.isAvailable = false;

        await car.save()

        res.json({success: true, message: "Car Removed"})
    } catch (error) {
        console.log(error.message); 
        res.json({success: false, message: error.message})
    }
}

//API to get Dashboard Data
export const getDashboardData = async (req, res)=>{
    try {
        const { _id, role } = req.user;

        if(role !== 'owner'){
           return res.json({success: false, message: "Unauthorized" }); 
        }

        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({ owner: _id}).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({owner: _id, status: "pending" })
        const completedBookings = await Booking.find({owner: _id, status: "confirmed" })

        // Calculate monthlyrevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.log(error.message); 
        res.json({success: false, message: error.message})
    }

}

// API to Update user image

export const updateUserImage = async (req, res)=>{
    try {
        const { _id } = req.user;

        const imageFile = req.file;
        if (!imageFile) {
            return res.json({success: false, message: "Image is required"});
        }
        
        //Upload Image to ImageKit
        const response = await imagekit.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: '/users'
        })

        const image = response.url;

        await User.findByIdAndUpdate(_id, {image});
        res.json({success: true, message: "Image Updated" })

    } catch (error) {
        console.log("UPDATE IMAGE ERROR:", error.message);
        res.json({success: false, message: "Image upload failed. Check the ImageKit connection and try again."})
    }
}