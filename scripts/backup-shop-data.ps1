param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) "backups")
)

$backendRoot = Join-Path $ProjectRoot "Backend\ShopApi"
$databasePath = Join-Path $backendRoot "shop.db"
$walPath = "$databasePath-wal"
$shmPath = "$databasePath-shm"
$uploadsPath = Join-Path $backendRoot "wwwroot\uploads"

if (-not (Test-Path $databasePath)) {
    throw "Could not find SQLite database at $databasePath"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetRoot = Join-Path $OutputRoot "shop-data-$timestamp"
$targetUploads = Join-Path $targetRoot "uploads"

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

Copy-Item -LiteralPath $databasePath -Destination $targetRoot -Force

if (Test-Path $walPath) {
    Copy-Item -LiteralPath $walPath -Destination $targetRoot -Force
}

if (Test-Path $shmPath) {
    Copy-Item -LiteralPath $shmPath -Destination $targetRoot -Force
}

if (Test-Path $uploadsPath) {
    Copy-Item -LiteralPath $uploadsPath -Destination $targetUploads -Recurse -Force
}

Write-Host "Backup created at: $targetRoot"
