const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const Twilio = require('twilio')(accountSid, authToken);

function sendSMS(to, body) {
  Twilio.messages
    .create({ to, from, body })
    .then((message) => {
      console.log('SMS message successful!');
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  sendSMS,
};
