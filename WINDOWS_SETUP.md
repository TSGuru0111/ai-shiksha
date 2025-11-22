# 🪟 Windows Setup Guide - AI Tutoring System

## Quick Setup for Windows

### Step 1: Copy the Environment File

**Using PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Using Command Prompt:**
```cmd
copy .env.example .env
```

**Or manually:**
1. Right-click `.env.example`
2. Click "Copy"
3. Right-click in the same folder
4. Click "Paste"
5. Rename the copy to `.env` (remove `.example`)

---

### Step 2: Get Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)

---

### Step 3: Edit the `.env` File

**Open `.env` in Notepad or VS Code:**

```powershell
# Using Notepad
notepad .env

# Using VS Code
code .env
```

**Update these 3 lines:**
```bash
GEMINI_API_KEY=AIzaSyBvGFqVwDxK1jlDP3FJ5nFbMBetho6gjCI  # Your actual key
GOOGLE_CLOUD_PROJECT=ai-tutoring-india                    # Your project ID
FIREBASE_PROJECT_ID=ai-tutoring-india                     # Same as above
```

**Save and close the file** (Ctrl+S)

---

### Step 4: Generate Secrets (Windows)

**Open PowerShell and run:**

```powershell
# Generate SESSION_SECRET
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
$sessionSecret = [Convert]::ToBase64String($bytes)
Write-Host "SESSION_SECRET=$sessionSecret"

# Generate JWT_SECRET
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)
Write-Host "JWT_SECRET=$jwtSecret"
```

**Copy the output and paste into `.env`:**
```bash
SESSION_SECRET=<paste-first-output-here>
JWT_SECRET=<paste-second-output-here>
```

---

### Step 5: Install Dependencies

```powershell
npm install
```

**Wait for installation to complete** (may take 1-2 minutes)

---

### Step 6: Start the Server

```powershell
npm run dev
```

**You should see:**
```
🚀 AI Tutoring System server running on port 8080
📍 Environment: development
🌍 Region: asia-south1
🔗 Health check: http://localhost:8080/health
```

---

### Step 7: Test in Browser

Open your browser and go to:
```
http://localhost:8080
```

**You should see the AI Shiksha welcome screen!** 🎉

---

## Windows-Specific Commands

### File Operations

```powershell
# Copy file
Copy-Item .env.example .env

# View file contents
Get-Content .env

# Edit file
notepad .env
# or
code .env

# Delete file
Remove-Item .env
```

### NPM Commands

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Stop server
Ctrl+C

# Clear npm cache (if issues)
npm cache clean --force

# Reinstall everything
Remove-Item -Recurse -Force node_modules
npm install
```

### Port Issues on Windows

**If port 8080 is already in use:**

1. **Find what's using the port:**
```powershell
netstat -ano | findstr :8080
```

2. **Kill the process:**
```powershell
# Replace <PID> with the number from previous command
taskkill /PID <PID> /F
```

3. **Or change the port in `.env`:**
```bash
PORT=3000
```

---

## Windows Firewall

**If you get a firewall prompt:**
1. Click **"Allow access"**
2. Check both "Private networks" and "Public networks"
3. Click **"Allow"**

This allows Node.js to run the web server.

---

## Common Windows Issues & Solutions

### ❌ Issue: "npm is not recognized"

**Solution:** Install Node.js
1. Download from: https://nodejs.org/
2. Choose LTS version
3. Run installer
4. Restart PowerShell/Command Prompt

---

### ❌ Issue: "Cannot find module"

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

---

### ❌ Issue: "Permission denied"

**Solution:** Run PowerShell as Administrator
1. Right-click PowerShell
2. Click "Run as administrator"
3. Navigate to project folder
4. Run commands again

---

### ❌ Issue: "Scripts disabled" (PowerShell)

**Solution:**
```powershell
# Check current policy
Get-ExecutionPolicy

# Set to RemoteSigned (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File script.ps1
```

---

### ❌ Issue: Line endings (CRLF vs LF)

**Solution:** Git will handle this automatically, but if needed:
```powershell
# Configure Git for Windows
git config --global core.autocrlf true
```

---

## Windows Path Issues

**If you see path errors:**

Windows uses backslashes (`\`) but Node.js uses forward slashes (`/`).

**The code handles this automatically**, but if you need to fix paths:

```javascript
// Use path module
const path = require('path');
const filePath = path.join(__dirname, 'folder', 'file.js');
```

---

## Environment Variables in Windows

### View all environment variables:
```powershell
Get-ChildItem Env:
```

### Set temporary environment variable:
```powershell
$env:NODE_ENV = "development"
```

### Set permanent environment variable:
```powershell
[System.Environment]::SetEnvironmentVariable('NODE_ENV', 'development', 'User')
```

**But for this project, just use the `.env` file!**

---

## Testing Your Setup

### 1. Check Node.js version:
```powershell
node --version
# Should show v18 or higher
```

### 2. Check npm version:
```powershell
npm --version
# Should show v9 or higher
```

### 3. Check if .env is loaded:
```powershell
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? '✅ API Key loaded' : '❌ API Key not found')"
```

### 4. Test the server:
```powershell
npm run dev
```

Then visit: http://localhost:8080/health

**Should return:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T..."
}
```

---

## Windows Terminal Tips

### Use Windows Terminal (Recommended)

1. Install from Microsoft Store: **"Windows Terminal"**
2. Much better than Command Prompt
3. Supports tabs, colors, and modern features

### Useful shortcuts:
- `Ctrl+C` - Stop server
- `Ctrl+Shift+C` - Copy
- `Ctrl+Shift+V` - Paste
- `Ctrl+Shift+T` - New tab
- `Alt+Shift+D` - Split pane

---

## VS Code Integration (Windows)

### Open project in VS Code:
```powershell
code .
```

### Recommended VS Code Extensions:
1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **DotENV** - Syntax highlighting for .env
4. **Thunder Client** - API testing
5. **GitLens** - Git integration

### Integrated Terminal in VS Code:
- Press `` Ctrl+` `` to open terminal
- Select PowerShell or Command Prompt
- Run commands directly in VS Code

---

## Your Current Setup

Based on your `.env` file, you have:

✅ **GEMINI_API_KEY** = `AIzaSyBvGFqVwDxK1jlDP3FJ5nFbMBetho6gjCI`

**Next steps:**

1. **Update** `GOOGLE_CLOUD_PROJECT` in `.env`
2. **Generate** SESSION_SECRET and JWT_SECRET (see Step 4 above)
3. **Run** `npm run dev`
4. **Open** http://localhost:8080

---

## Quick Reference Card

```powershell
# Setup
Copy-Item .env.example .env
notepad .env                    # Edit .env file
npm install                     # Install dependencies

# Development
npm run dev                     # Start server
Ctrl+C                          # Stop server

# Testing
http://localhost:8080           # Open in browser
http://localhost:8080/health    # Health check

# Troubleshooting
Remove-Item -Recurse node_modules
npm install                     # Reinstall
npm cache clean --force         # Clear cache
```

---

## Need Help?

1. **Check** `ENV_SETUP_GUIDE.md` for detailed variable explanations
2. **Check** `QUICKSTART.md` for general setup
3. **Check** `README.md` for project overview

---

## Next Steps After Setup

Once your server is running:

1. ✅ Test the chat interface
2. ✅ Try voice input (click 🎤 button)
3. ✅ Switch languages (click 🌐 button)
4. ✅ Ask the AI tutor questions
5. ✅ Explore different subjects

**You're all set for Windows!** 🪟🚀
