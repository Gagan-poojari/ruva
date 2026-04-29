const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { sendWhatsApp } = require('./whatsapp');
const { alert, ALERT_SEVERITY } = require('./monitoring');

// EmailJS configured via direct HTTP API
// No transporter needed

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
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional but recommended

    if (!serviceId || !templateId || !publicKey || !toEmail) return false;

    try {
        const payload = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey, // Optional security
            template_params: {
                to_email: toEmail,
                subject: subject,
                message: message
            }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return true;
        } else {
            const errorText = await response.text();
            throw new Error(`EmailJS Error: ${errorText}`);
        }
    } catch (error) {
        await alert(ALERT_SEVERITY.WARN, 'notification.emailjs_failed', {
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
    // Try email first
    const emailSent = await sendEmail({
        toEmail: email,
        subject,
        message,
    });

    if (emailSent) {
        return { channel: 'email', delivered: true };
    }

    await alert(ALERT_SEVERITY.WARN, 'notification.email_failed', {
        email,
        phone,
    });

    // Fallback to SMS
    const smsSent = await sendSms(phone, message);
    if (smsSent) {
        return { channel: 'sms', delivered: true };
    }

    // Fallback to WhatsApp
    const whatsappSent = await sendWhatsApp(phone, message);
    
    return {
        channel: whatsappSent ? 'whatsapp' : 'none',
        delivered: Boolean(whatsappSent),
    };
};

module.exports = {
    notifyWithFallback,
};
