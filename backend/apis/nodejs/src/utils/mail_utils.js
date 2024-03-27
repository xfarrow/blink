const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Boolean(process.env.SMTP_SECURE),
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * Given the destination address and the activation code, sends an e-mail
 * to activate such account.
 * @param {*} destinationAddress 
 * @param {*} code 
 */
function sendConfirmationLink(destinationAddress, code) {
    const confirmationLink = `${process.env.FRONT_END_URL}/activate-account.html?q=${code}`
    sendMail(destinationAddress, 'Verify your Blink Account', null, getConfirmationLinkHtmlPage(confirmationLink));
}

function sendResetPasswordLink(destinationAddress, secret) {
    const message = `A change of your Blink password has been requested. If you requested this, click on this link ${process.env.FRONT_END_URL}/reset-password.html?secret=${secret}. Otherwise you can simply ignore this e-mail`;
    sendMail(destinationAddress, 'Blink Password change', message, null);
}

/**
 * 
 * @param {*} destinationAddress Destination Address
 * @param {*} subject Subject
 * @param {*} text Plain-text body
 * @param {*} html Html body
 */
function sendMail(destinationAddress, subject, text, html) {

    let mailOptions = {
        from: `"Blink" ${process.env.SMTP_USERNAME}`,
        to: destinationAddress,
        subject: subject,
        text: text, // plain text
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        }
    });
}

/**
 * Returns an Html page to be rendered in the user's email client which has an
 * "Activate Account" button
 * @param {*} confirmationLink the link the user shoud follow to activate the
 * account 
 * 
 * @returns A string representing the Html page. 
 */
function getConfirmationLinkHtmlPage(confirmationLink) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Activation Page</title><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh}.container{text-align:center;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,.1);background-color:#fff}h1{color:#333}a{display:block;padding:10px 20px;margin-top:20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;transition:background-color .3s ease}a:hover{background-color:#0056b3}</style></head><body><div class="container"><h1>Activate your Blink Account</h1><p>Please click the button below to activate your account</p><a href="${confirmationLink}">Activate Now</a></div></body></html>`;
}

module.exports = {
    sendConfirmationLink,
    sendResetPasswordLink,
    sendMail
}