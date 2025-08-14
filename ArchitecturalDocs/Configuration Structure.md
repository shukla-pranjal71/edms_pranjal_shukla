#### **🔧 Configuration Structure**

```env
# Server Configuration
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3000

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-in-production-256-bit-minimum
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-256-bit-minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760        # 10MB
USE_S3_STORAGE=false

# AWS S3 Configuration (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=sop-documents

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

---
