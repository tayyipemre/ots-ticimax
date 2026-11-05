param(
    [string]$Output = (Join-Path $PSScriptRoot 'yorumlar.json'),
    [ValidatePattern('^\d+$')][string]$SellerId = '116614',
    [switch]$StoreWithImages
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-ReviewJson([string]$Url) {
    for ($attempt = 0; $attempt -lt 3; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 60 -Headers @{
                Accept = 'application/json'
                'Accept-Language' = 'tr-TR,tr;q=0.9'
            } -UserAgent 'Mozilla/5.0'
            return ($response.Content | ConvertFrom-Json)
        } catch {
            if ($attempt -eq 2) { throw }
            Start-Sleep -Seconds (3 * ($attempt + 1))
        }
    }
}

function ConvertTo-PublicReview($Raw, [string]$Kind) {
    if ($null -eq $Raw.id) { throw 'Review ID missing' }
    $rate = $Raw.rate
    if ($Kind -eq 'store') {
        $rate = 0
        foreach ($rating in $Raw.ratings) {
            if ($rating.voteType -eq 'SELLER') {
                $rate = $rating.vote.rate
                break
            }
        }
    }
    # PowerShell 7 ISO metni DateTime'a cevirir; [string] bolgesel bicim uretmesin.
    if ($Raw.commentDateISOType -is [datetime]) { $date = $Raw.commentDateISOType.ToString('yyyy-MM-dd') }
    else { $date = [string]$Raw.commentDateISOType }
    if (!$date -and $Raw.creationDate) {
        # Turkiye saati (UTC+3): gece 00-03 arasi yorumlar onceki gun gorunmesin.
        $date = ([datetime]'1970-01-01T00:00:00Z').ToUniversalTime().AddMilliseconds([double]$Raw.creationDate).AddHours(3).ToString('yyyy-MM-dd')
    }
    $product = @{}
    foreach ($key in @('title', 'link')) {
        if ($null -ne $Raw.product -and $null -ne $Raw.product.$key) { $product[$key] = $Raw.product.$key }
    }
    $media = @(
        foreach ($item in $Raw.mediaFiles) {
            if ($item.mediaType -and $item.mediaType -ne 'IMAGE') { continue }
            $entry = @{}
            foreach ($key in @('url', 'thumbnailUrl', 'mobileUrl', 'mediaType')) {
                if ($null -ne $item.$key) { $entry[$key] = $item.$key }
            }
            $entry
        }
    )
    # Exclude user IDs, shipment numbers and order details from the public file.
    return @{
        id = [string]$Raw.id; comment = [string]$Raw.comment
        userFullName = [string]$Raw.userFullName; date = $date; rate = $rate
        product = $product; mediaFiles = $media
    }
}

function Get-AllReviews([string]$Kind) {
    $endpoint = 'product-reviews'
    $key = 'productReviews'
    $summaryKey = 'contentSummary'
    if ($Kind -eq 'store') {
        $endpoint = 'seller-reviews'
        $key = 'sellerReviews'
        $summaryKey = 'sellerProfileSummary'
    }
    $reviews = New-Object 'System.Collections.Generic.List[object]'
    $seen = @{}
    $page = 0
    $summary = $null
    do {
        $url = "https://apigw.trendyol.com/discovery-sellerstore-gateway-service/api/ugc/${endpoint}?sellerId=${SellerId}&page=${page}&size=20&isMarketplaceMember=true&countryCode=TR&language=tr&storefrontId=1&culture=tr-TR"
        if ($Kind -eq 'store' -and $StoreWithImages) { $url += '&withImage=true' }
        $data = Get-ReviewJson $url
        $block = $data.$key
        if ($null -eq $block -or $block.content -isnot [array]) { throw "${Kind}: Invalid API schema" }
        $total = $block.totalPages
        if (($total -isnot [int] -and $total -isnot [long]) -or $total -lt 0 -or $total -gt 10000 -or $null -eq $block.page -or $block.page -ne $page) {
            throw "${Kind}: Invalid pagination"
        }
        if ($block.content.Count -eq 0 -and $page -lt $total) { throw "${Kind}: Unexpected empty page" }
        if ($page -eq 0) { $summary = $data.$summaryKey }
        foreach ($raw in $block.content) {
            $review = ConvertTo-PublicReview $raw $Kind
            if (!$seen.ContainsKey($review.id)) {
                $seen[$review.id] = $true
                $reviews.Add($review)
            }
        }
        $page++
        Write-Host "${Kind}: page $page/$total, $($reviews.Count) reviews"
        if ($page -lt $total) { Start-Sleep -Seconds 3 }
    } while ($page -lt $total)
    return @{ reviews = $reviews.ToArray(); summary = $summary; count = $reviews.Count }
}

$lockStream = $null
$tempPath = $null
$backupPath = $null
try {
    $outputPath = [IO.Path]::GetFullPath($Output)
    $lockPath = [IO.Path]::ChangeExtension($outputPath, '.lock')
    # The exclusive handle also releases automatically if the process is terminated.
    $lockStream = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $data = @{ schemaVersion = 1; sellerId = $SellerId }
    $data.store = Get-AllReviews 'store'
    $data.product = Get-AllReviews 'product'
    $data.updatedAt = [datetime]::UtcNow.ToString('o')
    $json = ConvertTo-Json -InputObject $data -Depth 30 -Compress
    $null = $json | ConvertFrom-Json
    $tempPath = $outputPath + '.' + [guid]::NewGuid().ToString('N') + '.tmp'
    [IO.File]::WriteAllText($tempPath, $json, (New-Object System.Text.UTF8Encoding($false)))
    if ([IO.File]::Exists($outputPath)) {
        # File.Replace requires a real backup path on Windows PowerShell.
        # A unique temporary backup keeps replacement atomic without touching
        # any user-created .bak file.
        $backupPath = $outputPath + '.' + [guid]::NewGuid().ToString('N') + '.bak'
        [IO.File]::Replace($tempPath, $outputPath, $backupPath, $true)
    } else {
        [IO.File]::Move($tempPath, $outputPath)
    }
    Write-Host "Saved: $outputPath"
} catch {
    [Console]::Error.WriteLine("ERROR: $($_.Exception.Message). Existing JSON was preserved.")
    exit 1
} finally {
    if ($tempPath -and [IO.File]::Exists($tempPath)) { [IO.File]::Delete($tempPath) }
    if ($backupPath -and [IO.File]::Exists($backupPath)) { [IO.File]::Delete($backupPath) }
    # Keep the empty lock file: deleting it could race with another waiting process.
    if ($lockStream) { $lockStream.Dispose() }
}
