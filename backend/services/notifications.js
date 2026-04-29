const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { sendWhatsApp } = require('./whatsapp');
const { alert, ALERT_SEVERITY } = require('./monitoring');

let transporter;
const getTransporter = () => {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return transporter;
};

const getTwilioClient = () => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return null;
    }

    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const sendSms = async (toPhone, message) => {
    const smsFrom = process.env.TWILIO_SMS_FROM;
    const client = getTwilioClient();
    if (!smsFrom || !client || !toPhone) return false;

    try {
        const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;
        await client.messages.create({
            from: smsFrom,
            to: formattedPhone,
            body: message,
        });
        return true;
    } catch (error) {
        await alert(ALERT_SEVERITY.WARN, 'notification.sms_failed', {
            toPhone,
            reason: error.message,
        });
        return false;
    }
};

const sendEmail = async ({ toEmail, subject, message }) => {
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const transport = getTransporter();

    if (!transport || !toEmail || !emailFrom) return false;

    try {
        await transport.sendMail({
            from: emailFrom,
            to: toEmail,
            subject,
            text: message,
        });
        return true;
    } catch (error) {
        await alert(ALERT_SEVERITY.WARN, 'notification.email_failed', {
            toEmail,
            reason: error.message,
        });
        return false;
    }
};

const notifyWithFallback = async ({
    phone,
    email,
    subject = 'RUVA Order Update',
    message,
}) => {
    const whatsappSent = await sendWhatsApp(phone, message);

    if (whatsappSent) {
        return { channel: 'whatsapp', delivered: true };
    }

    await alert(ALERT_SEVERITY.WARN, 'notification.whatsapp_failed', {
        phone,
        email,
    });

    const smsSent = await sendSms(phone, message);
    if (smsSent) {
        return { channel: 'sms', delivered: true };
    }

    const emailSent = await sendEmail({
        toEmail: email,
        subject,
        message,
    });

    return {
        channel: emailSent ? 'email' : 'none',
        delivered: Boolean(emailSent),
    };
};

module.exports = {
    notifyWithFallback,
};
