# Continuous Integration (CI) Pipeline with Automated Tests

A demonstrative Node.js Express project featuring unit and integration testing with Jest, code linting with ESLint, and a continuous integration workflow configured via GitHub Actions.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Local Setup & Development](#local-setup--development)
- [Automated Testing & Linting](#automated-testing--linting)
- [CI Pipeline (GitHub Actions)](#ci-pipeline-github-actions)
- [Infrastructure as Code (Bicep)](#infrastructure-as-code-bicep)
- [Instrumentation Strategy (Application Insights)](#instrumentation-strategy-application-insights)
- [Security Compliance & Firing Gates](#security-compliance--firing-gates)
- [Automated Test Gates & Coverage Thresholds](#automated-test-gates--coverage-thresholds)
- [Pull Request Blocking Walkthrough](#pull-request-blocking-walkthrough)
- [AZ-400 Architectural Pipeline Trade-offs](#az-400-architectural-pipeline-trade-offs)
- [Pipeline Performance & Caching Analysis](#pipeline-performance--caching-analysis)
- [AZ-400 Concept Mapping Guide](#az-400-concept-mapping-guide)
- [API Documentation](#api-documentation)

---

## Project Overview

This repository demonstrates how to integrate automated quality controls into a project using a Continuous Integration (CI) pipeline. 

Every time a developer pushes code or submits a Pull Request, a GitHub Actions runner:
1. Installs all required dependencies.
2. Checks code formatting and syntax standards (Linting).
3. Executes a test suite containing both **unit tests** and **integration/endpoint tests**.
4. Blocks code from merging to main branches if any linting check or test fails.

---

## Directory Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions workflow configuration
├── src/
│   ├── app.js              # Express app definition & route handlers
│   ├── math.js             # Core business logic (Calculator math functions)
│   └── server.js           # Express app entrypoint (starts the server)
├── tests/
│   ├── app.test.js         # Integration/API tests for HTTP endpoints
│   └── math.test.js        # Unit tests for the core business logic
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Ignored files for Git version control
├── package.json            # Node.js project manifest and scripts
└── README.md               # Project documentation (this file)
```

---

## Local Setup & Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### 1. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 2. Start the Server
To run the server locally:
```bash
npm start
```
The application will boot and listen on port `3000` by default. You can test it in your browser or client at `http://localhost:3000/`.

---

## Automated Testing & Linting

We have included automated scripts inside `package.json` to keep development standards high:

### Run Linter
We use ESLint to maintain uniform styling rules and detect code smells.
```bash
npm run lint
```

### Run Tests
To run the automated tests locally:
```bash
npm test
```

### Run Tests with Coverage
To see how much of your codebase is covered by the test suite:
```bash
npm run test:coverage
```

---

## CI Pipeline (GitHub Actions)

The repository includes a pipeline file located at [.github/workflows/ci.yml](.github/workflows/ci.yml). 

### How it Works
1. **Triggers**: The pipeline automatically runs on any `push` or `pull_request` to the target branches `main`, `master`, and `dev`.
2. **Environment**: It boots up a clean virtual machine (`ubuntu-latest`) with Node.js v20.
3. **Caching**: It utilizes standard npm caching, allowing workflows to run extremely fast on subsequent builds.
4. **Execution Steps**:
   - `Checkout Code`: Downloads your repository code.
   - `Set up Node.js`: configures Node.js execution.
   - `Install Dependencies`: Installs packages via `npm ci` (faster and strictly matches package-lock).
   - `Run Linter`: Runs ESLint check (`npm run lint`).
   - `Run Tests`: Runs all test files (`npm test`). If any tests or lint checks fail, the workflow stops immediately with an error exit code, indicating a failed build.

---

## API Documentation

### 1. Health Status check
- **Endpoint**: `GET /`
- **Response**:
```json
{
  "status": "healthy",
  "message": "Continuous Integration Demo API is running",
  "timestamp": "2026-07-08T00:00:00.000Z"
}
```

### 2. Calculator Endpoint
- **Endpoint**: `POST /api/calculate`
- **Request Body**:
```json
{
  "op": "add", 
  "a": 10,
  "b": 5
}
```
- **Supported operators**: `add`, `subtract`, `multiply`, `divide`
- **Response (200 OK)**:
```json
{
  "operator": "add",
  "a": 10,
  "b": 5,
  "result": 15
}
```
- **Error Response (400 Bad Request / 422 Unprocessable)**:
```json
{
  "error": "Cannot divide by zero"
}
```

---

## Infrastructure as Code (Bicep)

The project contains a native Azure Bicep template located at [infra/main.bicep](infra/main.bicep).
It provisions:
- An **Azure App Service Plan** (Linux, Free tier F1).
- An **Azure Web App** running Node.js 20 LTS runtime.
- A **Log Analytics Workspace** and **Application Insights** instance.

Both CI pipelines validate this template automatically by compiling it via the Bicep CLI:
```bash
az bicep build --file infra/main.bicep
```

---

## Instrumentation Strategy (Application Insights)

To meet the "Instrumentation Everywhere" requirement, we integrated the official Azure Application Insights SDK inside [src/app.js](src/app.js). 

If the application is deployed and the connection string is passed via environment variables, App Insights will automatically trace:
- Incoming HTTP requests (latencies, codes, counts).
- App exceptions and console errors.
- Performance metrics (CPU, RAM, Event Loop).
- Outgoing external dependencies (database/HTTP calls).

**Local Configuration**:
To simulate telemetry locally, set the environment variable:
```bash
$env:APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=your-guid-here;IngestionEndpoint=..."
```

---

## Security Compliance & Firing Gates

As per the AZ-400 guidelines, security checks must be active **compliance gates** that physically fail the build if a vulnerability is detected. 

### 1. Firing the Gate (Planned Failure)
To demonstrate the compliance gate firing, we intentionally added a vulnerable version of `lodash` (`4.17.15`) into [package.json](package.json). This version contains a known high-severity vulnerability (Prototype Pollution).

When either GitHub Actions or Azure Pipelines runs the security check step:
```bash
npm run security-check
```
The pipeline scanner finds the vulnerability, prints the audit details, returns an exit code of `1`, and **halts the pipeline run**, preventing a deployment.

### 2. Resolving the Failure (Succeeding the Gate)
To fix the pipeline failure:
1. Open [package.json](package.json).
2. Update the `"lodash"` version to `"^4.17.21"`.
3. Run `npm install`.
4. Push the changes. The pipeline security gate will now pass, allowing the build and tests to succeed.

---

## AZ-400 Concept Mapping Guide

This project maps key concepts across both Microsoft Azure DevOps and GitHub Actions:

| Concept | Azure DevOps Services | GitHub Actions |
| :--- | :--- | :--- |
| **Configuration File** | `azure-pipelines.yml` | `.github/workflows/ci.yml` |
| **Workflow Trigger** | `trigger` (branches) | `on` (push/pull_request) |
| **Virtual Runner** | `pool` (e.g., `ubuntu-latest`) | `runs-on` (e.g., `ubuntu-latest`) |
| **Job Group / Stage** | `stage` | `jobs` / `needs` dependency |
| **Individual Job** | `job` | `jobs.<job_id>` |
| **Task Execution** | `task` (e.g., `NodeTool@0`, `PublishTestResults@2`) | `uses` (e.g., `actions/setup-node@v4`) |
| **Command Runner** | `script` or `bash` | `run` |
| **Test Telemetry** | `PublishTestResults` task (JUnit dashboard) | Native Actions Summary or Third-party integrations |
| **Key Store** | Azure Key Vault | GitHub Secrets / Environment Secrets |
| **Agent Runner** | Microsoft-hosted or Self-hosted Agents | GitHub-hosted or Self-hosted Runners |

---

## Automated Test Gates & Coverage Thresholds

To protect the `main`/`master` branch from untested code, the CI pipeline enforces strict **automated test gates**:
- All **23 unit/integration tests** must pass.
- Overall **code coverage must meet or exceed 90%** globally (statements, branches, functions, and lines).

The coverage thresholds are configured directly in [package.json](package.json):
```json
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
```
If a developer deletes/comments out tests or introduces new modules without corresponding test coverage, the Jest coverage check will exit with code `1`, immediately halting the pipeline.

---

## Pull Request Blocking Walkthrough

The guidelines state: *"Introduce a deliberately failing test and confirm the pull request is correctly blocked from merging."*

### 1. Firing the Test Gate (PR Blocked)
We created a dedicated test file at [tests/failing.test.js](tests/failing.test.js).
- Inside the file, `const shouldFail = true;` is configured by default.
- Run the test suite: `npm run test:ci`. Jest will throw an error: `Deliberate pipeline block...`
- Push this code and open a Pull Request.
- **Pipeline Outcome**: The pipeline fails during the "Run Tests" / "Test_and_Publish" stage. Due to GitHub/Azure DevOps branch protection policies, the PR will be **blocked from merging** because the status check failed.
- **Artifact Outcome**: The **Publish_Artifact** / **Upload Build Artifact** step does **not** execute, ensuring that versioned build artifacts are only generated when all tests pass.

### 2. Clearing the Test Gate (PR Unblocked)
To resolve the pipeline blockage and allow code merging:
1. Open [tests/failing.test.js](tests/failing.test.js).
2. Modify the flag to: `const shouldFail = false;`
3. Commit and push the changes. The pipeline will pass, the test report will be published, and the build artifact will be uploaded, unblocking the PR.

---

## AZ-400 Architectural Pipeline Trade-offs

For the AZ-400 track, it is essential to understand the architectural trade-offs between execution triggers:

### Running Pipelines on Every Commit (Push) vs. Only on Pull Requests

| Strategy | Feedback Speed | Compute & Cost | Storage Impact | Developer Experience |
| :--- | :--- | :--- | :--- | :--- |
| **On Every Commit (Push)** | **Extremely Fast**: Developers get instant feedback on their branch immediately after pushing code. | **High**: Pushing multiple commits in rapid succession triggers many redundant pipeline runs, inflating build minute costs. | **High**: Generates and stores multiple build packages/logs for transitional work. | Can be noisy with notifications for unfinished feature commits. |
| **Only on Pull Requests (PR)** | **Moderate**: Feedback is deferred until the developer is ready to request a code review and opens a PR. | **Low / Optimal**: Pipelines only run when code is proposed for merge, saving compute hours and parallel job capacity. | **Low**: Packages and artifacts are only generated for pull requests nearing production. | Cleaner workspace; developers can iterate locally before running formal cloud verifications. |

---

## Pipeline Performance & Caching Analysis

- **Average Pipeline Run Time**: ~40 seconds on standard Microsoft-hosted / GitHub-hosted virtual environments.
- **Single Slowest Step**: **Dependency Installation** (`npm ci` / `npm install`). Installing 478 packages takes ~20 seconds, representing **50% of the total run time**.

### Suggested Optimization: Dependency Caching
To optimize and speed up the pipeline, we configured **dependency caching** on both platforms:
- **GitHub Actions**: Enabled via `cache: 'npm'` in the `actions/setup-node@v4` action. On subsequent runs, npm fetches packages directly from the local runner cache rather than the npm registry, reducing dependency installation time from 20 seconds to **under 5 seconds** (a ~75% speed improvement).
- **Azure Pipelines**: Configured caching by matching `package-lock.json` hash keys to cache the `~/.npm` cache directory, achieving a similar speedup on subsequent runs.

Hi

