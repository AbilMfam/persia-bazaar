# آماده‌سازی دیتابیس Laravel با داده‌های سید (زمان‌بندی Laravel = زمان سرور / سیستم).
# پیش‌نیاز: PHP در PATH، و قبل از اولین اجرا در پوشهٔ backend دستور `composer install` زده باشد (`vendor/autoload`).

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Backend = Join-Path $Root "backend"

if (!(Test-Path (Join-Path $Backend "artisan"))) {
  Write-Error "پوشه backend پیدا نشد: $Backend"
}

Set-Location $Backend

if (!(Test-Path "vendor/autoload.php")) {
  Write-Error "اول در پوشهٔ backend دستور composer install را اجرا کنید تا پوشهٔ vendor ساخته شود."
}

$PhpRoot = if ($env:PERSIA_PHP_ROOT) { $env:PERSIA_PHP_ROOT } else { "C:\xampp\php" }
$PhpExe = Join-Path $PhpRoot "php.exe"
if (!(Test-Path $PhpExe)) {
  if (Get-Command php -ErrorAction SilentlyContinue) {
    $PhpExe = "php"
  }
  else {
    Write-Error "php.exe نیست؛ مسیر XAMPP (`C:\xampp\php`) را چک کن یا متغیر `PERSIA_PHP_ROOT` را بگذار."
  }
}

$envExample = Join-Path $Backend ".env.example"
$envFile = Join-Path $Backend ".env"
if (!(Test-Path $envFile)) {
  Copy-Item $envExample $envFile
}

# اگر APP_KEY در .env واقعاً خالی است، یک‌بار تولید می‌شود (بدون هر بار overwrite کردن کلید موجود).
$keyLine = (Get-Content $envFile -ErrorAction SilentlyContinue | Where-Object { $_ -match '^\s*APP_KEY\s*=' } | Select-Object -First 1)
$keyVal = if ($null -eq $keyLine) { '' } else { ($keyLine -split '=', 2)[1].Trim() }
if (-not $keyVal) {
  & $PhpExe artisan key:generate --force
}

# مهاجرت + سید (ساخت جداول و پر کردن طبق seeders؛ timestamps با now() سرور اعمال می‌شود)
& $PhpExe artisan migrate --seed

Write-Host ""
Write-Host "انجام شد. دیتابیس و سیدها با زمان سیستم ساخته شدند."
Write-Host "کاربر دمو (در صورت وجود در سیدر): demo@digimall.test / password"
