const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const Twilio = require('twilio')(accountSid, authToken);

function sendSMS(to, body) {
  Twilio.messages
    .create({ to, body })
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
