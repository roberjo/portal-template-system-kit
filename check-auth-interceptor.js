const { ESLint } = require('eslint');

async function main() {
  // Create an instance with the configuration
  const eslint = new ESLint({
    overrideConfigFile: './eslint.ci.config.js',
    extensions: ['.ts', '.tsx']
  });

  // Lint files
  const results = await eslint.lintFiles(['src/api/auth-interceptor.ts']);

  // Format the results
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  // Output the results
  console.log(resultText);
  
  // Return success (0) if there are no errors
  process.exit(results.some(result => result.errorCount > 0) ? 1 : 0);
}

main().catch(error => {
  console.error('Error running ESLint:', error);
  process.exit(1);
}); 