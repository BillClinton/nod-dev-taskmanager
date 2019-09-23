require('dotenv').config();

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SYSTEM_EMAIL_FROM,
    subject: 'Welcome to the task manager app',
    text: `Welcome to the app, ${name}. I hope this actually gets to you`
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SYSTEM_EMAIL_FROM,
    subject: 'Account cancelation',
    text: `Hi ${name}, your account has been canceled`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};
