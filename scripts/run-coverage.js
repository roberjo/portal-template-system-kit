const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');
const open = require('open');

// Ensure the scripts directory exists
const scriptsDir = resolve(__dirname);
if (!existsSync(scriptsDir)) {
  console.error('Error: The scripts directory does not exist.');
  process.exit(1);
}

// Run the tests with coverage
console.log('Running tests with coverage...');
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running tests with coverage:', error.message);
  process.exit(1);
}

// Check if coverage report exists
const htmlReportPath = resolve(__dirname, '../coverage/index.html');
if (!existsSync(htmlReportPath)) {
  console.error('Error: Coverage report not found. Make sure tests are running correctly.');
  process.exit(1);
}

// Open the coverage report in the default browser
console.log('Opening coverage report...');
try {
  open(htmlReportPath);
  console.log('Coverage report opened in your browser.');
} catch (error) {
  console.error('Error opening coverage report:', error.message);
  console.log(`You can manually open the report at: ${htmlReportPath}`);
  process.exit(1);
}

// Print a summary of test coverage
console.log('\nCoverage Summary:');
try {
  execSync('npx nyc report --reporter=text-summary', { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating coverage summary:', error.message);
} 