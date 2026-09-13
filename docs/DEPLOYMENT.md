# EduTrack - Deployment Guide

## Deploy with GitHub Pages (Frontend Only)

This website is a static landing page that can be deployed directly to GitHub Pages.

### Option 1: GitHub Pages Deployment (Recommended)

1. **Enable GitHub Pages in your repository**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages-setup` (or `main`)
   - Folder: `/docs`
   - Save

2. **Your website will be live at:**
   ```
   https://YashSaini0019.github.io/EduTrack/
   ```

3. **To update content**, edit files in the `/docs` folder and commit/push to GitHub

### Option 2: Run Locally

```bash
# No build step needed - just open the HTML file
open docs/index.html

# Or use a local server (Python 3)
python -m http.server 8000 --directory docs

# Then open http://localhost:8000
```

## Deploy Full Stack Application

### Backend (Flask API) - Deploy to Heroku/Railway/Render

1. **Create a runtime.txt** in the root:
   ```
   python-3.10.0
   ```

2. **Create a Procfile** in the root:
   ```
   web: cd backend && python app.py
   ```

3. **Deploy to Heroku:**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   heroku open
   ```

4. **Or deploy to Railway/Render:**
   - Connect your GitHub repo
   - Set root directory to `backend`
   - Deploy!

### Frontend (React) - Deploy to Vercel/Netlify

1. **Build the React app:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repo
   - Set root directory to `frontend`
   - Deploy!

3. **Or deploy to Netlify:**
   - Drag and drop the `frontend/dist` folder
   - Or connect GitHub for auto-deployment

### Using Docker

1. **Create a Dockerfile** in the root:
   ```dockerfile
   FROM python:3.10
   WORKDIR /app
   
   # Install backend dependencies
   COPY ml/requirements.txt .
   RUN pip install -r requirements.txt
   
   # Copy all files
   COPY . .
   
   # Train models
   RUN cd ml && python train_placement_model.py && python train_salary_model.py
   
   # Expose port
   EXPOSE 5000
   
   # Run Flask app
   CMD ["python", "backend/app.py"]
   ```

2. **Build and run:**
   ```bash
   docker build -t edutrack .
   docker run -p 5000:5000 edutrack
   ```

## Environment Variables

For production deployments, set these environment variables:

```bash
# Backend
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5000

# Frontend (build time)
VITE_API_BASE_URL=https://your-backend-url.com
```

## Database

For production, use PostgreSQL instead of SQLite:

1. Update `load_data.py` to use PostgreSQL connection string
2. Set DATABASE_URL environment variable
3. Run migrations in production

## Monitoring & Logging

Add logging for production:

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

## Performance Optimization

1. **Enable CORS caching**
2. **Add Redis for model caching**
3. **Use CDN for static assets**
4. **Implement rate limiting on API endpoints**
5. **Add request/response compression**

## Security Checklist

- [ ] Enable HTTPS
- [ ] Set CORS properly (not `*`)
- [ ] Add API authentication (JWT tokens)
- [ ] Validate all input data
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Use secure headers

## Troubleshooting

**Models not loading?**
- Ensure models are trained: `python ml/train_placement_model.py`
- Check `ml/models/` folder exists with .pkl files

**CORS errors?**
- Check Flask API is running
- Verify `Access-Control-Allow-Origin` headers

**Data not loading?**
- Run `python ml/load_data.py` to populate database
- Check `placement_data.csv` exists

## Support

For questions, open an issue on GitHub: https://github.com/YashSaini0019/EduTrack/issues
