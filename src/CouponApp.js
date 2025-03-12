import React, { useState, useEffect } from "react";
import "./CouponApp.css"; 

const CouponApp = () => {
    const [coupon, setCoupon] = useState(null);
    const [message, setMessage] = useState("");
    const [cooldown, setCooldown] = useState(0); 
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [isClaimDisabled, setIsClaimDisabled] = useState(false);
    useEffect(() => {
        fetch("https://coupon-provider-1.onrender.com/api/coupons")
            .then((res) => res.json())
            .then((data) => setAvailableCoupons(data.availableCoupons))
            .catch(() => setMessage("Error loading coupons."));
    }, []);
    useEffect(() => {
        if (cooldown > 0) {
            setIsClaimDisabled(true);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev > 1) {
                        return prev - 1;
                    } else {
                        clearInterval(timer);
                        setIsClaimDisabled(false);
                        return 0;
                    }
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const claimCoupon = async () => {
        setMessage("");
        setIsClaimDisabled(true);

        try {
            const res = await fetch("https://coupon-provider-1.onrender.com/api/claim", {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                setCoupon(data.coupon);
                setMessage("");
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 2000);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage("Error claiming coupon.");
        }

        setCooldown(7); 
    };

    return (
        <div className="coupon-container">
            <h1 className="coupon-title">Claim Your Coupon</h1>
            <div className="coupon-list">
                <h2>Available Coupons:</h2>
                <ul>
                    {availableCoupons.length > 0 ? (
                        availableCoupons.map((c, index) => <li key={index}>{c}</li>)
                    ) : (
                        <p>No coupons available.</p>
                    )}
                </ul>
            </div>
            <button
                onClick={claimCoupon}
                className={`claim-button ${isClaimDisabled ? "disabled" : ""}`}
                disabled={isClaimDisabled}
            >
                {isClaimDisabled ? `⏳ Wait ${cooldown} sec` : "Claim Coupon"}
            </button>
            {coupon && <p className="coupon-obtained">🎉 You obtained: <strong>{coupon}</strong></p>}

            {message && <p className="error-message">{message}</p>}
            {showNotification && (
                <div className="notification">🎉 Coupon Claimed Successfully!</div>
            )}
        </div>
    );
};

export default CouponApp;
