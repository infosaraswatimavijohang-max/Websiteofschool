$ErrorActionPreference = 'Stop'

$basePath = "c:\Users\diwas\OneDrive\Documents\Desktop\school management saraswati"
$jsPath = Join-Path $basePath "js"
$imgPath = Join-Path $basePath "images"
$sqlPath = Join-Path $basePath "sql"
$cssPath = Join-Path $basePath "css"
$docsPath = Join-Path $basePath "docs"

# Create directories
New-Item -ItemType Directory -Force -Path $jsPath | Out-Null
New-Item -ItemType Directory -Force -Path $imgPath | Out-Null
New-Item -ItemType Directory -Force -Path $sqlPath | Out-Null
New-Item -ItemType Directory -Force -Path $cssPath | Out-Null
New-Item -ItemType Directory -Force -Path $docsPath | Out-Null

# List files
$jsFiles = Get-ChildItem -Path $basePath -File -Filter "*.js"
$imgFiles = Get-ChildItem -Path $basePath -File | Where-Object { $_.Extension -in @(".jpg", ".png", ".jpeg", ".gif", ".svg") }
$sqlFiles = Get-ChildItem -Path $basePath -File -Filter "*.sql"
$mdFiles = Get-ChildItem -Path $basePath -File -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
$htmlFiles = Get-ChildItem -Path $basePath -File -Filter "*.html"

# Arrays of file names
$jsNames = $jsFiles.Name
$imgNames = $imgFiles.Name

# Move files
foreach ($file in $jsFiles) { Move-Item -Path $file.FullName -Destination $jsPath -Force }
foreach ($file in $imgFiles) { Move-Item -Path $file.FullName -Destination $imgPath -Force }
foreach ($file in $sqlFiles) { Move-Item -Path $file.FullName -Destination $sqlPath -Force }
foreach ($file in $mdFiles) { Move-Item -Path $file.FullName -Destination $docsPath -Force }

# Update references in HTML files
foreach ($htmlFile in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($htmlFile.FullName)
    $original = $content
    
    foreach ($js in $jsNames) {
        $content = $content.Replace("src=`"$js`"", "src=`"js/$js`"")
        $content = $content.Replace("src='$js'", "src='js/$js'")
    }
    
    foreach ($img in $imgNames) {
        $content = $content.Replace("src=`"$img`"", "src=`"images/$img`"")
        $content = $content.Replace("src='$img'", "src='images/$img'")
        $content = $content.Replace("href=`"$img`"", "href=`"images/$img`"")
        $content = $content.Replace("href='$img'", "href='images/$img'")
        $content = $content.Replace("url('$img')", "url('images/$img')")
        $content = $content.Replace("url(`"$img`")", "url(`"images/$img`")")
        $content = $content.Replace("url($img)", "url(images/$img)")
        
        $content = $content.Replace("this.src='$img'", "this.src='images/$img'")
        $content = $content.Replace("this.src=`"$img`"", "this.src=`"images/$img`"")
    }
    
    # Extra fallback patterns found during search
    $content = $content.Replace("this.src='img1.jpg'", "this.src='images/img1.jpg'")
    $content = $content.Replace("this.src='img2.jpg'", "this.src='images/img2.jpg'")
    $content = $content.Replace("this.src='img3.jpg'", "this.src='images/img3.jpg'")
    $content = $content.Replace("this.src='img.png'", "this.src='images/img.png'")
    
    if ($content -cne $original) {
        [System.IO.File]::WriteAllText($htmlFile.FullName, $content)
    }
}

Write-Output "Organization complete!"
