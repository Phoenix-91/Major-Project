# Deployment Guide

## Production Deployment Options

### Option 1: Vercel + Railway + MongoDB Atlas (Recommended)

#### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   ```
4. Deploy

#### Backend (Railway)
1. Create new project in Railway
2. Connect GitHub repository
3. Set environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   AI_SERVICE_URL=https://your-ai-service.railway.app
   ```
4. Deploy

#### AI Service (Railway)
1. Create another service in Railway
2. Set environment variables:
   ```
   GROQ_API_KEY=gsk_...
   LLM_MODEL=llama3-70b-8192
   ```
3. Deploy

### Option 2: AWS Deployment

#### Frontend (S3 + CloudFront)
```bash
cd client
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

#### Backend (EC2 or ECS)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone and setup
git clone <repo>
cd server
npm install
pm2 start index.js --name ai-automation-server
pm2 save
pm2 startup
```

#### AI Service (EC2 with GPU - Optional)
```bash
# Install Python
sudo apt-get update
sudo apt-get install python3.9 python3-pip

# Setup service
cd ai-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with PM2
pm2 start "python main.py" --name ai-service
```

### Option 3: Docker Deployment

#### Create Dockerfiles

**server/Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**ai-agent/Dockerfile**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

**client/Dockerfile**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  client:
    build: ./client
    ports:
      - "80:80"
    environment:
      - VITE_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
  
  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - AI_SERVICE_URL=http://ai-agent:8000
    depends_on:
      - ai-agent
  
  ai-agent:
    build: ./ai-agent
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
```

Deploy:
```bash
docker-compose up -d
```

## Environment Variables

### Production Checklist
- [ ] Update all API keys to production keys
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Set up backups for MongoDB

## Security Considerations

1. **API Keys**: Use environment variables, never commit
2. **CORS**: Restrict to production domain
3. **Rate Limiting**: Implement on all endpoints
4. **HTTPS**: Required for production
5. **Input Validation**: Already implemented
6. **Authentication**: Clerk handles this
7. **Logging**: Winston configured for production

## Monitoring

### Recommended Tools
- **Application**: Sentry for error tracking
- **Logs**: Papertrail or Loggly
- **Uptime**: UptimeRobot
- **Performance**: New Relic or Datadog

## Scaling

### Horizontal Scaling
- Deploy multiple server instances behind load balancer
- Use Redis for session storage
- Implement caching layer

### Database Optimization
- Add indexes on frequently queried fields
- Use MongoDB Atlas auto-scaling
- Implement read replicas for heavy read operations

## Backup Strategy

### MongoDB
- Enable automated backups in Atlas
- Schedule: Daily with 7-day retention
- Test restore procedure monthly

### Code
- GitHub as source of truth
- Tag releases: `git tag v1.0.0`
- Maintain changelog

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Post-Deployment

1. **Test all features**
   - Authentication flow
   - Command processing
   - Interview simulator
   - Email/Calendar operations

2. **Monitor logs**
   - Check for errors
   - Verify API response times
   - Monitor database queries

3. **Performance testing**
   - Load test with 100+ concurrent users
   - Check response times < 2s
   - Verify memory usage stable

## Support

For deployment issues:
- Check logs first
- Verify environment variables
- Test API endpoints individually
- Contact support if needed

---

**Production Checklist**
- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment process
