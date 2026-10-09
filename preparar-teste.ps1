$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot

# Square manifest wrapper: preserve the supplied logo without modifying its pixels.
$logoBytes = [IO.File]::ReadAllBytes((Join-Path $projectRoot 'assets/img/logo.png'))
$logoBase64 = [Convert]::ToBase64String($logoBytes)
$iconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="88" fill="white"/><image x="42" y="48" width="428" height="416" href="data:image/png;base64,$logoBase64"/></svg>
"@
[IO.File]::WriteAllText((Join-Path $projectRoot 'assets/img/app-icon.svg'), $iconSvg, [Text.UTF8Encoding]::new($false))

# Only public site files go into the archive: no briefs, QA captures or scripts.
$publicFiles = @(
  '.htaccess', 'index.html', 'blog.html', 'robots.txt', 'sitemap.xml',
  'llms.txt', 'llms-full.txt', 'humans.txt', 'site.webmanifest',
  'clear-cache.html', 'antispam.php', '.well-known/security.txt'
)
# Blog articles: every artigos/<slug>.html is published and scanned for its images.
$articleFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'artigos') -Filter '*.html' -File | Sort-Object Name | ForEach-Object { "artigos/$($_.Name)" })
if ($articleFiles.Count -eq 0) { throw 'No articles found in artigos/' }
$publicFiles += $articleFiles
# Follow explicit local asset references, including data-before/data-after.
# No dependency on private curation files; works from a fresh Git clone.
$scanFiles = @('index.html', 'blog.html', 'clear-cache.html', 'site.webmanifest') + $articleFiles
$usedAssets = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
for ($scanIndex = 0; $scanIndex -lt $scanFiles.Count; $scanIndex++) {
  $content = Get-Content -LiteralPath (Join-Path $projectRoot $scanFiles[$scanIndex]) -Raw
  foreach ($match in [regex]::Matches($content, 'assets/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g|svg|css|js|woff2?)\b')) {
    $asset = $match.Value
    if ($asset -match '(^|/)\.\.(/|$)') { throw "Invalid asset path: $asset" }
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $asset) -PathType Leaf)) { throw "Missing asset: $asset" }
    if ($usedAssets.Add($asset) -and $asset -match '\.(css|js)$') { $scanFiles += $asset }
  }
}
$publicFiles += @($usedAssets | Sort-Object)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = Join-Path $projectRoot 'snapshine-teste.zip'
$archiveStream = [IO.File]::Open($zipPath, [IO.FileMode]::Create)
$archive = [IO.Compression.ZipArchive]::new($archiveStream, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relativePath in $publicFiles) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing file: $relativePath" }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $sourcePath, $relativePath, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $archive.Dispose()
  $archiveStream.Dispose()
}
Write-Output "Ready: $zipPath ($($publicFiles.Count) files)"
