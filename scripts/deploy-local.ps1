param(
    [Parameter(Mandatory = $true)]
    [string]$TargetDirectory
)

$ErrorActionPreference = 'Stop'
$sourceFile = Join-Path $PSScriptRoot '../dist/homeii-music-flow.js'
$sourceFile = (Resolve-Path -LiteralPath $sourceFile).Path
$targetRoot = (Resolve-Path -LiteralPath $TargetDirectory).Path
$targetFile = Join-Path $targetRoot 'homeii-music-flow.js'
$stagedFile = Join-Path $targetRoot ('homeii-music-flow.' + [guid]::NewGuid().ToString('N') + '.pending')
$sourceBytes = [System.IO.File]::ReadAllBytes($sourceFile)
$sourceText = [System.Text.Encoding]::UTF8.GetString($sourceBytes)
if ($sourceText -notmatch 'HOMEII_CARD_VERSION' -or $sourceText -notmatch 'customElements' -or $sourceBytes.Length -lt 100000) {
    throw 'The built card is missing expected runtime markers. Run build and tests first.'
}
$sourceHash = (Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash
$backupDirectory = Join-Path $env:TEMP ('homeii-deployment-backup-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $backupDirectory | Out-Null
if (Test-Path -LiteralPath $targetFile) {
    Copy-Item -LiteralPath $targetFile -Destination (Join-Path $backupDirectory 'homeii-music-flow.js')
}
try {
    # Upload under a temporary name so browsers cannot read a partially copied script.
    Copy-Item -LiteralPath $sourceFile -Destination $stagedFile
    if ((Get-FileHash -LiteralPath $stagedFile -Algorithm SHA256).Hash -ne $sourceHash) {
        throw 'Upload checksum mismatch; the installed card has not been replaced.'
    }
    Move-Item -LiteralPath $stagedFile -Destination $targetFile -Force
    if ((Get-FileHash -LiteralPath $targetFile -Algorithm SHA256).Hash -ne $sourceHash) {
        throw 'Installed checksum mismatch. Restore the printed backup before retrying.'
    }
    Write-Output "Installed $($sourceBytes.Length) bytes. SHA256: $sourceHash"
} finally {
    Write-Output "Backup: $backupDirectory"
    if (Test-Path -LiteralPath $stagedFile) {
        Remove-Item -LiteralPath $stagedFile
    }
}
