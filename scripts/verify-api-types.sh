#!/bin/bash
# Verify API Types Implementation

echo "🔍 Verifying API Types Implementation..."
echo ""

# Check if all required files exist
echo "📁 Checking files..."
files=(
  "types/api/README.md"
  "types/api/MIGRATION.md"
  "types/api/SUMMARY.md"
  "types/api/QUICK_REFERENCE.md"
  "types/api/common.ts"
  "types/api/convex.ts"
  "types/api/routes.ts"
  "types/api/external.ts"
  "types/api/index.ts"
  "types/api/examples.ts"
  "types/api/__tests__/types.test.ts"
  "lib/api/client.ts"
  "lib/api/hooks.ts"
  "lib/api/index.ts"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (missing)"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✅ All files present!"
else
  echo "❌ $missing files missing"
  exit 1
fi

# Count lines of code
echo ""
echo "📊 Code Statistics:"
echo "  Types: $(cat types/api/*.ts 2>/dev/null | wc -l | xargs) lines"
echo "  Utils: $(cat lib/api/*.ts 2>/dev/null | wc -l | xargs) lines"
echo "  Docs: $(cat types/api/*.md 2>/dev/null | wc -l | xargs) lines"
echo "  Tests: $(cat types/api/__tests__/*.ts 2>/dev/null | wc -l | xargs) lines"

echo ""
echo "✨ Verification complete!"
