// const nodemailer = require("nodemailer");
// const { config } = require("../config/config");

// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: config.email,
//         pass: config.email_password, 
//     },
// });

// const sendEmail = async (email, subject, message) => {
//     try {
//         const mailOptions = {
//             from: `"HouseMatters" <${config.email}>`,
//             to: email,
//             subject,
//             html: `<p style="font-size:16px; color:#333;">${message}</p>`,
//         };

//         const info = await transporter.sendMail(mailOptions);

//         return {
//             success: true,
//             message: `Email sent successfully to ${email}`,
//             messageId: info.messageId,
//         };
//     } catch (error) {
//         console.error("Error sending email:", error.message);

//         return {
//             success: false,
//             message: "Failed to send email",
//             error: error.message,
//         };
//     }
// };

// module.exports = sendEmail;


const nodemailer = require("nodemailer");
const { config } = require("../config/config");

// --- Create a secure SMTP transporter for Gmail ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,            // SSL port
  secure: true,         // use SSL
  auth: {
    user: config.email,
    pass: config.email_password, // Gmail App Password
  },
  logger: true,         // log SMTP activity (disable in production)
  debug: false,         // set to true for detailed debugging
});

// Optional: verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail SMTP connection failed:", error.message);
  } else {
    console.log("✅ Gmail SMTP connection successful!");
  }
});

// --- Send Email Function ---
const sendEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: `"HouseMatters" <${config.email}>`,
      to: email,
      subject,
      html: `<p style="font-size:16px; color:#333;">${message}</p> 
             <br/>
             <p style="font-size:12px; color:#777;">If you didn’t request this, please ignore this email.</p>`,
      headers: {
        "X-Mailer": "HouseMatters Mailer",
      },
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(` Email sent to ${email} (${info.messageId})`);

    return {
      success: true,
      message: `Email sent successfully to ${email}`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(" Error sending email:", error.message);

    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};

module.exports = sendEmail;
