# پیش‌فرض مسیر PHP روی دستگاه؛ برای نشست همین ترمینال اول PATH را کامل کن (برای Composer و غیره).
# برای اعمال کردن دستی این ترمینال:
#   . .\scripts\use-persia-php.ps1

$PhpRoot = $env:PERSIA_PHP_ROOT
if (-not $PhpRoot) {
  $PhpRoot = "C:\xampp\php"
}
if (!(Test-Path (Join-Path $PhpRoot "php.exe"))) {
  Write-Error "php.exe یافت نشد در: $PhpRoot — مسیر را عوض کن یا متغیر محیطی `PERSIA_PHP_ROOT` را بگذار."
}

$env:Path = "${PhpRoot};" + $env:Path
Write-Host "PATH: PHP از $PhpRoot پیش‌رو شد."
