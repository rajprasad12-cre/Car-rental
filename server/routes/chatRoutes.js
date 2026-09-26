import express from "express";
import { chatWithAI } from "../controllers/chatController.js";

const router = express.Router();
const requestLog = new Map();
const windowMs = 60 * 1000;
const maxRequests = 10;
const rateLimitEnabled = process.env.NODE_ENV === "production"
    || process.env.CHAT_RATE_LIMIT_ENABLED === "true";

router.post("/", (req, res, next) => {
	if (!rateLimitEnabled) {
		return next();
	}

	const clientId = req.ip;
	const now = Date.now();
	const recentRequests = (requestLog.get(clientId) || []).filter(
		timestamp => now - timestamp < windowMs
	);

	if (recentRequests.length >= maxRequests) {
		res.set("Retry-After", "60");
		return res.status(429).json({
			success: false,
			message: "Too many chat requests. Please try again later."
		});
	}

	recentRequests.push(now);
	requestLog.set(clientId, recentRequests);
	next();
}, chatWithAI);

export default router;