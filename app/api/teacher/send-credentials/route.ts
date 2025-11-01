import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { students } = await req.json();

    if (!students || students.length === 0) {
      return NextResponse.json({ error: "No students provided." }, { status: 400 });
    }

    // ✅ Configure transporter (use your Gmail or SMTP settings)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // use Google App Password
      },
    });

    // ✅ Send emails one by one (or you can batch later)
    for (const student of students) {
      const { name, email, dob } = student;

      if (!email) continue;

      const mailOptions = {
        from: `"Academic Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Student Portal Login Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello ${name},</h2>
            <p>Welcome to the student portal!</p>
            <p>Your account has been created successfully. You can now log in using the following credentials:</p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Password:</strong> ${dob}</li>
            </ul>
            <p>⚠️ Please log in and change your password immediately after your first login.</p>
            <br/>
            <p>Best regards,<br/>Your Academic Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true, message: "Emails sent successfully." });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: error.message || "Failed to send emails" }, { status: 500 });
  }
}
