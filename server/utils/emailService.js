const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
    const { title, show_date, show_time, seats, total_amount, booking_reference } = bookingDetails;

    // Format seats if it's an array
    const formattedSeats = Array.isArray(seats) ? seats.join(', ') : seats;

    const mailOptions = {
        from: `"HiMovie Cinema" <${process.env.SMTP_FROM}>`,
        to: userEmail,
        subject: `Booking Confirmed: ${title} - ${booking_reference}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #f5c518; text-align: center;">Booking Confirmation</h2>
                <p>Hi there,</p>
                <p>Thank you for choosing <strong>HiMovie Cinema</strong>! Your booking has been successfully confirmed.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${title}</h3>
                    <p><strong>Date:</strong> ${new Date(show_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${show_time}</p>
                    <p><strong>Seats:</strong> ${formattedSeats}</p>
                    <p><strong>Total Amount:</strong> $${total_amount}</p>
                    <p><strong>Reference:</strong> ${booking_reference}</p>
                </div>
                
                <p>Please show this confirmation at the cinema entrance.</p>
                <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
                    &copy; ${new Date().getFullYear()} HiMovie Cinema. All rights reserved.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendBookingConfirmation };
