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

export const sendInvoiceMail = async (user, orderDetails) => {
    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ff4d2d; text-align: center;">GrabIT - Order Receipt</h2>
                <p>Hi ${user.fullName || user.name},</p>
                <p>Thank you for your order! Here is your receipt:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                    <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
                    <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
                    <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress.text}</p>
                </div>
                
                <p>We hope you enjoy your meal!</p>
                <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">© 2026 GrabIT Inc.</p>
            </div>
        `;

        const response = await fetch(`${process.env.FRONTEND_URL}/api/sendEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: user.email,
                subject: `Your GrabIT Receipt - Order #${orderDetails.orderId.substring(0, 8)}`,
                html: htmlContent,
                pass: process.env.PASS
            })
        });

        if (!response.ok) {
            throw new Error("Vercel Email API failed");
        }
    } catch (error) {
        console.log("==========================================")
        console.log(`📧 INVOICE EMAIL BYPASSED`)
        console.log(`To Customer: ${user.email}`)
        console.log(`Total: ₹${orderDetails.totalAmount}`)
        console.log("==========================================")
    }
}
