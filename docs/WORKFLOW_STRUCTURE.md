# 🔄 CI/CD Workflow Structure

## Overview

We have **3 separate workflows** with clear responsibilities to avoid duplication:

---

## 📋 Workflow Breakdown

### 1. **backend-ci.yml** - Backend Testing
**Purpose**: Test backend code quality and functionality  
**Runs on**: Push/PR to `main` or `develop` (when backend files change)

**What it does**:
- ✅ Linting (ESLint)
- ✅ Unit tests (Jest)
- ✅ API tests (Cypress)
- ✅ Basic npm audit (HIGH/CRITICAL only)
- ✅ Code coverage reporting

**Does NOT include**: TruffleHog, Trivy, OWASP, CodeQL (those run in security-scan.yml)

---

### 2. **frontend-ci.yml** - Frontend Testing
**Purpose**: Test frontend code quality and functionality  
**Runs on**: Push/PR to `main` or `develop` (when frontend files change)

**What it does**:
- ✅ Linting (ESLint)
- ✅ Unit tests (Jest)
- ✅ E2E tests (Cypress)
- ✅ Build verification
- ✅ Basic npm audit (HIGH/CRITICAL only)
- ✅ Code coverage reporting

**Does NOT include**: TruffleHog, Trivy, OWASP, CodeQL (those run in security-scan.yml)

---

### 3. **security-scan.yml** - Comprehensive Security
**Purpose**: Deep security analysis of the entire codebase  
**Runs on**: 
- Daily at 2 AM UTC (scheduled)
- Push to `main`/`develop` (when package files change)
- Manual trigger

**What it does**:
- 🔐 **TruffleHog** - Secret scanning (entire git history)
- 🛡️ **Trivy** - Vulnerability scanning (dependencies, containers)
- 📊 **OWASP Dependency Check** - CVE database scanning
- 🔬 **CodeQL** - Static code analysis (SQL injection, XSS, etc.)
- ✅ **npm audit** - Dependency vulnerabilities
- 📦 **Package signatures** - Supply chain verification
- 📋 **Dependency Review** - PR dependency changes

---

## 🎯 Why This Structure?

### **Separation of Concerns**
- **CI workflows** focus on **code quality** (tests, linting, builds)
- **Security workflow** focuses on **security** (vulnerabilities, secrets, CVEs)

### **Faster Feedback**
- CI runs quickly on every push (just tests + basic audit)
- Security scans run daily or on-demand (more thorough but slower)

### **No Duplication**
- Each check runs **once** in the appropriate workflow
- Saves CI/CD time and resources
- Clearer results (no confusion about which scan failed)

---

## 📊 When Each Workflow Runs

```
PUSH TO DEVELOP
├─ backend-ci.yml (if backend/* changed)
│  └─ Tests + Linting + Basic npm audit
│
├─ frontend-ci.yml (if frontend/* changed)
│  └─ Tests + Linting + Build + Basic npm audit
│
└─ security-scan.yml (if package.json changed)
   └─ Full security suite

DAILY AT 2 AM UTC
└─ security-scan.yml
   └─ Full security suite

MANUAL TRIGGER
└─ security-scan.yml
   └─ Full security suite
```

---

## 🔍 What Gets Checked Where

| Check | backend-ci | frontend-ci | security-scan |
|-------|------------|-------------|---------------|
| **ESLint** | ✅ | ✅ | ❌ |
| **Jest Tests** | ✅ | ✅ | ❌ |
| **Cypress Tests** | ✅ | ✅ | ❌ |
| **Build** | ❌ | ✅ | ❌ |
| **npm audit (basic)** | ✅ | ✅ | ❌ |
| **npm audit (full)** | ❌ | ❌ | ✅ |
| **TruffleHog** | ❌ | ❌ | ✅ |
| **Trivy** | ❌ | ❌ | ✅ |
| **OWASP** | ❌ | ❌ | ✅ |
| **CodeQL** | ❌ | ❌ | ✅ |
| **Package Signatures** | ❌ | ❌ | ✅ |

---

## 🚀 Benefits

1. **Faster CI** - Tests run quickly without heavy security scans
2. **Clear Separation** - Easy to understand what each workflow does
3. **No Duplication** - Each check runs once in the right place
4. **Flexible** - Can run security scans on-demand without running tests
5. **Cost Effective** - Heavy scans run daily, not on every push

---

## 🔧 How to Use

### Run Tests Only:
```bash
git push origin develop
# Triggers: backend-ci.yml and/or frontend-ci.yml
```

### Run Security Scans:
- **Automatic**: Runs daily at 2 AM UTC
- **Manual**: Go to Actions → Security Scan → Run workflow

### Check Results:
- **CI Tests**: Check in PR or commit status
- **Security**: Check GitHub Security tab or Actions

---

## 📝 Summary

- **backend-ci.yml** = Backend quality checks
- **frontend-ci.yml** = Frontend quality checks  
- **security-scan.yml** = All security checks

**No overlap, no duplication, clear responsibilities!** ✨

---

**Last Updated**: December 8, 2024
