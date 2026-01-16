const sendEmail = require("./utils/emailSender");

(async () => {
  const response = await sendEmail(
    "jneralrex@gmail.com",
    "Test OTP",
    "Abu"
  );
  console.log(response);
})();
