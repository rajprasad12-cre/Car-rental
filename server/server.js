import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

// Intialize Express App
const app = express();

// Connect Database
const dbReady = await connectDB();
if (!dbReady) {
    console.warn("Server started without a database connection. Update MONGODB_URI or run MongoDB locally before using data APIs.");
}

//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/chat', chatRouter)
app.use((error, req, res, next) => {
	if (error) {
		console.error(error.message)
		return res.status(400).json({
			success: false,
			message: "Invalid multipart request. In Postman, use Body > form-data and let Postman set Content-Type."
		})
	}
	next()
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))
