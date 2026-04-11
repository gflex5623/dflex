import urllib.request
import zipfile
import os

url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
print("Downloading cloudflared...", flush=True)
urllib.request.urlretrieve(url, "cloudflared.exe")
print("Done!", flush=True)
