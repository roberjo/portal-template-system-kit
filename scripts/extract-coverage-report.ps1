# Extract coverage report for badge updating
# This script helps extract coverage reports from downloaded artifacts

# Check if coverage-report.zip exists in the current directory
if (Test-Path -Path "coverage-report.zip") {
    Write-Output "Found coverage-report.zip, extracting..."
    
    # Create the coverage-report directory if it doesn't exist
    if (-not (Test-Path -Path "coverage-report")) {
        New-Item -ItemType Directory -Path "coverage-report" -Force
    }
    
    # Extract the ZIP file
    Expand-Archive -Path "coverage-report.zip" -DestinationPath "coverage-report" -Force
    
    Write-Output "Successfully extracted coverage-report.zip to coverage-report/"
} else {
    # Check in some common locations for the artifact
    $possibleLocations = @(
        "coverage-report.zip",
        "artifacts/coverage-report.zip",
        "downloads/coverage-report.zip"
    )
    
    $found = $false
    foreach ($location in $possibleLocations) {
        if (Test-Path -Path $location) {
            Write-Output "Found coverage report at $location, extracting..."
            
            # Create the coverage-report directory if it doesn't exist
            if (-not (Test-Path -Path "coverage-report")) {
                New-Item -ItemType Directory -Path "coverage-report" -Force
            }
            
            # Extract the ZIP file
            Expand-Archive -Path $location -DestinationPath "coverage-report" -Force
            
            $found = $true
            Write-Output "Successfully extracted $location to coverage-report/"
            break
        }
    }
    
    if (-not $found) {
        Write-Output "No coverage report ZIP file found."
        Write-Output "Please download the coverage-report.zip artifact from GitHub Actions and place it in this directory."
    }
}

# Check if coverage-report directory now contains coverage-summary.json
if (Test-Path -Path "coverage-report/coverage-summary.json") {
    Write-Output "Coverage report extracted successfully and contains coverage-summary.json"
    Write-Output "You can now run 'npm run update:badges' to update your README"
} else {
    Write-Output "WARNING: Extracted coverage-report does not contain coverage-summary.json"
    Write-Output "The badge update script may not work correctly."
} 