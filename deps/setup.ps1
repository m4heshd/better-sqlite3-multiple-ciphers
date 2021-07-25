# ENV
$ErrorActionPreference = "Stop"

# SQLite Info
$SQLITEMC_VER = "v1.3.3"
$API_URL = "https://api.github.com/repos/utelle/SQLite3MultipleCiphers/releases/tags/" + $SQLITEMC_VER

# Paths
$TEMP_PATH = Join-Path $PSScriptRoot "temp"
$SOURCE_PATH = Join-Path $TEMP_PATH "source.zip"
$EXTRACT_PATH = Join-Path $TEMP_PATH "extracted"
$TAR_PATH = Join-Path $PSScriptRoot "sqlite3.tar.gz"

Write-Host "Preparing.."
Remove-Item -Path $TEMP_PATH -Recurse -Force -ErrorAction Ignore

Write-Host "`r`nDiscovering the asset.."
$RESULT = Invoke-WebRequest $API_URL -Method Get | ConvertFrom-Json
$FILE = @($RESULT.assets.name) -match '-amalgamation.zip' | Select-Object -First 1
$DL_URL = @($RESULT.assets.browser_download_url) -match '-amalgamation.zip' | Select-Object -First 1

Write-Host "`r`nDownloading.. ($( $FILE ))"
Invoke-WebRequest -Uri $DL_URL -OutFile (New-Item -Path $SOURCE_PATH -Force)

Write-Host "`r`nExtracting archive.."
Expand-Archive  -Path $SOURCE_PATH -DestinationPath $EXTRACT_PATH

Write-Host "`r`nPreparing source files.."
Remove-Item -Path (Join-Path $EXTRACT_PATH "sqlite3.h")
Rename-Item -Path (Join-Path $EXTRACT_PATH "sqlite3mc_amalgamation.h") -NewName "sqlite3.h"
Rename-Item -Path (Join-Path $EXTRACT_PATH "sqlite3mc_amalgamation.c") -NewName "sqlite3.c"

Write-Host "`r`nCreating tarball.."
Remove-Item -Path $TAR_PATH -Force
tar czf $TAR_PATH -C $EXTRACT_PATH sqlite3.c sqlite3.h sqlite3ext.h

Write-Host "`r`nCleaning up.."
Remove-Item -Path $TEMP_PATH -Recurse -Force

Write-Host "`r`nProcess completed" -ForegroundColor green
