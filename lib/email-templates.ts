// Email templates for VoyagrIQ

export interface WelcomeEmailData {
  firstName: string;
  email: string;
  tier: string;
  trialEndsAt?: string;
}

export function getWelcomeEmailTemplate(data: WelcomeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { firstName, tier, trialEndsAt } = data;

  const isTrial = trialEndsAt && tier !== 'premium';
  const trialText = isTrial
    ? `Your 14-day free trial is active! You won't be charged until ${new Date(trialEndsAt).toLocaleDateString()}.`
    : '';

  const subject = `Welcome to VoyagrIQ${isTrial ? ' - Your Free Trial Starts Now!' : '!'}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .trial-badge {
      background: #10b981;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      display: inline-block;
      margin: 15px 0;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .button:hover {
      background: #5568d3;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .section h3 {
      margin-top: 0;
      color: #667eea;
    }
    .quick-links {
      list-style: none;
      padding: 0;
    }
    .quick-links li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .quick-links li:last-child {
      border-bottom: none;
    }
    .quick-links a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    .quick-links a:hover {
      text-decoration: underline;
    }
    .emoji {
      font-size: 24px;
      margin-right: 8px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
    .checklist {
      list-style: none;
      padding: 0;
    }
    .checklist li {
      padding: 8px 0 8px 30px;
      position: relative;
    }
    .checklist li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to VoyagrIQ!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">Your Travel Cost Intelligence Platform</p>
  </div>

  <div class="content">
    <p style="font-size: 18px; margin-top: 0;">Hi ${firstName}! 👋</p>

    <p>Thank you for joining VoyagrIQ! We're excited to help you track trips, analyze costs, and optimize your travel agency's profitability.</p>

    ${isTrial ? `
    <div style="text-align: center;">
      <div class="trial-badge">
        ✨ ${trialText}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h3><span class="emoji">🚀</span>Get Started in 10 Minutes</h3>
      <p>Follow our quick start guide to add your first trip and see VoyagrIQ in action:</p>
      <p style="text-align: center;">
        <a href="https://github.com/sithvalentine/voyagriq-app/blob/main/docs/QUICK_START.md" class="button">
          Quick Start Guide →
        </a>
      </p>
    </div>

    <div class="section">
      <h3><span class="emoji">✅</span>Your First Day Checklist</h3>
      <ul class="checklist">
        <li>Set your default commission rate in Settings</li>
        <li>Add your first trip (takes 2 minutes)</li>
        <li>Check your dashboard and analytics</li>
        <li>Export a report to see the format</li>
        ${tier !== 'starter' ? '<li>Invite your team members (Settings → Team)</li>' : ''}
      </ul>
    </div>

    <div class="section">
      <h3><span class="emoji">📚</span>Helpful Resources</h3>
      <ul class="quick-links">
        <li>
          <a href="https://github.com/sithvalentine/voyagriq-app/blob/main/docs/USER_GUIDE.md">
            📖 Complete User Guide
          </a> - Everything you need to know
        </li>
        <li>
          <a href="https://github.com/sithvalentine/voyagriq-app/blob/main/docs/knowledge-base/FAQ.md">
            ❓ Frequently Asked Questions
          </a> - Quick answers to common questions
        </li>
        <li>
          <a href="https://github.com/sithvalentine/voyagriq-app/blob/main/docs/knowledge-base/BEST_PRACTICES.md">
            💡 Best Practices
          </a> - Tips for success
        </li>
      </ul>
    </div>

    <div class="section" style="background: #fef3c7; border: 1px solid #fcd34d;">
      <h3 style="color: #d97706;"><span class="emoji">💡</span>Pro Tip</h3>
      <p style="margin: 0;">Start by importing your last 3 months of trips to get meaningful analytics right away${tier !== 'starter' ? '. Use our bulk import feature (Data → Bulk Import) to save time!' : '!'}</p>
    </div>

    <p style="font-size: 16px; margin-top: 30px;">
      <strong>Need help?</strong> Just reply to this email or contact us at
      <a href="mailto:james@voyagriq.com" style="color: #667eea;">james@voyagriq.com</a>
    </p>

    <p style="font-size: 16px;">
      We're here to help you succeed!
    </p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The VoyagrIQ Team</strong>
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://voyagriq.com" class="button">
        Go to VoyagrIQ →
      </a>
    </div>
  </div>

  <div class="footer">
    <p>
      VoyagrIQ - Travel Cost Intelligence Platform<br>
      <a href="https://voyagriq.com" style="color: #667eea;">voyagriq.com</a> |
      <a href="mailto:james@voyagriq.com" style="color: #667eea;">james@voyagriq.com</a>
    </p>
    <p style="font-size: 12px; color: #9ca3af;">
      You're receiving this email because you signed up for VoyagrIQ.
    </p>
  </div>
</body>
</html>
`;

  const text = `
Welcome to VoyagrIQ!

Hi ${firstName}!

Thank you for joining VoyagrIQ! We're excited to help you track trips, analyze costs, and optimize your travel agency's profitability.

${isTrial ? trialText : ''}

GET STARTED IN 10 MINUTES
Follow our quick start guide: https://github.com/sithvalentine/voyagriq-app/blob/main/docs/QUICK_START.md

YOUR FIRST DAY CHECKLIST
✓ Set your default commission rate in Settings
✓ Add your first trip (takes 2 minutes)
✓ Check your dashboard and analytics
✓ Export a report to see the format
${tier !== 'starter' ? '✓ Invite your team members (Settings → Team)' : ''}

HELPFUL RESOURCES
📖 Complete User Guide: https://github.com/sithvalentine/voyagriq-app/blob/main/docs/USER_GUIDE.md
❓ FAQ: https://github.com/sithvalentine/voyagriq-app/blob/main/docs/knowledge-base/FAQ.md
💡 Best Practices: https://github.com/sithvalentine/voyagriq-app/blob/main/docs/knowledge-base/BEST_PRACTICES.md

PRO TIP
Start by importing your last 3 months of trips to get meaningful analytics right away${tier !== 'starter' ? '. Use our bulk import feature (Data → Bulk Import) to save time!' : '!'}

NEED HELP?
Just reply to this email or contact us at james@voyagriq.com

We're here to help you succeed!

Best regards,
The VoyagrIQ Team

---
VoyagrIQ - Travel Cost Intelligence Platform
voyagriq.com | james@voyagriq.com
`;

  return { subject, html, text };
}
