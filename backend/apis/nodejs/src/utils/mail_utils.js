const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'Infomaniak',
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

function sendConfirmationLink(destinationEmail, confirmationLink) {
    let mailOptions = {
        from: `"Blink" ${process.env.SMTP_USERNAME}`,
        to: destinationEmail,
        subject: 'Verify your Blink Account',
        // text: 'This is plain HTML',
        html: getConfirmationLinkHtmlPage(confirmationLink)
    };
    sendMail(mailOptions);
}

function sendMail(mailOptions) {
    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

function getConfirmationLinkHtmlPage(confirmationLink) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Activation Page</title><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh}.container{text-align:center;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,.1);background-color:#fff}h1{color:#333}a{display:block;padding:10px 20px;margin-top:20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;transition:background-color .3s ease}a:hover{background-color:#0056b3}</style></head><body><div class="container"><h1>Activate your Blink Account</h1><p>Please click the activation link below to activate your account</p><a href="${confirmationLink}">Activate Now</a></div></body></html>`;
}

module.exports = {
    sendConfirmationLink,
    sendMail
}