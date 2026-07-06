import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { to, subject, html, pass } = req.body;

  // We are going to pass the EMAIL from Vercel environment variables,
  // but we can pass the PASS directly from the backend to avoid having to setup another Vercel variable.
  // Actually, wait, let's just use the App Password they already put in Vercel if it exists. 
  // No, wait, they only put the PASS in Render!
  // So the backend (Render) will send the PASS to this function via the secure HTTP request!
  // That way they don't have to add it to Vercel manually.

  if (!to || !subject || !html || !pass) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
      user: "ashutoshsahu0563@gmail.com", // Harcoded since we know this is their email
      pass: pass, // Received securely from Render backend
    },
  });

  try {
    await transporter.sendMail({
      from: "ashutoshsahu0563@gmail.com",
      to,
      subject,
      html,
    });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send email", error: error.message });
  }
}
