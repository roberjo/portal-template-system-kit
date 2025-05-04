#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get coverage data
const getCoverageData = () => {
  try {
    const coverageSummary = JSON.parse(
      fs.readFileSync(path.resolve('coverage/coverage-summary.json'), 'utf8')
    );
    
    return {
      lines: coverageSummary.total.lines.pct,
      statements: coverageSummary.total.statements.pct,
      functions: coverageSummary.total.functions.pct,
      branches: coverageSummary.total.branches.pct
    };
  } catch (error) {
    console.error('Error reading coverage data:', error.message);
    return null;
  }
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
  }
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('README updated with latest badges and coverage information');
};

updateReadmeBadges(); 