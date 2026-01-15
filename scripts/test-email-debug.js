/**
 * Debug Email Test - Shows detailed error information
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

console.log('='.repeat(60));
console.log('Email Debug Test');
console.log('='.repeat(60));
console.log('\n1. Checking API Key...');

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in .env.local');
  process.exit(1);
}

console.log(`✅ API Key found: ${RESEND_API_KEY.substring(0, 10)}...`);

const resend = new Resend(RESEND_API_KEY);

async function testEmail() {
  const toEmail = process.argv[2] || 'james.burnsmmm@gmail.com';

  console.log('\n2. Attempting to send email...');
  console.log(`   To: ${toEmail}`);
  console.log(`   From: VoyagrIQ <notifications@voyagriq.com>`);

  try {
    const result = await resend.emails.send({
      from: 'VoyagrIQ <notifications@voyagriq.com>',
      to: toEmail,
      subject: 'Test Email from VoyagrIQ',
      html: '<h1>Test</h1><p>This is a test email from VoyagrIQ.</p>',
    });

    console.log('\n✅ Email API call successful!');
    console.log('\n3. Full Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.error) {
      console.log('\n❌ Error in response:');
      console.log(JSON.stringify(result.error, null, 2));
      console.log('\nPossible issues:');
      console.log('- Domain not verified in Resend');
      console.log('- DNS records not propagated yet');
      console.log('- Sender email (notifications@voyagriq.com) not configured in Resend');
    } else if (result.data && result.data.id) {
      console.log('\n✅ Email sent successfully!');
      console.log(`   Email ID: ${result.data.id}`);
      console.log('\n4. Next steps:');
      console.log('   - Check Resend dashboard: https://resend.com/emails');
      console.log(`   - Check inbox: ${toEmail}`);
      console.log('   - Check spam folder');
    }

  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('\n   Full error response:');
      console.error(JSON.stringify(error.response, null, 2));
    }

    console.log('\n🔍 Troubleshooting:');
    console.log('1. Verify domain at: https://resend.com/domains');
    console.log('2. Check DNS records in Vercel');
    console.log('3. Ensure notifications@voyagriq.com is verified in Resend');
  }
}

testEmail();
