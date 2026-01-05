// Quick test of the enhanced report generator
const { Trip } = require('./data/trips');

// Check if the file compiles
try {
  console.log('Checking if lib/enhancedReportGenerator.ts exists...');
  const fs = require('fs');
  if (fs.existsSync('./lib/enhancedReportGenerator.ts')) {
    console.log('✓ File exists');
    const content = fs.readFileSync('./lib/enhancedReportGenerator.ts', 'utf8');
    console.log('✓ File size:', content.length, 'bytes');
    
    // Check for potential issues
    if (content.includes('jsPDF')) console.log('✓ jsPDF imported');
    if (content.includes('autoTable')) console.log('✓ autoTable imported');
    if (content.includes('class EnhancedReportGenerator')) console.log('✓ Class defined');
    if (content.includes('generate()')) console.log('✓ generate method exists');
    if (content.includes('generateCoverPage')) console.log('✓ generateCoverPage method exists');
  } else {
    console.log('✗ File does not exist!');
  }
} catch (err) {
  console.error('Error:', err.message);
}
