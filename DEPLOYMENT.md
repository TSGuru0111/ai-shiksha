# Deployment Guide - AI Shiksha

## Prerequisites

1. **GitHub Account** - Create at https://github.com
2. **Google Cloud Account** - Create at https://cloud.google.com (Free $300 credit for new users)
3. **Git installed** - Already done ✅
4. **API Keys**:
   - Cohere API Key: https://dashboard.cohere.com/api-keys
   - Google Gemini API Key: https://makersuite.google.com/app/apikey

---

## Step 1: Push to GitHub

### Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `ai-shiksha` (or your preferred name)
3. Description: `AI-powered tutoring system for Indian government schools`
4. Choose **Public**
5. **DON'T** initialize with README (we already have one)
6. Click **Create repository**

### Push Your Code

Run these commands in your terminal:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-shiksha.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Your GitHub URL will be**: `https://github.com/YOUR_USERNAME/ai-shiksha`

---

## Step 2: Deploy to Google Cloud Run

### A. Setup Google Cloud Project

1. **Create a project**:
   ```bash
   gcloud projects create ai-shiksha-PROJECT_ID --name="AI Shiksha"
   ```
   Replace `PROJECT_ID` with a unique ID (e.g., `ai-shiksha-12345`)

2. **Set the project**:
   ```bash
   gcloud config set project ai-shiksha-PROJECT_ID
   ```

3. **Enable required APIs**:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Link billing** (required, but within free tier):
   - Go to https://console.cloud.google.com/billing
   - Link your free trial or billing account

### B. Build and Deploy

1. **Build the container**:
   ```bash
   gcloud builds submit --tag gcr.io/ai-shiksha-PROJECT_ID/ai-shiksha
   ```
   ⏱️ This takes ~3-5 minutes

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy ai-shiksha \
     --image gcr.io/ai-shiksha-PROJECT_ID/ai-shiksha \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --max-instances 2 \
     --set-env-vars="GEMINI_API_KEY=YOUR_GEMINI_KEY,COHERE_API_KEY=YOUR_COHERE_KEY,NODE_ENV=production"
   ```

3. **Note the deployment URL**:
   After deployment, you'll see:
   ```
   Service [ai-shiksha] revision [ai-shiksha-00001] has been deployed
   Service URL: https://ai-shiksha-XXXX-uc.a.run.app
   ```

**Your Deployment URL**: Copy and save this URL!

---

## Step 3: Configure Environment Variables (Alternative Method)

If you prefer to set environment variables via console:

1. Go to https://console.cloud.google.com/run
2. Click on `ai-shiksha` service
3. Click **EDIT & DEPLOY NEW REVISION**
4. Scroll to **Variables & Secrets**
5. Click **ADD VARIABLE**:
   - Name: `GEMINI_API_KEY`, Value: `your_actual_key`
   - Name: `COHERE_API_KEY`, Value: `your_actual_key`
   - Name: `NODE_ENV`, Value: `production`
6.Click **DEPLOY**

---

## Cost Estimation

### Free Tier Includes:
- **Cloud Run**: 2 million requests/month FREE
- **Cloud Build**: 120 build-minutes/day FREE
- **Container Registry**: 0.5 GB storage FREE

### Expected Monthly Cost: **$0.00 - $2.00**
- Assuming < 10,000 requests/month
- 1 deployment per week
- Well within $5 budget! ✅

---

## Verification

1. **Open deployment URL** in browser
2. **Test Student Mode**: Click Student → Take quiz
3. **Test Teacher Mode**: Click Teacher → View dashboard
4. **Check API**: Visit `https://your-url/health`

---

## Quick Commands Reference

```bash
# Re-deploy after changes
git add .
git commit -m "Update: description"
git push
gcloud builds submit --tag gcr.io/ai-shiksha-PROJECT_ID/ai-shiksha
gcloud run deploy ai-shiksha --image gcr.io/ai-shiksha-PROJECT_ID/ai-shiksha

# View logs
gcloud run logs read ai-shiksha --region=asia-south1

# Delete deployment (to save costs if needed)
gcloud run services delete ai-shiksha --region=asia-south1
```

---

## Troubleshooting

### Issue: "Permission denied"
**Solution**: Run `gcloud auth login` and follow prompts

### Issue: "Quota exceeded"
**Solution**: Request quota increase or reduce max-instances to 1

### Issue: "Container failed to start"
**Solution**: Check logs with `gcloud run logs read ai-shiksha`

---

## Support

Need help? Create an issue at: https://github.com/YOUR_USERNAME/ai-shiksha/issues

---

**Happy Deploying! 🚀**
