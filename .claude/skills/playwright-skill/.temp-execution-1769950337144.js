const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  const errors = [];

  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });

    if (type === 'error') {
      console.log(`🔴 Console Error: ${text}`);
      errors.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`🔴 Page Error: ${error.message}`);
    errors.push(error.message);
  });

  console.log('🔍 Testing Proxy Orchestrator Page');
  console.log('URL: https://realriseagency.com/proxies\n');

  try {
    await page.goto('https://realriseagency.com/proxies', {
      waitUntil: 'networkidle',
      timeout: 20000
    });

    console.log('⏳ Waiting 8 seconds for app to load...\n');
    await page.waitForTimeout(8000);

    // Check for error boundary
    const bodyText = await page.textContent('body');
    const hasAppError = bodyText.includes('Application error');
    const hasConvexError = bodyText.includes('Could not find public function');

    console.log('📊 RESULTS:');
    console.log('='.repeat(60));

    if (hasAppError) {
      console.log('❌ Application error detected on page');

      // Try to find specific error message
      const errorMatch = bodyText.match(/Could not find public function for '([^']+)'/);
      if (errorMatch) {
        console.log(`❌ Missing function: ${errorMatch[1]}`);
      }
    } else {
      console.log('✅ No application error');
    }

    if (errors.length > 0) {
      console.log('\n🔴 Errors found:');
      errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.substring(0, 200)}`);
      });
    } else {
      console.log('\n✅ No JavaScript errors');
    }

    // Take screenshot
    await page.screenshot({
      path: '/tmp/proxy-orchestrator-error.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot: /tmp/proxy-orchestrator-error.png');

  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
  }

  await browser.close();
})();
