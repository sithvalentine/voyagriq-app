const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('Testing with Resend default domain (onboarding@resend.dev)...\n');

  try {
    // Try sending from the default Resend domain first
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's test domain
      to: 'james@voyagriq.com',
      subject: 'Test Email from VoyagrIQ',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working!</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('\n📬 Check your inbox at: james@voyagriq.com');
    console.log('💡 Also check spam folder');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

test();
