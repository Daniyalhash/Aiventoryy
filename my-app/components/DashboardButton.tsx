'use client';

import { useEffect, useState } from 'react';
import '@/styles/SignupPage.css';

interface DashboardButtonProps {
    userId: string;
}
import axios from 'axios'; // Add this at the top if not already there

const DashboardButton = ({ userId }: DashboardButtonProps) => {
    const [loadingText, setLoadingText] = useState("Analyzing your data...");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [user_id, setUser] = useState<string | null>(null);
    useEffect(() => {
        if (userId) {
            setUser(userId); // or setUserExists(true)
        }
    }, [userId]);
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
                const response = await fetch("https://seal-app-8m3g5.ondigitalocean.app/aiventory/done/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // again, needed for Django sessions
                    body: JSON.stringify({ user_id: userId }),
                    
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("userId", userId);
                    setMessage("Signup completed successfully! Redirecting to dashboard...");
                    setIsError(false);
                    // poll for user status
                    // Start polling
                    const pollUserStatus = async () => {
                        try {
                            const response = await axios.get(
                                "https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_user_details/",
                                {
                                    params: { user_id: userId }
                                }
                            );

                            const data = response.data;

                            if (data.status === "complete") {
                                clearInterval(pollingInterval);
                                window.location.href = "/dashboard";
                            }
                        } catch (error) {
                            console.error("Polling failed:", error);
                        }
                    };

                    const pollingInterval = setInterval(pollUserStatus, 5000);

                } else {
                    setMessage(data.error || "Failed to complete signup. Try again.");
                    setIsError(true);
                }
            } catch (error: any) {
                console.error("Error during signup:", error);
                setMessage(error.details || error.error || "Something went wrong.");
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

