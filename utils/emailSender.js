// const nodemailer = require("nodemailer");
// const { config } = require("../config/config");
// const path = require("path");

// // --- Create a secure SMTP transporter for Namecheap Private Email ---
// const transporter = nodemailer.createTransport({
//   host: "mail.privateemail.com",
//   port: 465,                     
//   secure: true,                  
//   auth: {
//     user: config.email,          
//     pass: config.email_password, 
//   },
//   tls: {
//     rejectUnauthorized: false 
//   },
//   logger: false, 
//   debug: false,
// });

// // Verify Namecheap SMTP connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Namecheap SMTP connection failed:", error.message);
//   } else {
//     console.log("Namecheap SMTP connection successful!");
//   }
// });

// /**
//  * Send Email Function (Auth/No-Reply)
//  * @param {string} email - Recipient address
//  * @param {string} subject - Email subject
//  * @param {string} message - HTML content body
//  */
// const sendEmail = async (email, subject, message) => {
//   console.log(`Attempting to send email to: ${email}`);
//   try {
//     const mailOptions = {
//       from: `"Trustedtek No-Reply" <${config.email}>`,
//       to: email,
//       subject,
//       replyTo: `no-reply@trustedtek.org`,
//       html: `
//         <div style="font-family: sans-serif; font-size:16px; color:#333; max-width: 600px; margin: auto;">
//           <img src="cid:logo" alt="Company Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
//           <p>${message}</p>
//           <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
          
//           <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
//             <p style="font-size:12px; color:#777; margin: 0;">
//               <strong>Note:</strong> This is an automated authentication message. Replies to this email are not monitored.
//             </p>
//             <p style="font-size:12px; color:#777; margin: 10px 0 0 0;">
//               If you didn’t request this, please ignore this email. 
//               Contact us at <a href="mailto:${config.contact_email}" style="color: #007bff;">${config.contact_email}</a> for support.
//             </p>
//           </div>
//         </div>`,
//       headers: {
//         "X-Mailer": "Trustedtek Mailer",
//         "X-Auto-Response-Suppress": "All",
//       },
//       attachments: [{
//         filename: 'logo.png',
//         path: path.join(__dirname, '../public/images/logo.png'),
//         cid: 'logo' 
//       }]
//     };

//     console.log("Mail options:", JSON.stringify(mailOptions, null, 2));

//     const info = await transporter.sendMail(mailOptions);
    
//     console.log("Email sent successfully. Info:", JSON.stringify(info, null, 2));

//     return {
//       success: true,
//       message: `Email sent successfully to ${email}`,
//       messageId: info.messageId,
//     };
//   } catch (error) {
//     console.error("Error sending email:", error.message);
//     console.error("Full error object:", JSON.stringify(error, null, 2));
//     return {
//       success: false,
//       message: "Failed to send email",
//       error: error.message,
//     };
//   }
// };

// module.exports = sendEmail;



// Remove nodemailer dependency and import Resend
const { Resend } = require('resend');
const { config } = require("../config/config");
const path = require("path");
// Need Node.js 'fs' module to read the attachment file into a buffer
const fs = require('fs'); 

// --- Initialize Resend using your API Key ---
// Ensure you have RESEND_API_KEY in your Render environment variables
const resend = new Resend(config.resend_api_key);

// The old transporter setup and verification blocks are removed.

/**
 * Send Email Function (Auth/No-Reply)
 * @param {string} email - Recipient address
 * @param {string} subject - Email subject
 * @param {string} message - HTML content body
 */
const sendEmail = async (email, subject, message) => {
  console.log(`Attempting to send email to: ${email}`);

  // 1. Read the logo file into a buffer for the Resend API
  const logoPath = path.join(__dirname, '../public/images/logo.png');
  let logoAttachment = null;

  try {
    // Resend requires the file content as a Buffer
    const logoBuffer = fs.readFileSync(logoPath);
    logoAttachment = {
      filename: 'logo.png',
      content: logoBuffer, // This works for Resend's attachments array
    };
  } catch (err) {
    console.error("Failed to read logo attachment file:", err.message);
    // Continue without attachment if file is missing
  }
  
  // 2. Prepare the main email content (HTML template is simplified slightly)
  const htmlContent = `
    <div style="font-family: sans-serif; font-size:16px; color:#333; max-width: 600px; margin: auto;">
      <!-- Resend doesn't support 'cid:' attachments easily in the HTML like Nodemailer does -->
      <!-- You should host the logo online and link to its public URL instead -->
      <!-- <img src="URL_TO_YOUR_HOSTED_LOGO" alt="Company Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;"> -->
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
    </div>`;

  try {
    console.log("Preparing email send via Resend API...");

    // 3. Send the email using the Resend API
    const { data, error } = await resend.emails.send({
      from: `"Trustedtek No-Reply" <mail.trustedtek.org>`, // Use your new verified subdomain
      to: [email], // Resend requires an array for 'to'
      subject: subject,
      html: htmlContent,
      replyTo: `no-reply@trustedtek.org`,
      // Attachments array accepts the object we created earlier
      // attachments: logoAttachment ? [logoAttachment] : [],
    });

    if (error) {
      console.error("Error sending email via Resend:", error.message);
      // Log the full error object if available for debugging
      console.error("Full error object:", JSON.stringify(error, null, 2)); 
      return { success: false, message: "Failed to send email", error: error.message };
    }

    console.log("Email sent successfully. Info:", JSON.stringify(data, null, 2));

    return {
      success: true,
      message: `Email sent successfully to ${email}`,
      messageId: data.id,
    };
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
    return {
      success: false,
      message: "Failed to send email due to an unexpected error",
      error: error.message,
    };
  }
};

module.exports = sendEmail;
