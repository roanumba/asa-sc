# Vite + pnpm Migration Guide

## ✅ Configuration Files Created

All Vite configuration files have been created:
- ✅ `vite.config.ts` - Vite configuration with HMR optimization and dynamic base URL
- ✅ `tsconfig.json` - Updated for Vite compatibility
- ✅ `tsconfig.node.json` - Node config for Vite
- ✅ `index.html` - Moved to root with Vite entry point
- ✅ `.npmrc` - pnpm configuration
- ✅ `.gitignore` - Updated for pnpm and Vite
- ✅ `.env` - Environment variables for deployment configuration
- ✅ `.env.example` - Example environment file
- ✅ `src/vite-env.d.ts` - TypeScript definitions for Vite environment

## 🚀 Migration Steps

### Step 1: Configure deployment path
Copy `.env.example` to `.env` and adjust `VITE_BASE_URL` for your deployment:
```bash
cp .env.example .env
# Edit .env and set VITE_BASE_URL to your deployment path
```

Examples:
- Root deployment: `VITE_BASE_URL=/`
- Subdirectory: `VITE_BASE_URL=/asa-aswa/`
- Custom path: `VITE_BASE_URL=/my-app/`

### Step 2: Clean up old dependencies
```bash
rm -rf node_modules package-lock.json
```

### Step 3: Install dependencies with pnpm
```bash
pnpm install
```

### Step 4: Run development server with HMR
```bash
pnpm dev
```
This will start the dev server at http://localhost:3000 with **Fast Refresh HMR** enabled.

### Step 5: Build for production
```bash
pnpm build
```
This will:
1. Run TypeScript type checking
2. Build with Vite using the `VITE_BASE_URL` from `.env`
3. Execute your `scripts/copyProd.js` script to deploy to MAMP

### Step 6: Preview production build
```bash
pnpm preview
```

## 🔧 Deployment Path Configuration

The application now uses environment variables for flexible deployment:

**`.env` file:**
```bash
VITE_BASE_URL=/asa-aswa/
```

This is automatically used by:
1. **Vite** - All asset paths (JS, CSS, images) are prefixed with this base URL
2. **ServerService** - API calls use `import.meta.env.BASE_URL` to construct server endpoints

**To change deployment location:**
1. Update `VITE_BASE_URL` in `.env`
2. Update deployment path in `scripts/copyProd.js` if needed
3. Rebuild with `pnpm build`

**Examples:**
```bash
# Deploy to root
VITE_BASE_URL=/

# Deploy to subdirectory
VITE_BASE_URL=/my-app/

# Deploy to custom path
VITE_BASE_URL=/projects/scholarship-2026/
```

## 🔧 What Changed

### Removed Dependencies (no longer needed)
- ❌ `react-scripts` (Create React App)
- ❌ `@testing-library/*` (testing removed per requirements)
- ❌ `@types/moment` (provides own types)
- ❌ `@types/history` (provides own types)
- ❌ All deprecated Babel plugins

### Updated Dependencies
- ✅ React 18.1.0 → 18.3.1
- ✅ TypeScript 4.7.3 → 5.7.3
- ✅ Bootstrap 5.1.3 → 5.3.3
- ✅ react-bootstrap 2.4.0 → 2.10.7
- ✅ All @types packages to latest

### New Dependencies
- ✅ `vite` 6.0.5
- ✅ `@vitejs/plugin-react` 4.3.4 (with Fast Refresh)

## ⚡ HMR Configuration

Your Vite config includes optimal HMR settings:
- **Fast Refresh** enabled for instant component updates
- **Overlay** enabled for build errors
- **Optimized dependency pre-bundling** for React, Bootstrap, and Router
- **Smart chunk splitting** to separate vendor bundles

## 📝 Code Changes Required

### Environment Variables
If you have any `.env` files, rename variables:
```bash
# OLD (CRA)
REACT_APP_API_URL=https://api.example.com

# NEW (Vite)
VITE_API_URL=https://api.example.com
```

In your code, change:
```typescript
// OLD
const apiUrl = process.env.REACT_APP_API_URL;

// NEW
const apiUrl = import.meta.env.VITE_API_URL;
```

### No other code changes needed!
Your current code in `src/index.tsx` is already compatible with Vite.

## 🎯 Performance Benefits

### Development
- **10-100x faster HMR** - Changes appear instantly
- **Faster startup** - No bundling on dev server start
- **Better DX** - Faster feedback loop

### Production
- **Smaller bundles** - Better tree-shaking
- **Faster builds** - Rollup-based bundling
- **Optimized chunks** - Smart code splitting

### pnpm Benefits
- **50-70% disk space savings** - Hard links to global store
- **Faster installs** - Efficient dependency resolution
- **Strict dependencies** - No phantom dependencies
- **Better security** - Isolated node_modules

## 🔍 Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm dev` | Start dev server | Runs on port 3000 with HMR |
| `pnpm build` | Production build | TypeScript check + Vite build + copyProd |
| `pnpm preview` | Preview build | Test production build locally |

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
server: { port: 3001 }
```

### Issue: Module not found after migration
```bash
# Clear pnpm cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript errors
```bash
# Ensure all @types packages are installed
pnpm add -D @types/node @types/react @types/react-dom
```

## 📚 Next Steps

1. Run `pnpm install` to set up dependencies
2. Test dev server with `pnpm dev`
3. Verify HMR is working by editing a component
4. Test production build with `pnpm build && pnpm preview`
5. Update any CI/CD pipelines to use `pnpm` instead of `npm`

## 🎉 You're All Set!

Your project is now configured for Vite + pnpm with optimized HMR. The development experience will be significantly faster!
