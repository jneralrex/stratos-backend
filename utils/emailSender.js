const nodemailer = require("nodemailer");
const { config } = require("../config/config");
const path = require("path");

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
  console.log(`Attempting to send email to: ${email}`);
  try {
    const mailOptions = {
      from: `"Trustedtek No-Reply" <${config.email}>`,
      to: email,
      subject,
      replyTo: `no-reply@trustedtek.org`,
      html: `
        <div style="font-family: sans-serif; font-size:16px; color:#333; max-width: 600px; margin: auto;">
          <img src="cid:logo" alt="Company Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
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
        "X-Auto-Response-Suppress": "All",
      },
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../public/images/logo.png'),
        cid: 'logo' 
      }]
    };

    console.log("Mail options:", JSON.stringify(mailOptions, null, 2));

    const info = await transporter.sendMail(mailOptions);
    
    console.log("Email sent successfully. Info:", JSON.stringify(info, null, 2));

    return {
      success: true,
      message: `Email sent successfully to ${email}`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};

module.exports = sendEmail;
