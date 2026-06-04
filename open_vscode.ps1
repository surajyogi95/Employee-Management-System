$paths = @(
  "$env:USERPROFILE\AppData\Local\Programs\Microsoft VS Code\Code.exe",
  "C:\Program Files\Microsoft VS Code\Code.exe",
  "C:\Program Files (x86)\Microsoft VS Code\Code.exe"
)
$codePath = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($codePath) {
  Start-Process $codePath -ArgumentList '"C:\Users\Suraj\.gemini\antigravity-ide\scratch\employee-management"'
} else {
  Write-Error "VS Code not found in default locations."
}
