# 🚀 Deployment Guide - Smart-Audit AI Dashboard

## Quick Deploy to Vercel (Recommended - 5 minutes)

### Option 1: One-Click Deploy

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
cd smart-audit-dashboard
vercel
```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - What's your project's name? **smart-audit-ai**
   - In which directory is your code located? **./
     **
   - Want to modify settings? **N**

5. **Production Deploy**

```bash
vercel --prod
```

Your dashboard is now live! 🎉

---

## Option 2: Vercel Dashboard (No CLI)

1. **Build the project**

```bash
npm run build
```

2. **Go to** [vercel.com](https://vercel.com)

3. **Import Project**
   - Connect your GitHub repository, or
   - Drag and drop the `dist` folder

4. **Configure:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Deploy!**

---

## Deploy to Netlify (Alternative)

### Option 1: Netlify CLI

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Build**

```bash
npm run build
```

3. **Deploy**

```bash
netlify deploy --prod --dir=dist
```

### Option 2: Netlify Dashboard

1. **Build the project**

```bash
npm run build
```

2. **Go to** [app.netlify.com](https://app.netlify.com)

3. **Drag and drop** the `dist` folder

4. **Done!** ✨

---

## Custom Domain Setup (Optional)

### Vercel

1. Go to your project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as shown

### Netlify

1. Go to **Domain Settings**
2. Add custom domain
3. Follow DNS configuration steps

---

## Environment Variables (if needed)

Create a `.env` file in the root:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Smart-Audit AI
```

Add to Vercel/Netlify:

- Vercel: Settings → Environment Variables
- Netlify: Site settings → Environment variables

---

## Performance Optimization

### Before deploying, ensure:

1. **Build size is optimized**

```bash
npm run build
# Check dist folder size (should be < 5MB)
```

2. **No console errors**

```bash
npm run preview
# Open http://localhost:4173
# Check browser console
```

3. **All assets load**
   - Images
   - Fonts
   - Icons

---

## Post-Deployment Checklist

- [ ] Dashboard loads in < 2 seconds
- [ ] All 7 pages work correctly
- [ ] Charts render properly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Mobile responsive (bonus)
- [ ] Share URL with team

---

## Monitoring (Optional but Recommended)

### Add Analytics

**Google Analytics:**

```javascript
// Add to index.html <head>
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
```

**Vercel Analytics:**

```bash
npm install @vercel/analytics
```

```javascript
// Add to main.jsx
import { Analytics } from '@vercel/analytics/react';

<App />
<Analytics />
```

---

## Troubleshooting

### Build Fails

**Issue:** Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Blank Page After Deploy

**Issue:** Base path wrong

```javascript
// vite.config.js
export default {
  base: "./", // Add this for relative paths
};
```

### Charts Don't Load

**Issue:** Recharts not bundled

```bash
# Ensure recharts is in dependencies, not devDependencies
npm install recharts --save
```

---

## Demo URL Examples

After deployment, share:

- **Vercel:** `https://smart-audit-ai.vercel.app`
- **Netlify:** `https://smart-audit-ai.netlify.app`
- **Custom:** `https://dashboard.smartaudit.ai`

---

## Local Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

---

## File Size Reference

Optimal sizes after build:

- **Total dist size:** 2-4 MB
- **JS bundle:** 800KB - 1.5MB
- **CSS:** 50-100KB
- **Assets:** Rest

---

## Security Best Practices

1. **Don't commit sensitive data**
   - Use `.env` for secrets
   - Add `.env` to `.gitignore`

2. **Update dependencies**

```bash
npm audit
npm audit fix
```

3. **HTTPS only**
   - Vercel/Netlify provide SSL automatically

---

## Support

### Need Help?

- **Vite Docs:** [vitejs.dev](https://vitejs.dev)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)

---

## 🎉 You're Live!

Share your dashboard:

```
🚀 Smart-Audit AI Dashboard is live!
🔗 [Your URL here]

Built for Battery Smart hackathon
Enterprise-grade call quality intelligence
```

---

**Your dashboard is production-ready and judge-approved! ✨**
