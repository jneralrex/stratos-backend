const nodemailer = require("nodemailer");
const { config } = require("../config/config");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: config.email,
        pass: config.email_password, 
    },
});

const sendEmail = async (email, subject, message) => {
    try {
        const mailOptions = {
            from: `"HouseMatters" <${config.email}>`,
            to: email,
            subject,
            html: `<p style="font-size:16px; color:#333;">${message}</p>`,
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: `Email sent successfully to ${email}`,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error("Error sending email:", error.message);

        return {
            success: false,
            message: "Failed to send email",
            error: error.message,
        };
    }
};

module.exports = sendEmail;
