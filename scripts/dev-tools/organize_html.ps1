$ErrorActionPreference = 'Stop'

$basePath = "c:\Users\diwas\OneDrive\Documents\Desktop\school management saraswati"
$htmlPath = Join-Path $basePath "html"

New-Item -ItemType Directory -Force -Path $htmlPath | Out-Null

$allHtmlFiles = Get-ChildItem -Path $basePath -File -Filter "*.html"
$movedHtmlFiles = $allHtmlFiles | Where-Object { $_.Name -ne "index.html" }
$movedNames = $movedHtmlFiles.Name

# 1. Update index.html
$indexFile = Join-Path $basePath "index.html"
if (Test-Path $indexFile) {
    $indexContent = [System.IO.File]::ReadAllText($indexFile)
    $originalIndex = $indexContent
    
    foreach ($name in $movedNames) {
        $indexContent = $indexContent.Replace("href=`"$name`"", "href=`"html/$name`"")
        $indexContent = $indexContent.Replace("href='$name'", "href='html/$name'")
        $indexContent = $indexContent.Replace("src=`"$name`"", "src=`"html/$name`"")
        $indexContent = $indexContent.Replace("src='$name'", "src='html/$name'")
    }
    
    if ($indexContent -cne $originalIndex) {
        [System.IO.File]::WriteAllText($indexFile, $indexContent)
    }
}

# 2. Move files
foreach ($file in $movedHtmlFiles) {
    Move-Item -Path $file.FullName -Destination $htmlPath -Force
}

# 3. Update moved files
$newHtmlFiles = Get-ChildItem -Path $htmlPath -File -Filter "*.html"
foreach ($htmlFile in $newHtmlFiles) {
    $content = [System.IO.File]::ReadAllText($htmlFile.FullName)
    $original = $content
    
    # a. Fix link to index.html
    $content = $content.Replace("href=`"index.html`"", "href=`"../index.html`"")
    $content = $content.Replace("href='index.html'", "href='../index.html'")
    
    # b. Fix paths to js/ and images/ and css/
    $content = $content.Replace("src=`"js/", "src=`"../js/")
    $content = $content.Replace("src='js/", "src='../js/")
    $content = $content.Replace("href=`"css/", "href=`"../css/")
    $content = $content.Replace("href='css/", "href='../css/")
    
    $content = $content.Replace("src=`"images/", "src=`"../images/")
    $content = $content.Replace("src='images/", "src='../images/")
    $content = $content.Replace("href=`"images/", "href=`"../images/")
    $content = $content.Replace("href='images/", "href='../images/")
    $content = $content.Replace("url('images/", "url('../images/")
    $content = $content.Replace("url(`"images/", "url(`"../images/")
    $content = $content.Replace("url(images/", "url(../images/")
    
    $content = $content.Replace("this.src='images/", "this.src='../images/")
    $content = $content.Replace("this.src=`"images/", "this.src=`"../images/")
    
    if ($content -cne $original) {
        [System.IO.File]::WriteAllText($htmlFile.FullName, $content)
    }
}

Write-Output "HTML organization complete!"
