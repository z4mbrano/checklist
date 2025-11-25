# Script to build frontend and prepare for deployment
# Run this from the root of the workspace

# 1. Build Frontend
echo "Building Frontend..."
cd frontend
npm run build
cd ..

# 2. Create static directory in backend
echo "Preparing Backend Static Files..."
if not exist "backend\static" mkdir backend\static

# 3. Copy build files to backend/static
echo "Copying files..."
xcopy /E /I /Y "frontend\dist\*" "backend\static\"

echo "Build complete! Upload the 'backend' folder to KingHost."
