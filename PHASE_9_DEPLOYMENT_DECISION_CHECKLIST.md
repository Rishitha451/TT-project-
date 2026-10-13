# Phase 9: Deployment Decision Checklist

Please review the proposed deployment architecture and finalize the following provider selections so we can proceed with infrastructure provisioning and CI/CD pipelines.

## 1. Frontend Hosting Provider
*Recommendation: Vercel or Netlify for zero-config SPA routing and Edge CDN.*
- [ ] Vercel
- [ ] Netlify
- [ ] AWS S3 + CloudFront
- [ ] Other: ____________________

## 2. Backend Hosting Provider (Compute)
*Recommendation: Render (Web Service) or Railway for simplified Dockerless/FastAPI deployments.*
- [ ] Render
- [ ] Railway
- [ ] Heroku
- [ ] AWS ECS / Fargate (Requires more advanced networking setup)
- [ ] Other: ____________________

## 3. Database Provider
*Recommendation: Neon or Supabase for Serverless PostgreSQL with generous connection pooling.*
- [ ] Neon
- [ ] Supabase
- [ ] AWS RDS PostgreSQL
- [ ] Render Managed PostgreSQL
- [ ] Other: ____________________

## 4. Secret Management Strategy
*Recommendation: Use the built-in Environment Variables dashboard of the chosen Backend/Frontend providers for the initial launch.*
- [ ] Provider Built-in (e.g. Render Dashboard, Vercel Dashboard)
- [ ] AWS Secrets Manager
- [ ] Doppler / Infisical
- [ ] Other: ____________________

## 5. Primary Deployment Region
*Select a region closest to your target user base to minimize latency.*
- [ ] US East (N. Virginia / New York)
- [ ] US West (Oregon / California)
- [ ] Europe (Frankfurt / Ireland)
- [ ] Asia Pacific (Tokyo / Singapore)
- [ ] Other: ____________________

## 6. Domain Name Strategy
- [ ] Launch with provider subdomains initially (e.g., `app-name.vercel.app`, `api-name.onrender.com`).
- [ ] Launch with a custom apex domain (e.g., `app.domain.com`, `api.domain.com`). 
      *If custom, please specify domain:* ____________________

## 7. Scaling Constraints Acknowledgment
The current application uses an in-memory rate limiter and a 24-hour stateless JWT.
- [ ] **I approve** launching with a **single backend instance/worker** initially to ensure rate limiting functions correctly. We will evaluate Redis if/when horizontal scaling is required.
- [ ] **I acknowledge** the 24-hour stateless token limitation and accept the risk for the initial launch phase.

---
**Next Steps**: Once this checklist is completed and returned, we will initialize the production environments, inject secure placeholders, and create the CI/CD deployment files (e.g., `.github/workflows/deploy.yml` or `render.yaml`).
