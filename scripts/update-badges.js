#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get coverage data
const getCoverageData = () => {
  // Possible paths for coverage file
  const possiblePaths = [
    path.resolve('coverage/coverage-summary.json'),
    path.resolve('coverage-report/coverage-summary.json'),
    path.resolve(process.env.GITHUB_WORKSPACE, 'coverage/coverage-summary.json')
  ];
  
  // Try each path
  for (const coveragePath of possiblePaths) {
    try {
      if (fs.existsSync(coveragePath)) {
        console.log(`Found coverage data at: ${coveragePath}`);
        const coverageSummary = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        
        return {
          lines: coverageSummary.total.lines.pct,
          statements: coverageSummary.total.statements.pct,
          functions: coverageSummary.total.functions.pct,
          branches: coverageSummary.total.branches.pct
        };
      }
    } catch (error) {
      console.error(`Error reading coverage data from ${coveragePath}:`, error.message);
    }
  }
  
  // Try to download the artifact if it exists
  try {
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log('Attempting to download the coverage artifact...');
      // Try to create the coverage directory if it doesn't exist
      if (!fs.existsSync('coverage')) {
        fs.mkdirSync('coverage', { recursive: true });
      }
      
      // Generate fallback data
      console.log('Creating fallback coverage data');
      const fallbackData = {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0
      };
      
      return fallbackData;
    }
  } catch (error) {
    console.error('Error handling coverage artifact:', error.message);
  }
  
  console.warn('No coverage data found. Using placeholder values.');
  return null;
};

// Get date for last updated
const getFormattedDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Update README badges
const updateReadmeBadges = () => {
  const readmePath = path.resolve('README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Add or update coverage badge section
  const coverage = getCoverageData();
  if (coverage) {
    const overallCoverage = Math.round(
      (coverage.lines + coverage.statements + coverage.functions + coverage.branches) / 4
    );
    
    const colorCode = 
      overallCoverage >= 90 ? 'brightgreen' :
      overallCoverage >= 80 ? 'green' :
      overallCoverage >= 70 ? 'yellowgreen' :
      overallCoverage >= 60 ? 'yellow' :
      'red';
    
    const coverageBadge = `![Code Coverage](https://img.shields.io/badge/Coverage-${overallCoverage}%25-${colorCode})`;
    
    // Check if badge already exists and update it
    if (readmeContent.includes('![Code Coverage]')) {
      readmeContent = readmeContent.replace(
        /!\[Code Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-[^)]+\)/,
        coverageBadge
      );
    } else {
      // Add after license badge
      readmeContent = readmeContent.replace(
        /(!\[License\]\([^)]+\))/,
        `$1\n${coverageBadge}`
      );
    }
  } else {
    console.log('No coverage data available. Skipping coverage badge update.');
  }
  
  // Add Last Updated badge
  const lastUpdatedBadge = `![Last Updated](https://img.shields.io/badge/Last%20Updated-${getFormattedDate()}-blue)`;
  
  if (readmeContent.includes('![Last Updated]')) {
    readmeContent = readmeContent.replace(
      /!\[Last Updated\]\(https:\/\/img\.shields\.io\/badge\/Last%20Updated-[^)]+\)/,
      lastUpdatedBadge
    );
  } else {
    // Add after coverage badge or license badge
    if (readmeContent.includes('![Code Coverage]')) {
      readmeContent = readmeContent.replace(
        /(!\[Code Coverage\]\([^)]+\))/,
        `$1\n${lastUpdatedBadge}`
      );
    } else {
      readmeContent = readmeContent.replace(
        /(!\[License\]\([^)]+\))/,
        `$1\n${lastUpdatedBadge}`
      );
    }
  }
  
  // Add detailed coverage section in Testing section
  if (coverage) {
    const coverageDetails = `
## 📊 Code Coverage

| Category   | Coverage |
|------------|----------|
| Lines      | ${coverage.lines}% |
| Statements | ${coverage.statements}% |
| Functions  | ${coverage.functions}% |
| Branches   | ${coverage.branches}% |

Last updated: ${getFormattedDate()}
`;

    if (readmeContent.includes('## 📊 Code Coverage')) {
      // Replace existing code coverage section
      readmeContent = readmeContent.replace(
        /## 📊 Code Coverage[\s\S]*?(?=##|$)/,
        coverageDetails
      );
    } else {
      // Add after testing section
      if (readmeContent.includes('## 🧪 Testing')) {
        readmeContent = readmeContent.replace(
          /(## 🧪 Testing[\s\S]*?)(?=##|$)/,
          `$1\n${coverageDetails}`
        );
      } else {
        // Add before Contributing section
        readmeContent = readmeContent.replace(
          /(## 🤝 Contributing)/,
          `${coverageDetails}\n$1`
        );
      }
    }
  } else {
    console.log('No coverage data available. Skipping coverage details section.');
  }
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('README updated with latest badges and coverage information');
};

updateReadmeBadges(); 