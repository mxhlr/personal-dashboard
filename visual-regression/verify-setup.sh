#!/bin/bash

# Visual Regression Testing Setup Verification Script
# This script checks if everything is properly configured

echo "=========================================="
echo "Visual Regression Testing Setup Check"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not found. Please install Node.js 16 or higher."
    exit 1
fi
echo ""

# 2. Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not found"
    exit 1
fi
echo ""

# 3. Check Playwright installation
echo "Checking Playwright installation..."
if npm list @playwright/test &> /dev/null; then
    PW_VERSION=$(npm list @playwright/test | grep @playwright/test | awk '{print $2}')
    check_pass "Playwright installed: $PW_VERSION"
else
    check_fail "Playwright not installed. Run: npm install"
    exit 1
fi
echo ""

# 4. Check Playwright CLI
echo "Checking Playwright CLI..."
if npx playwright --version &> /dev/null; then
    PW_CLI_VERSION=$(npx playwright --version)
    check_pass "Playwright CLI: $PW_CLI_VERSION"
else
    check_fail "Playwright CLI not working"
fi
echo ""

# 5. Check test directory structure
echo "Checking directory structure..."
if [ -d "visual-regression" ]; then
    check_pass "visual-regression directory exists"
else
    check_fail "visual-regression directory not found"
fi

if [ -f "playwright.config.ts" ]; then
    check_pass "playwright.config.ts exists"
else
    check_fail "playwright.config.ts not found"
fi
echo ""

# 6. Check test files
echo "Checking test files..."
TEST_FILES=(
    "visual-regression/dashboard.spec.ts"
    "visual-regression/habits.spec.ts"
    "visual-regression/reviews.spec.ts"
    "visual-regression/settings.spec.ts"
    "visual-regression/coach.spec.ts"
    "visual-regression/visionboard.spec.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$(basename $file)"
    else
        check_warn "$(basename $file) not found"
    fi
done
echo ""

# 7. Check fixtures
echo "Checking fixtures..."
if [ -d "visual-regression/fixtures" ]; then
    check_pass "fixtures directory exists"
    
    if [ -f "visual-regression/fixtures/auth.setup.ts" ]; then
        check_pass "auth.setup.ts"
    fi
    
    if [ -f "visual-regression/fixtures/test-data.ts" ]; then
        check_pass "test-data.ts"
    fi
else
    check_fail "fixtures directory not found"
fi
echo ""

# 8. Check documentation
echo "Checking documentation..."
DOCS=(
    "visual-regression/README.md"
    "visual-regression/QUICKSTART.md"
    "visual-regression/CONFIGURATION.md"
    "visual-regression/SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$(basename $doc)"
    else
        check_warn "$(basename $doc) not found"
    fi
done
echo ""

# 9. Check package.json scripts
echo "Checking npm scripts..."
SCRIPTS=(
    "test:visual"
    "test:visual:update"
    "test:visual:ui"
    "test:visual:report"
)

for script in "${SCRIPTS[@]}"; do
    if grep -q "\"$script\":" package.json; then
        check_pass "$script script configured"
    else
        check_warn "$script script not found in package.json"
    fi
done
echo ""

# 10. Check browser installation
echo "Checking Playwright browsers..."
if npx playwright install --dry-run chromium &> /dev/null; then
    check_warn "Browsers need to be installed. Run: npx playwright install"
else
    check_pass "Browsers appear to be installed"
fi
echo ""

# 11. Check GitHub Actions workflow
echo "Checking CI/CD configuration..."
if [ -f ".github/workflows/visual-regression.yml" ]; then
    check_pass "GitHub Actions workflow configured"
else
    check_warn "GitHub Actions workflow not found"
fi
echo ""

# 12. Check gitignore
echo "Checking .gitignore..."
if grep -q "visual-regression/test-results" .gitignore; then
    check_pass "Test results ignored in git"
else
    check_warn "Test results not in .gitignore"
fi
echo ""

# Summary
echo "=========================================="
echo "Setup Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Install browsers (if needed): npx playwright install"
echo "2. Start dev server: npm run dev"
echo "3. Generate baselines: npm run test:visual:update"
echo "4. Run tests: npm run test:visual"
echo ""
echo "Documentation:"
echo "- Quick start: visual-regression/QUICKSTART.md"
echo "- Full docs: visual-regression/README.md"
echo "- Configuration: visual-regression/CONFIGURATION.md"
echo ""
