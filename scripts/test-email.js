/**
 * Test Email Script
 *
 * Tests the Resend email integration by sending test emails
 *
 * Usage:
 *   node scripts/test-email.js your-email@example.com
 */

const { Resend } = require('resend');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY not found in .env.local');
  console.error('   Please add: RESEND_API_KEY=re_your_key_here');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// Get email from command line argument
const toEmail = process.argv[2];

if (!toEmail) {
  console.error('❌ Error: Please provide an email address');
  console.error('   Usage: node scripts/test-email.js your-email@example.com');
  process.exit(1);
}

async function testWelcomeEmail() {
  console.log('\n📧 Testing Welcome Email...');
  console.log('   To:', toEmail);
  console.log('   From: VoyagrIQ <notifications@voyagriq.com>');

  const subject = `Welcome to VoyagrIQ Premium Plan! 🎉`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VoyagrIQ</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VoyagrIQ!</h1>
  </div>

  <div style="background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">

    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for choosing VoyagrIQ <strong>Premium</strong> plan!
    </p>

    <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">How VoyagrIQ Helps Your Business</h2>
      <ul style="padding-left: 20px; margin: 15px 0;">
        <li style="margin-bottom: 10px;"><strong>Save Time:</strong> Automate trip reporting and expense tracking</li>
        <li style="margin-bottom: 10px;"><strong>Increase Accuracy:</strong> Eliminate manual data entry errors</li>
        <li style="margin-bottom: 10px;"><strong>Gain Insights:</strong> Understand your travel costs and patterns</li>
        <li style="margin-bottom: 10px;"><strong>Professional Reports:</strong> Export beautiful PDFs for clients and stakeholders</li>
        <li style="margin-bottom: 10px;"><strong>Scale Efficiently:</strong> Manage unlimited trips with ease</li>
      </ul>
    </div>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">🚀 Get Started</h3>
      <p style="margin: 10px 0;">
        <a href="https://voyagriq.com/trips" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">
          Start Adding Trips
        </a>
      </p>
    </div>

    <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>💡 Pro Tip:</strong> Import your existing trip data using our bulk CSV upload feature to get up and running quickly!
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <div style="background: white; padding: 20px; border-radius: 4px; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; font-size: 18px; color: #374151;">Need Help?</h3>
      <p style="margin: 10px 0;">
        We're here to help you succeed! If you have any questions, run into issues, or need guidance getting started:
      </p>
      <p style="margin: 15px 0;">
        <strong>📧 Email us:</strong> <a href="mailto:james@voyagriq.com" style="color: #667eea; text-decoration: none;">james@voyagriq.com</a>
      </p>
      <p style="margin: 10px 0; color: #6b7280; font-size: 14px;">
        We typically respond within 24 hours (often much faster!)
      </p>
    </div>

    <div style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        You're subscribed to the <strong>Premium</strong> plan (monthly billing)
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        <a href="https://voyagriq.com/account" style="color: #667eea; text-decoration: none;">Manage your subscription</a>
      </p>
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        VoyagrIQ - Travel Intelligence for Modern Businesses
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        <a href="https://voyagriq.com" style="color: #9ca3af; text-decoration: none;">voyagriq.com</a>
      </p>
    </div>

  </div>

</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'VoyagrIQ <notifications@voyagriq.com>',
      to: toEmail,
      subject: subject,
      html: html,
    });

    console.log('✅ Welcome email sent successfully!');
    console.log('   Email ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return false;
  }
}

async function testRenewalEmail() {
  console.log('\n📧 Testing Renewal Email...');
  console.log('   To:', toEmail);
  console.log('   From: VoyagrIQ <notifications@voyagriq.com>');

  const subject = `Your VoyagrIQ Premium subscription has been renewed`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Renewed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Renewed ✓</h1>
  </div>

  <div style="background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">

    <p style="font-size: 16px; margin-bottom: 20px;">
      Your VoyagrIQ <strong>Premium</strong> subscription has been successfully renewed.
    </p>

    <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Plan:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600;">Premium</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Billing:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600;">Monthly</td>
        </tr>
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Amount:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #667eea; font-size: 18px;">$49.00</td>
        </tr>
      </table>
    </div>

    <div style="background: #d1fae5; border: 1px solid #6ee7b7; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46;">
        <strong>✓ Payment Successful</strong><br>
        <span style="font-size: 14px;">A receipt has been sent to your email.</span>
      </p>
    </div>

    <p style="margin: 25px 0;">
      Thank you for continuing to use VoyagrIQ! Your subscription gives you uninterrupted access to:
    </p>

    <ul style="padding-left: 20px; margin: 15px 0;">
      <li style="margin-bottom: 8px;">Unlimited trip tracking and reporting</li>
      <li style="margin-bottom: 8px;">Professional PDF, Excel, and CSV exports</li>
      <li style="margin-bottom: 8px;">Advanced analytics and insights</li>
      <li style="margin-bottom: 8px;">Priority customer support</li>
    </ul>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <div style="background: white; padding: 20px; border-radius: 4px; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; font-size: 18px; color: #374151;">Questions or Issues?</h3>
      <p style="margin: 10px 0;">
        If you have any questions about your subscription or need assistance:
      </p>
      <p style="margin: 15px 0;">
        <strong>📧 Email us:</strong> <a href="mailto:james@voyagriq.com" style="color: #667eea; text-decoration: none;">james@voyagriq.com</a>
      </p>
    </div>

    <div style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        <a href="https://voyagriq.com/account" style="color: #667eea; text-decoration: none;">Manage your subscription</a> •
        <a href="https://voyagriq.com/trips" style="color: #667eea; text-decoration: none;">View your trips</a>
      </p>
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        VoyagrIQ - Travel Intelligence for Modern Businesses
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        <a href="https://voyagriq.com" style="color: #9ca3af; text-decoration: none;">voyagriq.com</a>
      </p>
    </div>

  </div>

</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'VoyagrIQ <notifications@voyagriq.com>',
      to: toEmail,
      subject: subject,
      html: html,
    });

    console.log('✅ Renewal email sent successfully!');
    console.log('   Email ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending renewal email:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('VoyagrIQ Email Test');
  console.log('='.repeat(60));

  const welcomeSuccess = await testWelcomeEmail();

  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000));

  const renewalSuccess = await testRenewalEmail();

  console.log('\n' + '='.repeat(60));
  console.log('Test Results:');
  console.log('='.repeat(60));
  console.log(`Welcome Email: ${welcomeSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Renewal Email: ${renewalSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('\n📬 Check your inbox (and spam folder) at:', toEmail);
  console.log('\n💡 Tip: Check Resend dashboard for delivery status:');
  console.log('   https://resend.com/emails\n');
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
