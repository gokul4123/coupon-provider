import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = ["http://localhost:3000", "https://coupon-provider.netlify.app"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const coupons = ["COUPON1", "COUPON2", "COUPON3", "COUPON4", "COUPON5"];
let currentIndex = 0;

const CLAIM_LIMIT_TIME = 0 * 1000; 
const userClaims = new Map(); 

const checkAbuse = (req, res, next) => {
    const userIP = req.ip;
    const lastClaimTime = userClaims.get(userIP);
    if (lastClaimTime && Date.now() - lastClaimTime < CLAIM_LIMIT_TIME) {
        const timeLeft = Math.ceil((CLAIM_LIMIT_TIME - (Date.now() - lastClaimTime)) / 1000);
        return res.status(429).json({ message: `⏳ Try again in ${timeLeft} seconds.`, cooldown: timeLeft });
    }

    next();
};


app.get("/api/coupons", (req, res) => {
    res.json({ availableCoupons: coupons });
});

app.post("/api/claim", checkAbuse, (req, res) => {
    if (coupons.length === 0) {
        return res.status(400).json({ message: "⚠️ No coupons available." });
    }
    const coupon = coupons[currentIndex];
    currentIndex = (currentIndex + 1) % coupons.length;
    userClaims.set(req.ip, Date.now());

    console.log(`✅ Coupon Claimed: ${coupon} by IP: ${req.ip}`); 

    res.json({ coupon });
});

app.get("/", (req, res) => {
    res.send("Backend is running. Use /api/coupons to see available coupons.");
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
