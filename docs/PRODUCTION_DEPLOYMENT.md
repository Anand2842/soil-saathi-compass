# Soil Saathi - Production Deployment Guide

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [CDN & Caching](#cdn--caching)
5. [Monitoring & Logging](#monitoring--logging)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Backup & Recovery](#backup--recovery)
9. [Deployment Steps](#deployment-steps)
10. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### ✅ Critical Items
- [ ] Authentication system configured and tested
- [ ] RLS policies enabled on all tables
- [ ] API keys stored in Supabase Edge Function Secrets
- [ ] Service worker registered and tested
- [ ] Error boundaries implemented
- [ ] Monitoring and logging configured
- [ ] Database backups scheduled
- [ ] SSL/TLS certificates configured
- [ ] Custom domain configured (if applicable)
- [ ] Admin dashboard accessible

### ✅ Recommended Items
- [ ] Performance metrics tracking enabled
- [ ] CDN configured for static assets
- [ ] Rate limiting implemented
- [ ] Email templates configured
- [ ] Privacy policy and terms of service updated
- [ ] Analytics integration completed
- [ ] Push notifications tested
- [ ] Offline mode verified

---

## Environment Configuration

### Required Secrets (Supabase Edge Functions)

Configure these in: `Supabase Dashboard > Project Settings > Edge Functions > Secrets`

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
MAPBOX_PUBLIC_TOKEN=your_mapbox_token
GEMINI_API_KEY=your_gemini_api_key
```

### Supabase Configuration

1. **Authentication Settings**
   - Enable email/password authentication
   - Configure email templates
   - Set Site URL to your production domain
   - Add authorized redirect URLs

2. **URL Configuration**
   ```
   Site URL: https://yourdomain.com
   Redirect URLs:
   - https://yourdomain.com
   - https://yourdomain.com/auth
   - https://yourdomain.com/admin
   ```

3. **Rate Limiting**
   - Configure appropriate rate limits for APIs
   - Set up DDoS protection

---

## Database Setup

### 1. Enable RLS on All Tables

All tables should have RLS enabled. Check with:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 2. Optimize Database Performance

```sql
-- Create necessary indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fields_user_id 
ON fields(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_satellite_analyses_field_id_date 
ON satellite_analyses(field_id, analysis_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_field_user 
ON recommendations(field_id, user_id, created_at DESC);

-- Update table statistics
ANALYZE;
```

### 3. Setup Connection Pooling

Use PgBouncer or Supabase's built-in connection pooling:
- Transaction mode for most queries
- Session mode for specific operations requiring session state

---

## CDN & Caching

### Service Worker Configuration

The service worker (`public/sw.js`) implements:
- **Static assets**: Cache-first strategy
- **API calls**: Network-first with cache fallback
- **Satellite imagery**: Long-term caching (7 days)
- **Offline support**: Offline page for navigation

### Cloudflare/CDN Setup (Recommended)

1. **Configure caching rules:**
   ```
   Static Assets (/.js|.css|.png|.jpg|.svg/):
   - Browser Cache TTL: 30 days
   - Edge Cache TTL: 7 days
   
   API Responses (/api/):
   - Browser Cache TTL: 5 minutes
   - Edge Cache TTL: 1 hour
   ```

2. **Enable compression:**
   - Brotli compression for text assets
   - Image optimization for satellite imagery

3. **Configure security headers:**
   ```
   Content-Security-Policy: default-src 'self'; ...
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

---

## Monitoring & Logging

### 1. Admin Dashboard Access

Access the admin dashboard at: `https://yourdomain.com/admin`

Features:
- Real-time system health monitoring
- Analytics dashboard
- Performance metrics
- Cache management

### 2. Health Check Endpoint

Monitor system health:
```bash
curl https://your-project.supabase.co/functions/v1/health-check
```

Expected response:
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "status": "healthy",
  "services": {
    "database": { "status": "healthy", "response_time_ms": 50 },
    "auth": { "status": "healthy", "response_time_ms": 30 },
    "storage": { "status": "healthy", "response_time_ms": 40 }
  }
}
```

### 3. Set Up Alerts

Configure alerts for:
- Database connection failures
- High error rates (>1%)
- Slow response times (>2s)
- Storage capacity warnings
- Authentication failures

### 4. Log Management

Logs are stored in:
- **Application logs**: `localStorage` (development) or external service (production)
- **Database logs**: `system_health`, `analytics_events`, `performance_metrics` tables
- **Edge function logs**: Supabase Dashboard > Functions > Logs

---

## Security Configuration

### 1. Enable SSL/TLS

Ensure HTTPS is enforced:
- Supabase provides SSL by default
- Configure your custom domain with valid SSL certificate
- Set up HTTP to HTTPS redirect

### 2. Configure CORS

CORS is handled in edge functions via `corsHeaders`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, restrict to your domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Production recommendation**: Change `*` to your specific domain.

### 3. API Key Rotation

Regularly rotate:
- Supabase anon key (if compromised)
- External API keys (ElevenLabs, Mapbox, Gemini)
- Database passwords

### 4. Rate Limiting

Configure rate limits in Supabase:
- Authentication: 5 attempts per minute
- API endpoints: 60 requests per minute per IP
- Edge functions: 100 requests per minute

---

## Performance Optimization

### 1. Bundle Optimization

Implemented optimizations:
- Code splitting with React.lazy
- Tree shaking for unused code
- Minification and compression
- Service worker caching

### 2. Image Optimization

For satellite imagery:
- WebP format with fallback
- Lazy loading for off-screen images
- Responsive images with srcset
- Progressive loading

### 3. Database Query Optimization

Best practices:
- Use appropriate indexes
- Limit result sets
- Use connection pooling
- Cache frequently accessed data

---

## Backup & Recovery

### Automated Backups

Supabase provides:
- Daily automated backups (retained for 7 days)
- Point-in-time recovery (PITR) available

### Manual Backup

Create on-demand backup:
```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### Backup Monitoring

Check backup status in `backup_metadata` table:
```sql
SELECT * FROM backup_metadata 
ORDER BY start_time DESC 
LIMIT 10;
```

### Disaster Recovery Plan

1. **Database Restoration**:
   - Restore from latest automated backup
   - Apply any incremental backups
   - Verify data integrity

2. **Edge Functions**:
   - Functions are version-controlled
   - Redeploy from repository if needed

3. **User Data**:
   - Field boundaries stored in database
   - Satellite analyses cached and stored
   - Recommendations backed up

---

## Deployment Steps

### 1. Pre-Deployment Testing

```bash
# Run production build locally
npm run build

# Test the production build
npm run preview

# Run security audit
npm audit

# Check for outdated dependencies
npm outdated
```

### 2. Deploy to Production

**Via Lovable Platform:**
1. Click "Publish" button in top right
2. Review deployment preview
3. Confirm deployment
4. Monitor deployment logs

**Via GitHub/CI/CD:**
```bash
# Build production bundle
npm run build

# Deploy to hosting platform
# (Specific to your hosting provider)
```

### 3. Deploy Edge Functions

Edge functions auto-deploy with your project, but you can manually deploy:
```bash
supabase functions deploy health-check
supabase functions deploy gee-analysis
supabase functions deploy enhanced-field-summary
supabase functions deploy elevenlabs-speech
```

### 4. Run Database Migrations

```bash
# Apply pending migrations
supabase db push

# Verify migrations
supabase db diff
```

---

## Post-Deployment Verification

### Checklist

- [ ] **Homepage loads**: https://yourdomain.com
- [ ] **Auth works**: Sign up, sign in, sign out
- [ ] **Protected routes**: Unauthorized users redirected
- [ ] **Admin dashboard**: Accessible at /admin
- [ ] **Health check**: Edge function responds
- [ ] **Service worker**: Registered and caching
- [ ] **Offline mode**: Works when disconnected
- [ ] **Mobile responsive**: Test on various devices
- [ ] **Performance**: Lighthouse score >90
- [ ] **Error handling**: No console errors
- [ ] **Analytics tracking**: Events being logged
- [ ] **Monitoring**: Alerts configured

### Performance Benchmarks

Target metrics:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Load Testing

Use tools like:
- Apache JMeter
- k6
- Artillery

Test scenarios:
- 100 concurrent users
- 1000 requests per minute
- Peak load handling

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check system health status
- Review analytics dashboards

**Weekly:**
- Review performance metrics
- Check backup completion
- Update security patches

**Monthly:**
- Audit user activity
- Review and rotate API keys
- Update dependencies
- Performance optimization review

### Scaling Considerations

When to scale:
- Response time > 2s consistently
- Database CPU > 80% for 10+ minutes
- Storage > 80% capacity
- Error rate > 1%

Scaling options:
- Upgrade Supabase plan
- Add read replicas
- Implement caching layer
- Optimize database queries

---

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [PWA Best Practices](https://web.dev/pwa/)

### Monitoring Tools
- Supabase Dashboard
- Admin Dashboard (/admin)
- Browser DevTools
- Lighthouse CI

### Emergency Contacts
- Supabase Support: support@supabase.com
- Database Admin: [Your DBA]
- DevOps Team: [Your team]

---

## Conclusion

Following this guide ensures Soil Saathi is production-ready with:
- ✅ Robust security
- ✅ High performance
- ✅ Reliable monitoring
- ✅ Disaster recovery
- ✅ Scalability

For questions or issues, refer to the admin dashboard or consult the development team.

---

**Last Updated**: 2025-01-21
**Version**: 1.0.0
**Maintained By**: Soil Saathi Development Team