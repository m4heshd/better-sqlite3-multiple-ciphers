# ENV
$ErrorActionPreference = "Stop"

# SQLite Info
$SQLITEMC_VER = "v1.5.5"
$API_URL = "https://api.github.com/repos/utelle/SQLite3MultipleCiphers/releases/tags/" + $SQLITEMC_VER

# Paths
$TEMP_PATH = Join-Path $PSScriptRoot "temp"
$SOURCE_PATH = Join-Path $TEMP_PATH "source.zip"
$EXTRACT_PATH = Join-Path $TEMP_PATH "extracted"
$DEST_PATH = Join-Path $PSScriptRoot "sqlite3"

Write-Host "Preparing.."
Remove-Item -Path $TEMP_PATH -Recurse -Force -ErrorAction Ignore

Write-Host "`r`nDiscovering the asset.."
$RESULT = Invoke-WebRequest $API_URL -Method Get | ConvertFrom-Json
$FILE = @($RESULT.assets.name) -match '-amalgamation.zip' | Select-Object -First 1
$DL_URL = @($RESULT.assets.browser_download_url) -match '-amalgamation.zip' | Select-Object -First 1

Write-Host "`r`nDownloading.. ($( $FILE ))"
Invoke-WebRequest -Uri $DL_URL -OutFile (New-Item -Path $SOURCE_PATH -Force)

Write-Host "`r`nExtracting archive.."
Expand-Archive -Path $SOURCE_PATH -DestinationPath $EXTRACT_PATH

Write-Host "`r`nCopying SQLite3MC source files.."
Remove-Item -Path $DEST_PATH -Recurse -Force -ErrorAction Ignore
New-Item $DEST_PATH -Type Directory
Copy-Item -Path (Join-Path $EXTRACT_PATH "sqlite3mc_amalgamation.h") -Destination (Join-Path $DEST_PATH "sqlite3.h")
Copy-Item -Path (Join-Path $EXTRACT_PATH "sqlite3mc_amalgamation.c") -Destination (Join-Path $DEST_PATH "sqlite3.c")
Copy-Item -Path (Join-Path $EXTRACT_PATH "sqlite3ext.h") -Destination (Join-Path $DEST_PATH "sqlite3ext.h")

Write-Host "`r`nCleaning up.."
Remove-Item -Path $TEMP_PATH -Recurse -Force

Write-Host "`r`nProcess completed" -ForegroundColor green
