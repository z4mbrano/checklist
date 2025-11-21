"""
Minimal backend startup script without database
"""
import os
import sys

if __name__ == "__main__":
    print("🚀 Starting VRD Check-in System Backend (Minimal Version)")
    print("=" * 60)

    try:
        print("📦 Loading minimal FastAPI application...")
        import uvicorn
        
        print("✅ Uvicorn loaded successfully!")
        print("🔒 Mode: Minimal (No Database)")
        print("📡 Server: http://localhost:8001")
        print("📖 API Docs: http://localhost:8001/docs")
        print("🧪 Test Endpoint: http://localhost:8001/api/v1/test")
        
        print("\n🚀 Starting server...")
        print("Press Ctrl+C to stop")
        print("-" * 50)
        
        # Start the server with the minimal app
        uvicorn.run(
            "app.minimal_main:app",
            host="0.0.0.0", 
            port=8001,  # Use port 8001 instead of 8000
            reload=False,  # Disable reload to avoid multiprocessing issues
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\n💡 Make sure you have installed the required packages:")
        print("   pip install fastapi uvicorn")
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        
    finally:
        print("\n🛑 Backend stopped")