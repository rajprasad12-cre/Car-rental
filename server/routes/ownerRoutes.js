import express from "express";
import { protect } from "../middleware/auth.js";
import { addCar, deleteCar, getDashboardData, getOwnersCars, toggleCarAvailability, updateCar, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/add-car", protect, upload.array("image", 10), addCar)
ownerRouter.put("/car/:carId", protect, upload.array("image", 10), updateCar)
ownerRouter.get("/car", protect, getOwnersCars)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashboardData)
ownerRouter.post('/update-image', protect, upload.single("image"), updateUserImage)

export default ownerRouter;