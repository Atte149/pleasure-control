#!/bin/bash
# End-to-End Architecture Test Suite
# Tests all critical components and functionality

echo "=================================="
echo "🧪 PLEASURE CONTROL E2E TEST SUITE"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

test_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
    ((WARNINGS++))
}

echo "📋 TEST 1: Project Structure"
echo "----------------------------"

# Test 1.1: Check if package.json exists
test -f package.json
test_result $? "package.json exists"

# Test 1.2: Check if src directory exists
test -d src
test_result $? "src/ directory exists"

# Test 1.3: Check if index.html exists
test -f index.html
test_result $? "index.html exists"

# Test 1.4: Check if vite.config.ts exists
test -f vite.config.ts
test_result $? "vite.config.ts exists"

echo ""
echo "📋 TEST 2: Core Components"
echo "----------------------------"

# Test 2.1: Main entry point
test -f src/main.tsx
test_result $? "src/main.tsx exists"

# Test 2.2: App component
test -f src/App.tsx
test_result $? "src/App.tsx exists"

# Test 2.3: Home page
test -f src/pages/Home.tsx
test_result $? "src/pages/Home.tsx exists"

# Test 2.4: Layout component
test -f src/components/Layout.tsx
test_result $? "src/components/Layout.tsx exists"

echo ""
echo "📋 TEST 3: Feature Components"
echo "----------------------------"

# Test 3.1: Device Panel
test -f src/components/DevicePanel.tsx
test_result $? "DevicePanel component exists"

# Test 3.2: Manual Control
test -f src/components/ManualControlPanel.tsx
test_result $? "ManualControlPanel component exists"

# Test 3.3: Waveform Panel
test -f src/components/WaveformPanel.tsx
test_result $? "WaveformPanel component exists"

# Test 3.4: Advanced Modes
test -f src/components/AdvancedModes.tsx
test_result $? "AdvancedModes component exists"

# Test 3.5: Game Mode
test -f src/components/GameMode.tsx
test_result $? "GameMode component exists"

# Test 3.6: Settings Panel
test -f src/components/SettingsPanel.tsx
test_result $? "SettingsPanel component exists"

# Test 3.7: Pattern Presets
test -f src/components/PatternPresets.tsx
test_result $? "PatternPresets component exists"

# Test 3.8: Battery Indicator
test -f src/components/BatteryIndicator.tsx
test_result $? "BatteryIndicator component exists"

# Test 3.9: Theme Toggle
test -f src/components/ThemeToggle.tsx
test_result $? "ThemeToggle component exists"

# Test 3.10: Theme Provider
test -f src/components/ThemeProvider.tsx
test_result $? "ThemeProvider component exists"

echo ""
echo "📋 TEST 4: Hooks"
echo "----------------------------"

# Test 4.1: useButtplug
test -f src/hooks/useButtplug.ts
test_result $? "useButtplug hook exists"

# Test 4.2: useWaveform
test -f src/hooks/useWaveform.ts
test_result $? "useWaveform hook exists"

# Test 4.3: useAdvancedModes
test -f src/hooks/useAdvancedModes.ts
test_result $? "useAdvancedModes hook exists"

# Test 4.4: useGameMode
test -f src/hooks/useGameMode.ts
test_result $? "useGameMode hook exists"

# Test 4.5: useSettings
test -f src/hooks/useSettings.ts
test_result $? "useSettings hook exists"

echo ""
echo "📋 TEST 5: Types & Utils"
echo "----------------------------"

# Test 5.1: Types
test -f src/types/index.ts
test_result $? "Type definitions exist"

# Test 5.2: Utils
test -f src/lib/utils.ts
test_result $? "Utils library exists"

# Test 5.3: Pattern Presets
test -f src/lib/patternPresets.ts
test_result $? "Pattern presets library exists"

echo ""
echo "📋 TEST 6: Styles"
echo "----------------------------"

# Test 6.1: Index CSS
test -f src/index.css
test_result $? "index.css exists"

# Test 6.2: Tailwind config
test -f tailwind.config.js
test_result $? "tailwind.config.js exists"

echo ""
echo "📋 TEST 7: TypeScript Compilation"
echo "----------------------------"

# Test 7.1: TypeScript check
npx tsc --noEmit 2>&1 | grep -q "error TS"
if [ $? -eq 0 ]; then
    test_result 1 "TypeScript compilation (has errors)"
    echo "   Run 'npx tsc --noEmit' to see errors"
else
    test_result 0 "TypeScript compilation (no errors)"
fi

echo ""
echo "📋 TEST 8: Dependencies"
echo "----------------------------"

# Test 8.1: node_modules exists
test -d node_modules
test_result $? "node_modules installed"

# Test 8.2: Check critical dependencies
if [ -d node_modules ]; then
    test -d node_modules/react
    test_result $? "React installed"

    test -d node_modules/buttplug
    test_result $? "Buttplug.io installed"

    test -d node_modules/lucide-react
    test_result $? "Lucide icons installed"

    test -d node_modules/tailwindcss
    test_result $? "Tailwind CSS installed"
fi

echo ""
echo "📋 TEST 9: Build System"
echo "----------------------------"

# Test 9.1: Check if build succeeds
echo "   Building application..."
npm run build > /tmp/build-test.log 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    test_result 0 "Production build succeeds"
else
    test_result 1 "Production build succeeds"
    echo "   Check /tmp/build-test.log for details"
fi

# Test 9.2: Check if dist exists after build
if [ $BUILD_EXIT -eq 0 ]; then
    test -d dist
    test_result $? "dist/ directory created"

    test -f dist/index.html
    test_result $? "dist/index.html exists"

    # Check if assets are generated
    if [ -d dist/assets ]; then
        JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
        CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)

        [ $JS_COUNT -gt 0 ]
        test_result $? "JavaScript bundles generated ($JS_COUNT files)"

        [ $CSS_COUNT -gt 0 ]
        test_result $? "CSS bundles generated ($CSS_COUNT files)"
    fi
fi

echo ""
echo "📋 TEST 10: Server Functionality"
echo "----------------------------"

# Test 10.1: Check if dev server is running
curl -s http://localhost:3001/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_result 0 "Dev server is accessible"

    # Test 10.2: Check if HTML is served
    curl -s http://localhost:3001/ | grep -q "Pleasure Control"
    test_result $? "HTML contains app title"

    # Test 10.3: Check if Vite client is injected
    curl -s http://localhost:3001/ | grep -q "@vite/client"
    test_result $? "Vite HMR client injected"
else
    test_warning "Dev server not accessible (may not be running)"
fi

echo ""
echo "📋 TEST 11: Code Quality"
echo "----------------------------"

# Test 11.1: Check for console.log (should be minimal)
LOG_COUNT=$(grep -r "console.log" src/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ $LOG_COUNT -lt 10 ]; then
    test_result 0 "Console.log usage is minimal ($LOG_COUNT occurrences)"
else
    test_warning "Many console.log statements found ($LOG_COUNT)"
fi

# Test 11.2: Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)
if [ $TODO_COUNT -eq 0 ]; then
    test_result 0 "No TODO/FIXME comments"
else
    test_warning "Found $TODO_COUNT TODO/FIXME comments"
fi

echo ""
echo "📋 TEST 12: Documentation"
echo "----------------------------"

# Test 12.1: CHANGELOG exists
test -f ../CHANGELOG.md
test_result $? "CHANGELOG.md exists"

# Test 12.2: DOCUMENTATION exists
test -f ../DOCUMENTATION.md
test_result $? "DOCUMENTATION.md exists"

# Test 12.3: FINAL_REPORT exists
test -f ../FINAL_REPORT.md
test_result $? "FINAL_REPORT.md exists"

echo ""
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Success Rate: $PERCENTAGE% ($PASSED/$TOTAL)"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please review the failures above."
    exit 1
fi
