import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"CollegeMatch-AI" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Verify your CollegeMatch-AI account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
          <h2 style="color: #534ab7; text-align: center;">Welcome to CollegeMatch-AI!</h2>
          <p style="color: #333; font-size: 16px;">Hi there,</p>
          <p style="color: #333; font-size: 16px;">Thank you for signing up. To complete your registration and secure your account, please use the following 6-digit verification code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1d9e75; background: #eef8f4; border-radius: 8px; border: 1px solid #c2eadd;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #333; font-size: 16px;">If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">CollegeMatch-AI — India's smartest college advisor</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP email' },
      { status: 500 }
    );
  }
}
