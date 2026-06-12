$base = "http://localhost:5000/api"
$log = ""

function T($name, $method, $path, $body, $token, $expectFail) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        $p = @{ Method=$method; Uri="$base$path"; Headers=$h; TimeoutSec=5 }
        if ($body) { $p["Body"] = ($body | ConvertTo-Json -Depth 3) }
        $r = Invoke-RestMethod @p
        $pass = -not $expectFail
        $script:log += "$( if($pass){'PASS'} else {'FAIL'} ) $name`n"
        return $r
    } catch {
        $st = [int]$_.Exception.Response.StatusCode.value__
        try { $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch { $msg = "err" }
        $pass = $expectFail -and ($st -eq 403 -or $st -eq 401)
        $script:log += "$( if($pass){'PASS'} else {'FAIL'} ) [$st] $name - $msg`n"
        return $null
    }
}

$aD  = T "Admin Login"    POST "/auth/login" @{email="admin@giftingbliss.com";password="Admin@GiftingBliss123"} $null $false
$fD  = T "Finance Login"  POST "/auth/login" @{email="finance@giftingbliss.com";password="finance123456"} $null $false
$stD = T "Staff Login"    POST "/auth/login" @{email="staff@giftingbliss.com";password="staff123456"} $null $false
$spD = T "Support Login"  POST "/auth/login" @{email="support@giftingbliss.com";password="support123456"} $null $false
$cD  = T "Customer Login" POST "/auth/login" @{email="customer@giftingbliss.com";password="customer123456"} $null $false

$aT="$($aD.token)"; $fT="$($fD.token)"; $stT="$($stD.token)"; $spT="$($spD.token)"; $cT="$($cD.token)"

T "Auth Me (admin)"     GET "/auth/me" $null $aT $false | Out-Null
T "Collections"         GET "/collections" $null $null $false | Out-Null
T "Products"            GET "/products" $null $null $false | Out-Null
T "Orders (admin)"      GET "/orders" $null $aT $false | Out-Null
T "Orders (finance)"    GET "/orders" $null $fT $false | Out-Null
T "Orders (staff)"      GET "/orders" $null $stT $false | Out-Null
T "Orders (support)"    GET "/orders" $null $spT $false | Out-Null
T "Users (admin)"       GET "/users" $null $aT $false | Out-Null
T "Payments/Pending"    GET "/payments/pending" $null $fT $false | Out-Null
T "Inventory"           GET "/inventory" $null $stT $false | Out-Null
T "Support Tickets"     GET "/support/tickets" $null $spT $false | Out-Null
T "Stats Dashboard"     GET "/stats/dashboard" $null $aT $false | Out-Null
T "RBAC Block /orders"  GET "/orders" $null $cT $true | Out-Null
T "RBAC Block /users"   GET "/users" $null $cT $true | Out-Null
T "RBAC Block /stats"   GET "/stats/dashboard" $null $cT $true | Out-Null

$script:log | Out-File "test-results.txt" -Encoding utf8
Write-Host "Tests done. See test-results.txt"
