param(
    [Parameter(Mandatory=$true)]
    [string]$AdminEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$AdminPassword,
    
    [Parameter(Mandatory=$true)]
    [string]$BotToken = "8491819509:AAERt0zFVLwoXh9lj1vqEjV3W7q2GEjw0Ig",
    
    [Parameter(Mandatory=$true)]
    [string]$ChatId = "8498978105",
    
    [string]$ApiUrl = "http://localhost:3000/api",
    
    [string]$IntegrationName = "Telegram orders",
    
    [string]$GroupId = $null
)

Write-Host "Setup Telegram integration" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Step 1: Admin login
Write-Host "`nStep 1: Admin login ($AdminEmail)..." -ForegroundColor Yellow

$loginUrl = "$ApiUrl/admin/login"
$loginBody = @{
    email = $AdminEmail
    password = $AdminPassword
} | ConvertTo-Json -Compress

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $accessToken = $loginResponse.access_token
    
    if (-not $accessToken) {
        throw "Token not received. Check admin email and password."
    }
    
    Write-Host "Login successful!" -ForegroundColor Green
    
} catch {
    Write-Host "Login error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create integration
Write-Host "`nStep 2: Creating Telegram integration..." -ForegroundColor Yellow

$integrationsUrl = "$ApiUrl/integrations"
$integrationBody = @{
    type = "telegram"
    name = $IntegrationName
    description = "Send notifications for new orders"
    status = "active"
    botToken = $BotToken
    chatId = $ChatId
    settings = @{}
} | ConvertTo-Json -Compress

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $accessToken"
}

try {
    $integrationResponse = Invoke-RestMethod -Uri $integrationsUrl -Method Post -Body $integrationBody -ContentType "application/json" -Headers $headers
    $integrationId = $integrationResponse._id
    
    Write-Host "Integration created successfully!" -ForegroundColor Green
    Write-Host "Integration ID: $integrationId" -ForegroundColor Gray
    
} catch {
    Write-Host "Error creating integration: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Add group (optional)
if ($GroupId) {
    Write-Host "`nStep 3: Adding group ID..." -ForegroundColor Yellow
    
    $updateUrl = "$ApiUrl/integrations/$integrationId"
    $updateBody = @{
        settings = @{
            groupId = $GroupId
        }
    } | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri $updateUrl -Method Patch -Body $updateBody -ContentType "application/json" -Headers $headers
        Write-Host "Group ID added successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "Error adding Group ID: $_" -ForegroundColor Yellow
    }
}

# Step 4: Check
Write-Host "`nStep 4: Verifying integration..." -ForegroundColor Yellow

$checkUrl = "$ApiUrl/integrations/type/telegram"

try {
    $checkResponse = Invoke-RestMethod -Uri $checkUrl -Method Get -Headers $headers
    
    if ($checkResponse.Count -gt 0) {
        Write-Host "Telegram integrations found: $($checkResponse.Count)" -ForegroundColor Green
        $checkResponse | ForEach-Object {
            Write-Host "  - $($_.name) [$($_.status)]" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "Error checking: $_" -ForegroundColor Yellow
}

Write-Host "`nDone! Telegram is configured." -ForegroundColor Green
Write-Host "`nTest it by creating an order - you should receive a message in Telegram!" -ForegroundColor Cyan
