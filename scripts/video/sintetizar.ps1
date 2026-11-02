# Gera um WAV por trecho da narracao (voz Microsoft Maria pt-BR, local, sem chaves).
param([string]$Saida = "$PSScriptRoot\saida")
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force $Saida | Out-Null
$trechos = Get-Content "$PSScriptRoot\narracao.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$i = 0
foreach ($t in $trechos) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice("Microsoft Maria Desktop")
  $s.Rate = 1
  $s.SetOutputToWaveFile("$Saida\seg-$i.wav")
  $s.Speak($t.texto)
  $s.Dispose()
  $i++
}
Write-Host "ok: $i trechos"

