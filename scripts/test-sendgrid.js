#!/usr/bin/env node

/**
 * Test SendGrid email sending
 * Usage: node scripts/test-sendgrid.js your-email@example.com
 */

const sgMail = require('@sendgrid/mail');

async function testEmail(recipientEmail) {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('\nAdd it to your .env.local file:');
    console.log('SENDGRID_API_KEY=SG.your_key_here\n');
    process.exit(1);
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: recipientEmail,
    from: 'noreply@voyagriq.com', // Must be verified sender
    subject: 'VoyagrIQ - Test Email',
    text: 'This is a test email from VoyagrIQ to verify SendGrid setup.',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #3b82f6;">VoyagrIQ Test Email</h1>
        <p>This is a test email to verify your SendGrid setup is working correctly.</p>
        <p>If you received this, your branded email configuration is successful!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Sent from VoyagrIQ<br>
          <a href="https://voyagriq.com" style="color: #3b82f6;">voyagriq.com</a>
        </p>
      </div>
    `,
  };

  try {
    console.log('📧 Sending test email...');
    console.log(`   To: ${recipientEmail}`);
    console.log(`   From: noreply@voyagriq.com`);

    await sgMail.send(msg);

    console.log('\n✅ Email sent successfully!');
    console.log('\nCheck your inbox (and spam folder) for the test email.');
    console.log('If you received it, your branded email setup is complete! 🎉\n');
  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error(error.response?.body || error.message);

    if (error.code === 403) {
      console.log('\n⚠️  Common issues:');
      console.log('   1. Domain not verified in SendGrid');
      console.log('   2. Sender email not verified');
      console.log('   3. Invalid API key\n');
    }

    process.exit(1);
  }
}

// Get recipient email from command line
const recipientEmail = process.argv[2];

if (!recipientEmail || !recipientEmail.includes('@')) {
  console.error('Usage: node scripts/test-sendgrid.js your-email@example.com');
  process.exit(1);
}

testEmail(recipientEmail);
