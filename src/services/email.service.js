const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN 
  }
});


// Verify the connection configuration

transporter.verify((error, success) => {
  if (error) {
    console.error("error connecting to email server:", error);
    } else { console.log("Email server is ready to take messages:", success); }
});

// Function to send an email

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend-ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("error sending email:", error);
    }
};

// Function to send registration email

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend-ledger!";
    const text = `Hello ${name},\n\nThank you for registering with Backend-ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend-ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering with <strong>Backend-ledger</strong>! We're excited to have you on board.</p><p>Best regards,<br>The Backend-ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);

}

async function sendLoginNotificationEmail(userEmail, name) {
    const subject = "Login Notification";
    const text = `Hello ${name},\n\nWe noticed a login to your account. If this was you, no action is needed. If you did not log in, please secure your account.\n\nBest regards,\nThe Backend-ledger Team`;
    const html = `<p>Hello ${name},</p><p>We noticed a login to your account. If this was you, no action is needed. If you did not log in, please secure your account.</p><p>Best regards,<br>The Backend-ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Successful";
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend-ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> was successful.</p><p>Best regards,<br>The Backend-ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Failed";
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} has failed. Please try again or contact support.\n\nBest regards,\nThe Backend-ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> has failed. Please try again or contact support.</p><p>Best regards,<br>The Backend-ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {    sendRegistrationEmail,
    sendLoginNotificationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};