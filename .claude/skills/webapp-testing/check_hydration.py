from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Collect console messages
    console_messages = []
    errors = []

    def handle_console(msg):
        console_messages.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        })
        if msg.type in ['error', 'warning']:
            errors.append({
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            })

    page.on('console', handle_console)

    # Navigate to the page
    print("Navigating to http://localhost:3000...")
    page.goto('http://localhost:3000')

    # Wait for page to fully load
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)  # Extra wait for React hydration

    # Take screenshot
    screenshot_path = '/tmp/landing_page.png'
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Screenshot saved to: {screenshot_path}")

    # Print errors
    if errors:
        print("\n=== ERRORS AND WARNINGS FOUND ===")
        for i, error in enumerate(errors, 1):
            print(f"\n{i}. Type: {error['type']}")
            print(f"   Message: {error['text']}")
            if error['location']:
                print(f"   Location: {error['location']}")
    else:
        print("\n✅ No console errors or warnings found!")

    # Check for hydration-specific errors
    hydration_errors = [e for e in errors if 'hydrat' in e['text'].lower()]
    if hydration_errors:
        print("\n=== HYDRATION ERRORS DETECTED ===")
        for error in hydration_errors:
            print(f"\n{error['text']}")

    browser.close()

    # Exit with error code if errors found
    exit(1 if errors else 0)
