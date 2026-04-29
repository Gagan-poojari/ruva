const ALERT_SEVERITY = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'critical',
};

const monitorLog = (severity, event, details = {}) => {
    const payload = {
        severity,
        event,
        details,
        at: new Date().toISOString(),
    };

    const logger = severity === ALERT_SEVERITY.ERROR || severity === ALERT_SEVERITY.CRITICAL
        ? console.error
        : console.log;

    logger('[MONITOR]', JSON.stringify(payload));
};

const sendWebhookAlert = async (severity, event, details = {}) => {
    if (!process.env.ALERT_WEBHOOK_URL) return;

    try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            severity,
            event,
            details,
            service: 'ruva-backend',
            timestamp: new Date().toISOString(),
            }),
        });
    } catch (error) {
        console.error('[MONITOR] Failed to send webhook alert:', error.message);
    }
};

const alert = async (severity, event, details = {}) => {
    monitorLog(severity, event, details);
    await sendWebhookAlert(severity, event, details);
};

const monitorApiError = async ({ req, statusCode, message, stack }) => {
    const shouldAlert = statusCode >= 500;
    const details = {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : stack,
    };

    if (shouldAlert) {
        await alert(ALERT_SEVERITY.ERROR, 'api.error', details);
    } else {
        monitorLog(ALERT_SEVERITY.WARN, 'api.warning', details);
    }
};

module.exports = {
    ALERT_SEVERITY,
    alert,
    monitorApiError,
};
