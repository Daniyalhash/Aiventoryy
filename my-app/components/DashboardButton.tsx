'use client';

import { useEffect, useState } from 'react';
import '@/styles/SignupPage.css';

interface DashboardButtonProps {
    userId: string;
}

const DashboardButton = ({ userId }: DashboardButtonProps) => {
    const [loadingText, setLoadingText] = useState("Analyzing your data...");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const loadingTexts = [
            "Analyzing your data...",
            "Preparing magic for you...",
            "Creating your personalized model...",
            "Hang tight! Almost ready..."
        ];

        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % loadingTexts.length;
            setLoadingText(loadingTexts[index]);
        }, 2000);

        const completeSignup = async () => {
            try {
                const response = await fetch("https://seal-app-8m3g5.ondigitalocean.app/aiventory/complete_signup/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("userId", userId);
                    setMessage("Signup completed successfully! Redirecting to dashboard...");
                    setIsError(false);
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 2000);
                } else {
                    setMessage(data.error || "Failed to complete signup. Try again.");
                    setIsError(true);
                }
            } catch (error) {
                console.error("Error during signup:", error);
                setMessage("Something went wrong. Please try again.");
                setIsError(true);
            } finally {
                clearInterval(interval);
            }
        };

        completeSignup();

        return () => clearInterval(interval);
    }, [userId]);

    return (
        <div className="stepContainer">
                        <p className='dashHeadingSub'>Your smart inventory management starts here.</p>

            <h2 className='shinyText'>{loadingText}</h2>

            {message && (
                <div className={`messageContainer ${isError ? 'error' : 'success'}`}>
                    <div className="message-content">
                        <span className="close-icon" onClick={() => setMessage("")}>✖</span>
                        {message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardButton;

