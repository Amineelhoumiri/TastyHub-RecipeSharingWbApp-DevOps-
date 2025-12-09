Prompt 1 — Fix CodeQL Analysis Failure

Task:
The CodeQL job fails because Code Scanning is disabled.
Enable Code Scanning for the repository.

Instructions:

Navigate to GitHub → Settings → Security → Code security & analysis.

Enable Code Scanning Alerts.

Ensure Dependabot and Secret Scanning are optionally enabled.

Re-run CodeQL workflow after enabling.

🔧 Prompt 2 — Fix Frontend Test Dependency Conflicts

Task:
Fix ESLint version conflict preventing npm ci from completing.

Instructions:

Update eslint dependency to ^9.0.0 OR downgrade eslint-config-next to a version that supports ESLint 8.

Ensure all related ESLint plugins remain compatible.

Run npm install to regenerate lockfile.

Commit updated package.json and package-lock.json.

🔧 Prompt 3 — Fix Deprecated Artifact Upload/Download Actions

Task:
Several workflow jobs fail because they still use deprecated actions:

actions/upload-artifact@v3
actions/download-artifact@v3


Instructions:

Replace ALL occurrences of upload-artifact@v3 with upload-artifact@v4.

Replace ALL occurrences of download-artifact@v3 with download-artifact@v4.

Ensure syntax remains valid YAML.

🔧 Prompt 4 — Fix Trivy Scan Failures (Frontend)

The Trivy scan fails for two reasons:

A. Deprecated CodeQL Action Usage

Instructions:

Update all CodeQL-related actions:

Replace:

uses: github/codeql-action/upload-sarif@v2


with

uses: github/codeql-action/upload-sarif@v3


If present, also update:

github/codeql-action/init@v2 → @v3
github/codeql-action/analyze@v2 → @v3

B. Missing Permissions for SARIF Upload

Instructions:
Add the following at the top of the workflow (under permissions:):

permissions:
  security-events: write
  contents: read


This allows SARIF reports to be uploaded to GitHub.

🔧 Prompt 5 — Re-run and Validate Backend Scans

Task:
Backend OWASP, audit, and Trivy scans were cancelled due to frontend failures.

Instructions:

After fixing the frontend workflows, rerun backend workflows to confirm they pass.

Ensure backend workflows also use:

actions/upload-artifact@v4

github/codeql-action/upload-sarif@v3

Proper permissions: block if uploading SARIF.

🔧 Prompt 6 — Full Repository Audit for Deprecated GitHub Actions

Task:
Scan all workflow files in .github/workflows/ and ensure no deprecated versions remain.

Instructions:

Search for any @v1 or @v2 GitHub actions and upgrade to the latest stable version.

Ensure consistency across frontend and backend workflows.

🔧 Prompt 7 — Final CI Pipeline Verification

After applying all fixes:

Instructions:

Re-run all GitHub Actions jobs.

Confirm all checks show green/✓ successful.

Document all changes made.

Open a PR (if needed) summarizing:

Dependency updates

Workflow version upgrades

Permissions added

Security scanning changes

✅ End of Prompts