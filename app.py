import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

try:
    from main import app
except Exception as e:
    print(f"STARTUP ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)
