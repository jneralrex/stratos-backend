// const nodemailer = require("nodemailer");
// const { config } = require("../config/config");

// // --- Create a secure SMTP transporter for Gmail ---
// const transporter = nodemailer.createTransport({
//   host: "mail.privateemail.com",
//   port: 465,            // SSL port
//   secure: true,         // use SSL
//   auth: {
//     user: config.email,
//     pass: config.email_password, // Gmail App Password
//   },
//   logger: true,         // log SMTP activity (disable in production)
//   debug: false,         // set to true for detailed debugging
// });

// // Optional: verify SMTP connection on startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Gmail SMTP connection failed:", error.message);
//   } else {
//     console.log("Gmail SMTP connection successful!");
//   }
// });

// // --- Send Email Function ---
// const sendEmail = async (email, subject, message) => {
//   try {
//     const mailOptions = {
//       from: `"Trustedtek" <${config.email}>`,
//       to: email,
//       subject,
//       html: `<p style="font-size:16px; color:#333;">${message}</p> 
//              <br/>
//              <p style="font-size:12px; color:#777;">If you didn’t request this, please ignore this email.</p>`,
//       headers: {
//         "X-Mailer": "Trustedtek Mailer",
//       },
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log(` Email sent to ${email} (${info.messageId})`);

//     return {
//       success: true,
//       message: `Email sent successfully to ${email}`,
//       messageId: info.messageId,
//     };
//   } catch (error) {
//     console.error(" Error sending email:", error.message);

//     return {
//       success: false,
//       message: "Failed to send email",
//       error: error.message,
//     };
//   }
// };

// module.exports = sendEmail;


const nodemailer = require("nodemailer");
const { config } = require("../config/config");

// --- Create a secure SMTP transporter for Namecheap Private Email ---
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,                     
  secure: true,                  
  auth: {
    user: config.email,          
    pass: config.email_password, 
  },
  tls: {
    rejectUnauthorized: false 
  },
  logger: false, 
  debug: false,
});

// Verify Namecheap SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Namecheap SMTP connection failed:", error.message);
  } else {
    console.log("Namecheap SMTP connection successful!");
  }
});

/**
 * Send Email Function (Auth/No-Reply)
 * @param {string} email - Recipient address
 * @param {string} subject - Email subject
 * @param {string} message - HTML content body
 */
const sendEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      // Set display name to No-Reply to signal this is automated
      from: `"Trustedtek No-Reply" <${config.email}>`,
      to: email,
      subject,
      // Forces any 'Reply' action to go to a dead-end address
     replyTo: `no-reply@trustedtek.org`, 
      html: `
        <div style="font-family: sans-serif; font-size:16px; color:#333; max-width: 600px; margin: auto;">
          <p>${message}</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="font-size:12px; color:#777; margin: 0;">
              <strong>Note:</strong> This is an automated authentication message. Replies to this email are not monitored.
            </p>
            <p style="font-size:12px; color:#777; margin: 10px 0 0 0;">
              If you didn’t request this, please ignore this email. 
              Contact us at <a href="mailto:${config.contact_email}" style="color: #007bff;">${config.contact_email}</a> for support.
            </p>
          </div>
        </div>`,
      headers: {
        "X-Mailer": "Trustedtek Mailer",
        "X-Auto-Response-Suppress": "All", // Tells email clients not to send auto-replies
      },
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
