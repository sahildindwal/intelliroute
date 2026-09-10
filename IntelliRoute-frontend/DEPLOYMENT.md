# Deploying IntelliRoute Frontend to Render

## Understanding the 404 Error

The error GET /assets/index-DcYFYXu8.js net::ERR_ABORTED 404 happens because:

1. **Vite builds with hashed filenames** - For cache busting, Vite generates files like index-DcYFYXu8.js
2. **SPA routing conflict** - When you visit a route like /profile, the server looks for /profile/index.html instead of serving the main app
3. **Missing redirects** - Without a _redirects file, the server doesn't know to serve index.html for all routes

## ✅ Fix Applied

Created public/_redirects file with:
\\\
/*    /index.html   200
\\\

This tells Render to:
- Redirect **all routes** (/*) to index.html
- Return **200 status** (success, not 404)
- Let React Router handle the routing

## 🚀 Quick Deployment Guide

### Step 1: Verify Build Settings on Render

**Build Command:**
\\\ash
npm install && npm run build
\\\

**Publish Directory:**
\\\
dist
\\\

### Step 2: Check Environment Variables

Add on Render dashboard:
\\\
VITE_BACKEND_URL=https://your-backend-url.onrender.com
\\\

### Step 3: Deploy

The _redirects file has been pushed. Render will automatically:
1. Detect the commit
2. Rebuild your app
3. Include _redirects in the dist folder
4. Apply the routing rules

**Wait 2-3 minutes** for the new deployment to complete.

## 🧪 Test After Deployment

1. **Home page**: https://intelliroute-frontend.onrender.com/
2. **Direct route**: https://intelliroute-frontend.onrender.com/profile
3. **Refresh any page** - Should work without 404

## 🔍 Common Issues & Solutions

### Issue: Still getting 404 after deployment

**Check:**
\\\ash
# Verify _redirects is in dist folder
ls dist/_redirects
\\\

**Solution:** Make sure Render rebuild happened after pushing _redirects

### Issue: Assets loading from wrong path

**Check vite.config.js:**
\\\javascript
export default defineConfig({
  plugins: [react()],
  base: '/' // Must be '/' for root deployment
})
\\\

### Issue: CORS errors

**Update backend CORS:**
\\\javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://intelliroute-frontend.onrender.com'
  ],
  credentials: true
}));
\\\

### Issue: Blank page

**Check browser console** for:
- Missing environment variables
- API connection errors
- JavaScript errors

## 📋 Deployment Checklist

- [x] public/_redirects file created
- [x] Changes committed and pushed
- [ ] Render rebuild triggered (automatic)
- [ ] Environment variables set
- [ ] Backend CORS updated
- [ ] Test all routes after deployment

## 🔗 Additional Resources

- [Render Static Sites Documentation](https://render.com/docs/static-sites)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router SPA Deployment](https://reactrouter.com/en/main/guides/deployment)

## 💡 How _redirects Works

\\\
Request: /profile
↓
Server checks: /profile/index.html (doesn't exist)
↓
_redirects rule: /* → /index.html
↓
Server returns: /index.html (200 OK)
↓
React Router sees: /profile
↓
Renders: Profile component
\\\

## ✅ Next Steps

1. Wait for Render to complete rebuild
2. Clear browser cache (Ctrl+Shift+R)
3. Test your deployed site
4. Check browser console for any errors

Your site should now work perfectly! 🎉
