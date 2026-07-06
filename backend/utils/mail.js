import dotenv from "dotenv"
dotenv.config()

// Render blocks SMTP outbound ports, so we bypass it by calling our Vercel frontend Serverless Function!
export const sendOtpMail = async (to, otp) => {
    try {
        const response = await fetch(`${process.env.FRONTEND_URL}/api/sendEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                subject: "Reset Your Password",
                html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
                pass: process.env.PASS // Send the App Password securely to Vercel
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to send via Vercel");
        }
    } catch (error) {
        throw error;
    }
}

export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        const response = await fetch(`${process.env.FRONTEND_URL}/api/sendEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: user.email,
                subject: "Delivery OTP",
                html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
                pass: process.env.PASS
            })
        });

        if (!response.ok) {
            throw new Error("Vercel Email API failed");
        }
    } catch (error) {
        console.log("==========================================")
        console.log(`📧 EMAIL BYPASSED (SMTP Auth Failed or Blocked)`)
        console.log(`To Customer: ${user.email}`)
        console.log(`YOUR DELIVERY OTP IS: ${otp}`)
        console.log("==========================================")
    }
}
