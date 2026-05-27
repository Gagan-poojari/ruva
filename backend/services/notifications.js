// const twilio = require('twilio'); // Twilio disabled
const { sendWhatsApp } = require('./whatsapp'); // stub — returns false silently
const { alert, ALERT_SEVERITY } = require('./monitoring');

// ─── SMS (Twilio) — disabled ──────────────────────────────────────────────────
// To re-enable SMS, restore the Twilio client and uncomment sendSms body below.
const sendSms = async (_toPhone, _message) => {
    // Disabled — Twilio SMS integration commented out
    /*
    const smsFrom = process.env.TWILIO_SMS_FROM;
    const client = getTwilioClient();
    if (!smsFrom || !client || !toPhone) return false;
    try {
        const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;
        await client.messages.create({ from: smsFrom, to: formattedPhone, body: message });
        return true;
    } catch (error) {
        await alert(ALERT_SEVERITY.WARN, 'notification.sms_failed', { toPhone, reason: error.message });
        return false;
    }
    */
    return false;
};

// ─── Email (EmailJS) ───────────────────────────────────────────────────────────
const sendEmail = async ({ toEmail, subject, message }) => {
    const serviceId  = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY; // optional

    if (!serviceId || !templateId || !publicKey || !toEmail) return false;

    try {
        const payload = {
            service_id:      serviceId,
            template_id:     templateId,
            user_id:         publicKey,
            accessToken:     privateKey,
            template_params: { to_email: toEmail, subject, message },
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });

        if (response.ok) return true;
        const errorText = await response.text();
        throw new Error(`EmailJS Error: ${errorText}`);
    } catch (error) {
        await alert(ALERT_SEVERITY.WARN, 'notification.emailjs_failed', {
            toEmail,
            reason: error.message,
        });
        return false;
    }
};

// ─── Notify with fallback ──────────────────────────────────────────────────────
// Tries email → SMS (disabled) → WhatsApp (disabled). Falls back silently.
const notifyWithFallback = async ({ phone, email, subject = 'RUVA Order Update', message }) => {
    // 1. Try email
    const emailSent = await sendEmail({ toEmail: email, subject, message });
    if (emailSent) return { channel: 'email', delivered: true };

    await alert(ALERT_SEVERITY.WARN, 'notification.email_failed', { email, phone });

    // 2. SMS disabled
    // const smsSent = await sendSms(phone, message);
    // if (smsSent) return { channel: 'sms', delivered: true };

    // 3. WhatsApp disabled (stub returns false)
    // const whatsappSent = await sendWhatsApp(phone, message);
    // return { channel: whatsappSent ? 'whatsapp' : 'none', delivered: Boolean(whatsappSent) };

    return { channel: 'none', delivered: false };
};

module.exports = { notifyWithFallback };
