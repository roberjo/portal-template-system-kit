const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: process.env.SONAR_SERVER_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN || '',
  options: {
    'sonar.projectKey': 'portal-template-system-kit',
    'sonar.projectName': 'Portal Template System Kit',
    'sonar.projectVersion': '1.0.0',
    'sonar.sources': 'src',
    'sonar.tests': 'src',
    'sonar.test.inclusions': '**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx',
    'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.coverage.exclusions': '**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/test/**/*',
    'sonar.exclusions': 'node_modules/**/*,build/**/*,coverage/**/*',
  }
}); 