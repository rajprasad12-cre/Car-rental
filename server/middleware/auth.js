import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({success: false, message: "Not Authorized"})
        }
        try{
            const token = authHeader.startsWith('Bearer')
                ? authHeader.slice(7)
                : authHeader;
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if(!decoded || !decoded.id){
                return res.status(401).json({success: false, message: "not authorized"})
            }
            req.user = await User.findById(decoded.id).select("-password")

            if (!req.user) {
                return res.status(401).json({success: false, message: "User not found"})
            }

            next();

        } catch (error) {
            return res.status(401).json({success: false, message: "Not Authorized"})
    }
}