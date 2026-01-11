/**
 * Alert System for Critical Errors
 *
 * Sends notifications via:
 * - Slack (primary)
 * - Email (fallback, if configured)
 *
 * Usage:
 *   await sendAlert('critical', 'Webhook processing failed', { userId, eventType });
 */

export type AlertSeverity = 'critical' | 'warning' | 'info';

interface AlertMetadata {
  [key: string]: any;
}

/**
 * Send alert to Slack and/or email
 */
export async function sendAlert(
  severity: AlertSeverity,
  message: string,
  metadata?: AlertMetadata
): Promise<void> {
  // Only send alerts in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ALERT - ${severity.toUpperCase()}] ${message}`, metadata);
    return;
  }

  const timestamp = new Date().toISOString();
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;

  // Format metadata for display
  const metadataString = metadata
    ? Object.entries(metadata)
        .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
        .join('\n')
    : '';

  const fullMessage = `[${severity.toUpperCase()}] ${message}\n` +
    `Environment: ${environment}\n` +
    `Time: ${timestamp}\n` +
    (metadataString ? `\nMetadata:\n${metadataString}` : '');

  const promises: Promise<any>[] = [];

  // Send to Slack if webhook URL configured
  if (process.env.SLACK_WEBHOOK_URL) {
    promises.push(sendSlackAlert(severity, message, fullMessage));
  }

  // Send email for critical alerts if configured
  if (severity === 'critical' && process.env.ALERT_EMAIL) {
    promises.push(sendEmailAlert(message, fullMessage));
  }

  // Execute all alerts concurrently
  await Promise.allSettled(promises);
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(
  severity: AlertSeverity,
  message: string,
  fullMessage: string
): Promise<void> {
  try {
    const color = {
      critical: '#FF0000', // Red
      warning: '#FFA500',  // Orange
      info: '#0000FF',     // Blue
    }[severity];

    const emoji = {
      critical: ':rotating_light:',
      warning: ':warning:',
      info: ':information_source:',
    }[severity];

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: `${emoji} VoyagrIQ Alert - ${severity.toUpperCase()}`,
            text: message,
            fields: [
              {
                title: 'Details',
                value: fullMessage,
                short: false,
              },
            ],
            footer: 'VoyagrIQ Monitoring',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });
  } catch (error) {
    console.error('[alerts] Failed to send Slack alert:', error);
  }
}

/**
 * Send alert email (placeholder - implement with SendGrid/Resend)
 */
async function sendEmailAlert(
  subject: string,
  body: string
): Promise<void> {
  try {
    // TODO: Implement email sending with SendGrid or Resend
    // For now, just log
    console.error('[alerts] Email alert (not implemented):', {
      to: process.env.ALERT_EMAIL,
      subject: `[CRITICAL] VoyagrIQ: ${subject}`,
      body,
    });

    // Example implementation with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: process.env.ALERT_EMAIL,
      from: process.env.ALERT_FROM_EMAIL,
      subject: `[CRITICAL] VoyagrIQ: ${subject}`,
      text: body,
    });
    */
  } catch (error) {
    console.error('[alerts] Failed to send email alert:', error);
  }
}

/**
 * Alert for webhook processing failures
 */
export async function alertWebhookFailure(
  eventType: string,
  userId: string | null,
  error: Error
): Promise<void> {
  await sendAlert(
    'critical',
    `Stripe webhook processing failed: ${eventType}`,
    {
      eventType,
      userId: userId || 'unknown',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Alert for payment processing failures
 */
export async function alertPaymentFailure(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  await sendAlert(
    'warning',
    `Payment failed for user ${userId}`,
    {
      userId,
      amount: `$${(amount / 100).toFixed(2)}`,
      reason,
    }
  );
}

/**
 * Alert for database operation failures
 */
export async function alertDatabaseFailure(
  operation: string,
  error: Error
): Promise<void> {
  await sendAlert(
    'critical',
    `Database operation failed: ${operation}`,
    {
      operation,
      error: error.message,
    }
  );
}

/**
 * Alert for rate limit threshold exceeded
 */
export async function alertRateLimitExceeded(
  identifier: string,
  hitCount: number
): Promise<void> {
  await sendAlert(
    'warning',
    `Potential attack: Rate limit exceeded ${hitCount} times`,
    {
      identifier,
      hitCount,
    }
  );
}
