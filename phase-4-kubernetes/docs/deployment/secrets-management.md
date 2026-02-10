# Secrets Management Guide

**Purpose**: Guide for managing sensitive configuration data in Kubernetes
**Target Audience**: Developers deploying Todo AI Chatbot to Kubernetes
**Security Level**: Critical - Handle with care

## Overview

Kubernetes Secrets provide a secure way to store and manage sensitive information such as passwords, API keys, and tokens. This guide covers how to create, update, and manage secrets for the Todo AI Chatbot application.

## Security Principles

### Never Commit Secrets to Git

**Critical Rule**: Secrets must NEVER be committed to version control.

**Bad Practice** ❌:
```yaml
# values.yaml - DO NOT DO THIS
secrets:
  jwtSecret: "my-actual-secret-key"
  openaiApiKey: "sk-actual-api-key"
```

**Good Practice** ✅:
```yaml
# values.yaml - Keep empty, provide at runtime
secrets:
  jwtSecret: ""
  openaiApiKey: ""
```

### Secret Storage Best Practices

1. **Use Kubernetes Secrets**: Store sensitive data in Kubernetes Secrets, not ConfigMaps
2. **Separate Environments**: Use different secrets for dev, staging, and production
3. **Rotate Regularly**: Change secrets periodically (every 90 days recommended)
4. **Limit Access**: Only authorized personnel should access production secrets
5. **Audit Access**: Log and monitor secret access
6. **Encrypt at Rest**: Ensure Kubernetes cluster has encryption at rest enabled

## Required Secrets

The Todo AI Chatbot application requires three secrets:

### 1. JWT_SECRET

**Purpose**: Secret key for signing and verifying JWT authentication tokens

**Requirements**:
- Minimum 32 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Unique per environment
- Never reuse across environments

**Generation**:
```bash
# Generate a secure random secret (Linux/macOS)
openssl rand -base64 48

# Or use Python
python3 -c "import secrets; print(secrets.token_urlsafe(48))"

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Example** (for development only):
```
your-super-secret-jwt-key-change-this-in-production-abc123
```

### 2. OPENAI_API_KEY

**Purpose**: API key for OpenAI services (GPT-4, Agents SDK)

**Requirements**:
- Must start with `sk-`
- Obtained from OpenAI platform
- Has sufficient credits/quota
- Appropriate rate limits configured

**How to Obtain**:
1. Visit https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key immediately (shown only once)
5. Store securely

**Format**:
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost Considerations**:
- Monitor usage at https://platform.openai.com/usage
- Set spending limits to avoid unexpected charges
- Use GPT-4o-mini for development to reduce costs

### 3. DATABASE_URL

**Purpose**: PostgreSQL connection string for Neon database

**Requirements**:
- Valid PostgreSQL connection string
- SSL mode required (`sslmode=require`)
- Database must be accessible from Kubernetes pods
- User must have appropriate permissions

**Format**:
```
postgresql://username:password@hostname:5432/database?sslmode=require
```

**Example** (Neon database):
```
postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require
```

**Security Notes**:
- Password should be URL-encoded if it contains special characters
- Use strong passwords (16+ characters)
- Rotate database passwords regularly
- Use read-only credentials if possible for non-production environments

## Creating Secrets

### Method 1: Interactive Script (Recommended)

Use the provided script for guided secret creation:

```bash
# Run the interactive script
./scripts/create-secrets.sh --namespace todo-app

# Follow the prompts to enter each secret value
# The script validates inputs and creates the secret
```

**Advantages**:
- Validates secret format
- Provides helpful prompts
- Checks for existing secrets
- Secure (values not stored in shell history)

### Method 2: Command Line

Create secrets directly with kubectl:

```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='your-jwt-secret-here' \
  --from-literal=OPENAI_API_KEY='sk-your-openai-key' \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/db?sslmode=require' \
  --namespace=todo-app
```

**Security Warning**: Values may be stored in shell history. Clear history after:
```bash
history -c  # Clear current session history
```

### Method 3: From Environment Variables

Load secrets from environment variables:

```bash
# Set environment variables (in secure terminal)
export JWT_SECRET="your-jwt-secret"
export OPENAI_API_KEY="sk-your-key"
export DATABASE_URL="postgresql://..."

# Create secret from environment
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --namespace=todo-app

# Unset variables immediately
unset JWT_SECRET OPENAI_API_KEY DATABASE_URL
```

### Method 4: From File (Most Secure)

Create secrets from a file (never commit this file):

```bash
# Create temporary file
cat > /tmp/secrets.env <<EOF
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://user:pass@host:5432/db
EOF

# Create secret from file
kubectl create secret generic todo-app-secrets \
  --from-env-file=/tmp/secrets.env \
  --namespace=todo-app

# Delete file immediately
shred -u /tmp/secrets.env  # Linux
# or
rm -P /tmp/secrets.env     # macOS
```

## Viewing Secrets

### List Secrets

```bash
# List all secrets in namespace
kubectl get secrets -n todo-app

# Expected output:
# NAME                TYPE     DATA   AGE
# todo-app-secrets    Opaque   3      5m
```

### Describe Secret (Metadata Only)

```bash
# View secret metadata (keys, not values)
kubectl describe secret todo-app-secrets -n todo-app

# Output shows:
# - Secret name
# - Namespace
# - Keys (JWT_SECRET, OPENAI_API_KEY, DATABASE_URL)
# - Data sizes
# - NOT the actual values
```

### Decode Secret Values (Use Carefully)

```bash
# Decode specific secret value
kubectl get secret todo-app-secrets -n todo-app \
  -o jsonpath='{.data.JWT_SECRET}' | base64 --decode

# Decode all secret values
kubectl get secret todo-app-secrets -n todo-app -o json | \
  jq '.data | map_values(@base64d)'
```

**Security Warning**: Only decode secrets in secure environments. Never log or display in production.

## Updating Secrets

### Update Existing Secret

```bash
# Method 1: Delete and recreate
kubectl delete secret todo-app-secrets -n todo-app
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET='new-value' \
  --from-literal=OPENAI_API_KEY='new-value' \
  --from-literal=DATABASE_URL='new-value' \
  --namespace=todo-app

# Method 2: Patch secret (update single value)
kubectl patch secret todo-app-secrets -n todo-app \
  -p '{"data":{"JWT_SECRET":"'$(echo -n "new-value" | base64)'"}}'
```

### Restart Pods After Update

Pods must be restarted to use updated secrets:

```bash
# Restart all deployments
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Watch restart progress
kubectl get pods -n todo-app --watch
```

## Secret Rotation

### When to Rotate Secrets

Rotate secrets when:
- **Scheduled rotation**: Every 90 days (recommended)
- **Security incident**: Immediately if compromised
- **Personnel changes**: When team members leave
- **Compliance requirements**: As required by policy
- **Suspected exposure**: If secrets may have been exposed

### Rotation Procedure

```bash
# Step 1: Generate new secret values
NEW_JWT_SECRET=$(openssl rand -base64 48)
# Get new OpenAI key from platform
# Generate new database password in Neon

# Step 2: Update secret
kubectl delete secret todo-app-secrets -n todo-app
kubectl create secret generic todo-app-secrets \
  --from-literal=JWT_SECRET="$NEW_JWT_SECRET" \
  --from-literal=OPENAI_API_KEY="$NEW_OPENAI_KEY" \
  --from-literal=DATABASE_URL="$NEW_DATABASE_URL" \
  --namespace=todo-app

# Step 3: Restart pods
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app

# Step 4: Verify application works
kubectl get pods -n todo-app
minikube service todo-app-frontend -n todo-app

# Step 5: Document rotation
echo "$(date): Rotated secrets" >> secret-rotation-log.txt
```

## Backup and Recovery

### Backup Secrets

```bash
# Export secret to file (encrypted storage only)
kubectl get secret todo-app-secrets -n todo-app -o yaml > secret-backup.yaml

# Encrypt backup file
gpg --encrypt --recipient your-email@example.com secret-backup.yaml

# Store encrypted file securely
# Delete unencrypted file
shred -u secret-backup.yaml
```

### Restore Secrets

```bash
# Decrypt backup
gpg --decrypt secret-backup.yaml.gpg > secret-backup.yaml

# Apply secret
kubectl apply -f secret-backup.yaml

# Delete decrypted file
shred -u secret-backup.yaml
```

## Troubleshooting

### Issue: Pods Can't Access Secrets

**Symptoms**: Pods crash with "secret not found" errors

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-app
kubectl get secrets -n todo-app
```

**Solution**:
```bash
# Verify secret exists
kubectl get secret todo-app-secrets -n todo-app

# If missing, create it
./scripts/create-secrets.sh --namespace todo-app
```

### Issue: Invalid Secret Values

**Symptoms**: Application fails to start, authentication errors

**Diagnosis**:
```bash
# Check secret values (in secure environment)
kubectl get secret todo-app-secrets -n todo-app -o json | jq '.data | map_values(@base64d)'
```

**Solution**:
```bash
# Update with correct values
kubectl delete secret todo-app-secrets -n todo-app
./scripts/create-secrets.sh --namespace todo-app
kubectl rollout restart deployment -n todo-app
```

### Issue: Secret Not Updating in Pods

**Symptoms**: Pods still use old secret values after update

**Cause**: Pods don't automatically reload secrets

**Solution**:
```bash
# Restart pods to pick up new secrets
kubectl rollout restart deployment/todo-app-frontend -n todo-app
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

## Security Checklist

Before deploying to production:

- [ ] All secrets use strong, randomly generated values
- [ ] Secrets are different from development environment
- [ ] Secrets are not committed to version control
- [ ] Secret backup is encrypted and stored securely
- [ ] Only authorized personnel have access to secrets
- [ ] Secret rotation schedule is documented
- [ ] Monitoring is in place for secret access
- [ ] Incident response plan includes secret rotation
- [ ] Kubernetes cluster has encryption at rest enabled
- [ ] RBAC policies limit secret access

## Additional Resources

- **Kubernetes Secrets**: https://kubernetes.io/docs/concepts/configuration/secret/
- **Secret Management Best Practices**: https://kubernetes.io/docs/concepts/security/secrets-good-practices/
- **OpenAI API Keys**: https://platform.openai.com/api-keys
- **Neon Database Security**: https://neon.tech/docs/security/security-overview

---

**Last Updated**: 2026-02-09
**Security Level**: Critical
**Review Frequency**: Quarterly
