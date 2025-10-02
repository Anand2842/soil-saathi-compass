# Security Policy

## 🔐 Security Overview

Soil Saathi implements comprehensive security measures to protect farmer data and ensure safe agricultural operations.

## Implemented Security Features

### 1. Authentication & Authorization
- ✅ Secure JWT-based authentication via Supabase
- ✅ Row-Level Security (RLS) on all database tables
- ✅ Protected routes requiring authentication
- ✅ Session management with auto-refresh
- ✅ Secure password reset flow

### 2. Data Protection
- ✅ All data encrypted in transit (TLS/SSL)
- ✅ Sensitive data encrypted at rest
- ✅ User data isolated via RLS policies
- ✅ Input validation on all forms
- ✅ SQL injection prevention

### 3. API Security
- ✅ API keys stored as encrypted secrets
- ✅ Rate limiting on endpoints
- ✅ CORS configuration
- ✅ Request validation
- ✅ Error message sanitization

### 4. Frontend Security
- ✅ Content Security Policy (CSP) headers
- ✅ XSS protection via React's built-in escaping
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ Secure token storage (HttpOnly cookies preferred)
- ✅ HTTPS-only cookies in production

### 5. Monitoring & Logging
- ✅ Security event logging
- ✅ Failed authentication tracking
- ✅ Unusual activity detection
- ✅ Error tracking without exposing sensitive data
- ✅ Admin dashboard for security monitoring

## Security Best Practices

### For Developers

1. **Never commit secrets to version control**
   - Use Supabase Edge Function Secrets
   - Add `.env.local` to `.gitignore`
   - Rotate compromised keys immediately

2. **Always validate user input**
   ```typescript
   // Good
   const schema = z.object({
     email: z.string().email(),
     name: z.string().min(1).max(100),
   });
   
   // Bad
   const email = req.body.email; // No validation!
   ```

3. **Use RLS policies for all tables**
   ```sql
   -- Good
   CREATE POLICY "Users can only view own data"
   ON table_name
   FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Bad
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

4. **Sanitize error messages**
   ```typescript
   // Good
   catch (error) {
     logger.error('Operation failed', error);
     return { error: 'Operation failed' };
   }
   
   // Bad
   catch (error) {
     return { error: error.stack }; // Exposes internals!
   }
   ```

### For Administrators

1. **Regular Security Audits**
   - Run Supabase linter monthly
   - Review RLS policies quarterly
   - Audit user permissions regularly
   - Check for unused API keys

2. **Access Control**
   - Use principle of least privilege
   - Review admin users regularly
   - Disable inactive accounts
   - Implement 2FA for admin accounts

3. **Monitoring**
   - Check admin dashboard daily
   - Review security logs weekly
   - Monitor failed login attempts
   - Track unusual data access patterns

4. **Incident Response**
   - Have incident response plan ready
   - Document security procedures
   - Train team on security protocols
   - Maintain emergency contacts list

## Compliance

### Data Protection
- **India DPDPA 2023**: Personal data protection compliance
- **GDPR** (if applicable): EU data protection regulation
- **Data Minimization**: Only collect necessary data
- **Right to Deletion**: Users can delete their accounts

### Agricultural Data
- **Ownership**: Farmers own their field data
- **Privacy**: Field locations encrypted and access-controlled
- **Portability**: Users can export their data
- **Transparency**: Clear data usage policies

## Security Features Roadmap

### Planned Enhancements
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication for mobile
- [ ] Advanced anomaly detection
- [ ] Automated security scanning in CI/CD
- [ ] Penetration testing results
- [ ] Bug bounty program

## Reporting Security Issues

### Do NOT Create Public Issues

If you discover a security vulnerability:

1. **Email**: security@soilsaathi.com (if available)
2. **Subject**: "SECURITY: [Brief Description]"
3. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Regular Updates**: Every week until resolved
- **Resolution**: Based on severity
  - Critical: Within 24 hours
  - High: Within 1 week
  - Medium: Within 2 weeks
  - Low: Within 1 month

### Disclosure Policy

- We follow responsible disclosure
- We will credit reporters (if desired)
- Public disclosure after fix is deployed
- CVE assigned for critical vulnerabilities

## Security Checklist for New Features

Before deploying new features:

- [ ] Security review completed
- [ ] Input validation implemented
- [ ] RLS policies configured
- [ ] Error handling tested
- [ ] Secrets properly stored
- [ ] Rate limiting configured
- [ ] Logging implemented
- [ ] Documentation updated
- [ ] Security tests passed
- [ ] Penetration testing (for major features)

## Known Limitations

### Current Limitations

1. **PostGIS System Tables**
   - RLS cannot be enabled on PostGIS system tables
   - These are read-only and pose minimal risk
   - Mitigation: Restricted access via RLS on application tables

2. **Service Worker Scope**
   - Cannot access auth tokens in service worker
   - Mitigation: Cache only public data in service worker

3. **Local Storage**
   - Cached data stored in localStorage
   - Mitigation: No sensitive data cached, tokens use secure storage

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-security)
- [React Security Best Practices](https://react.dev/learn/passing-data-deeply-with-context)

---

**Last Updated**: 2025-01-21
**Security Contact**: [Your security email]
**Version**: 1.0.0