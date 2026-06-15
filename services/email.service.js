const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

const sendEmail = async (to, subject, otpHtml) => {
  try {
    const info = await transporter.sendMail({
      from: `Your Name <${process.env.GOOGLE_USER}>`,
      to,
      subject,

      html: otpHtml, // otpional: You can also send HTML content
    });
    console.log("Email sent:", info.response);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { transporter, sendEmail };
