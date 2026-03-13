# LandedNZ Development Commands Reference
# Complete command reference for manual testing and development

---

## Development Environment Setup

### Initial Project Setup
```bash
# Clone and setup dependencies
cd /Users/ruchira/Development/landednz
npm install

# Setup iOS dependencies (required after any npm install)
cd /Users/ruchira/Development/landednz/apps/mobile/ios
pod install
```

### Environment Configuration
```bash
# Copy environment templates (if they exist)
cp .env.example .env.local

# Check environment variables are set
printenv | grep -E "(SUPABASE_|API_|DATABASE_)"
```

---

## API Server Operations

### Development Server
```bash
# Start API server (from project root)
cd /Users/ruchira/Development/landednz
npm run dev:api

# Start with specific port
cd /Users/ruchira/Development/landednz/apps/api
npm run dev

# Check if server is running
curl http://127.0.0.1:3000/health
```

### API Testing
```bash
# Test auth verify endpoint
curl -X POST http://127.0.0.1:3000/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'

# Test health endpoint
curl http://127.0.0.1:3000/health
```

---

## iOS Simulator & React Native

### Reliable iOS Build Sequence (ALWAYS USE THIS)
```bash
# Navigate to iOS project
cd /Users/ruchira/Development/landednz/apps/mobile/ios

# Build for Release configuration (most reliable)
xcodebuild -workspace LandedNZ.xcworkspace \
  -scheme LandedNZ \
  -configuration Release \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build

# Boot simulator
xcrun simctl boot "iPhone 17 Pro"

# Install app on simulator
xcrun simctl install "iPhone 17 Pro" \
  /Users/ruchira/Library/Developer/Xcode/DerivedData/LandedNZ-*/Build/Products/Release-iphonesimulator/LandedNZ.app

# Launch app
xcrun simctl launch "iPhone 17 Pro" com.landednz.app
```

### Simulator Management
```bash
# List all simulators
xcrun simctl list devices

# Check which simulators are booted
xcrun simctl list devices | grep "(Booted)"

# Shutdown specific simulator
xcrun simctl shutdown "iPhone 17 Pro"

# Shutdown all simulators
xcrun simctl shutdown all

# Reset simulator (clears all data, apps, settings)
xcrun simctl erase "iPhone 17 Pro"

# Open Simulator app (ensures window visibility)
open -a Simulator
```

### React Native Operations
```bash
# Clear Metro cache (if Metro issues occur)
cd /Users/ruchira/Development/landednz/apps/mobile
npx react-native start --reset-cache

# Clear all caches (nuclear option)
cd /Users/ruchira/Development/landednz/apps/mobile
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npx react-native start --reset-cache
```

### iOS Development Troubleshooting
```bash
# Clean Xcode build folder
cd /Users/ruchira/Development/landednz/apps/mobile/ios
xcodebuild clean -workspace LandedNZ.xcworkspace -scheme LandedNZ

# View iOS simulator logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "LandedNZ"'

# Check iOS app is installed
xcrun simctl listapps "iPhone 17 Pro" | grep -i landednz
```

---

## Database Operations

### Supabase Local Development
```bash
# Start Supabase local stack
cd /Users/ruchira/Development/landednz
supabase start

# Check Supabase status
supabase status

# Stop Supabase
supabase stop

# Reset Supabase (clears all data)
supabase stop --no-backup
supabase start
```

### PostgreSQL Direct Access
```bash
# Connect to local Supabase PostgreSQL
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Query users table
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT id, email, created_at FROM \"User\" ORDER BY created_at DESC LIMIT 5;"

# Check auth.users (Supabase auth table)
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;"

# Count total users
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT COUNT(*) as user_count FROM \"User\";"
```

### Prisma Operations
```bash
# Apply database migrations
cd /Users/ruchira/Development/landednz/apps/api
npx prisma migrate dev

# View current database schema
npx prisma db push --accept-data-loss  # DEVELOPMENT ONLY

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

---

## Git Operations

### Standard Workflow
```bash
# Check git status
cd /Users/ruchira/Development/landednz
git status

# Create feature branch
git checkout -b feat/description

# Stage specific files (avoid git add .)
git add apps/mobile/src/hooks/useAuth.ts
git add apps/mobile/src/services/api.ts

# Commit with conventional format
git commit -m "feat(mobile): AC-1-06 Google OAuth manual deep link handling

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>"

# Push new branch
git push -u origin feat/description
```

### Verification & Safety
```bash
# Check what will be committed
git diff --cached

# Check TypeScript compilation
cd /Users/ruchira/Development/landednz/apps/api
npx tsc --noEmit

# Run tests before commit
cd /Users/ruchira/Development/landednz
npm test

# View recent commits
git log --oneline -10
```

---

## Testing & Verification

### API Testing
```bash
# Test API server health
curl http://127.0.0.1:3000/health

# Test auth verify with real token (replace YOUR_TOKEN)
curl -X POST http://127.0.0.1:3000/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

### Database Verification
```bash
# Verify user was created after OAuth
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT u.id, u.email, u.created_at,
      CASE WHEN up.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_profile
      FROM \"User\" u
      LEFT JOIN \"UserProfile\" up ON u.id = up.\"userId\"
      ORDER BY u.created_at DESC LIMIT 5;"
```

### Mobile App Testing
```bash
# Check React Native Metro is running
lsof -i :8081

# View React Native logs
cd /Users/ruchira/Development/landednz/apps/mobile
npx react-native log-ios

# Check if deep link scheme is registered
xcrun simctl openurl "iPhone 17 Pro" "landednz://test"
```

---

## Troubleshooting & Logs

### API Server Logs
```bash
# View API server logs (if using pino logger)
cd /Users/ruchira/Development/landednz/apps/api
npm run dev | npx pino-pretty

# Check if API server port is in use
lsof -i :3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### iOS & React Native Logs
```bash
# iOS Simulator system logs
xcrun simctl spawn booted log stream --level=debug

# iOS app specific logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "LandedNZ"'

# React Native packager logs
cd /Users/ruchira/Development/landednz/apps/mobile
npx react-native log-ios --simulator "iPhone 17 Pro"
```

### Network Debugging
```bash
# Test API connectivity from command line
curl -v http://127.0.0.1:3000/health

# Test network from iOS Simulator perspective (should work)
curl -v http://127.0.0.1:3000/health

# This will FAIL from iOS Simulator (localhost doesn't work)
curl -v http://localhost:3000/health
```

---

## Environment-Specific Notes

### iOS Simulator vs Device
- **Simulator**: Use `127.0.0.1` for local API calls, not `localhost`
- **Device**: Use your Mac's IP address (e.g., `192.168.1.100:3000`)
- **Simulator**: Cannot test real App Store purchases (use sandbox)
- **Device**: Can test full RevenueCat flow with sandbox Apple ID

### Local vs Production
- **Local API**: `http://127.0.0.1:3000` (iOS Simulator) or `http://localhost:3000` (web)
- **Production API**: `https://your-api-domain.com`
- **Local Supabase**: URLs from `npx supabase status`
- **Production Supabase**: URLs from Supabase dashboard

### OAuth Flow Differences
- **Local**: Redirect to `landednz://auth/callback` → manual token extraction
- **Production**: Same flow but with production Supabase URLs
- **Deep Links**: Only work on device/simulator, not in Metro/web

---

## Quick Command Groups

### Complete OAuth Test Cycle
```bash
# 1. Ensure clean state
cd /Users/ruchira/Development/landednz/apps/mobile/ios
xcrun simctl shutdown "iPhone 17 Pro"
xcrun simctl erase "iPhone 17 Pro"

# 2. Start services
cd /Users/ruchira/Development/landednz
supabase start
npm run dev:api &

# 3. Build and launch app
cd /Users/ruchira/Development/landednz/apps/mobile/ios
xcodebuild -workspace LandedNZ.xcworkspace -scheme LandedNZ -configuration Release -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
xcrun simctl boot "iPhone 17 Pro"
open -a Simulator
xcrun simctl install "iPhone 17 Pro" /Users/ruchira/Library/Developer/Xcode/DerivedData/LandedNZ-*/Build/Products/Release-iphonesimulator/LandedNZ.app
xcrun simctl launch "iPhone 17 Pro" com.landednz.app

# 4. Test OAuth and verify user creation
# (Manual: tap Sign in with Google, complete flow)
# Then verify:
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT COUNT(*) FROM \"User\";"
```

### Full Clean Rebuild
```bash
# 1. Stop everything
xcrun simctl shutdown all
pkill -f "npm run dev"

# 2. Clean caches
cd /Users/ruchira/Development/landednz/apps/mobile
rm -rf node_modules ios/Pods
cd /Users/ruchira/Development/landednz
npm install
cd apps/mobile/ios && pod install

# 3. Clean Xcode
xcodebuild clean -workspace LandedNZ.xcworkspace -scheme LandedNZ

# 4. Restart services
cd /Users/ruchira/Development/landednz
supabase start
npm run dev:api
```

---

*This file is automatically updated during RPI workflow when new commands are discovered.*