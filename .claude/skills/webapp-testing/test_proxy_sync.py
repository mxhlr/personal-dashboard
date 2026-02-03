from playwright.sync_api import sync_playwright
import time

def test_proxy_sync():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Use headless=False to see what's happening
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Capture network requests
        network_logs = []
        page.on("request", lambda request: network_logs.append(f"→ {request.method} {request.url}"))
        page.on("response", lambda response: network_logs.append(f"← {response.status} {response.url}"))

        print("\n" + "="*80)
        print("TESTING PROXY SYNC FROM GEELARK")
        print("="*80 + "\n")

        try:
            # Navigate to proxies page
            print("1. Navigating to http://localhost:3000/proxies...")
            page.goto('http://localhost:3000/proxies', timeout=30000)

            # Wait for page to load
            print("2. Waiting for page to load completely...")
            page.wait_for_load_state('networkidle', timeout=30000)

            # Take a screenshot before clicking
            page.screenshot(path='/tmp/proxies_before_sync.png', full_page=True)
            print("3. Screenshot saved: /tmp/proxies_before_sync.png")

            # Look for the "Sync from Geelark" button
            print("4. Looking for 'Sync from Geelark' button...")
            sync_button = page.get_by_role("button", name="Sync from Geelark")

            if not sync_button.is_visible():
                print("   ❌ Button not found or not visible!")
                print("   Available buttons:")
                buttons = page.locator("button").all()
                for i, btn in enumerate(buttons):
                    print(f"     Button {i+1}: {btn.inner_text()}")
                return

            print("   ✓ Button found!")

            # Click the sync button
            print("5. Clicking 'Sync from Geelark' button...")
            sync_button.click()

            # Wait for sync to start (look for loading state)
            print("6. Waiting for sync operation to complete...")
            page.wait_for_timeout(2000)  # Give it 2 seconds to start

            # Wait for sync to complete (up to 30 seconds)
            # Look for toast notifications or button to be enabled again
            max_wait = 30
            for i in range(max_wait):
                # Check if button is enabled (not disabled)
                is_disabled = sync_button.is_disabled()
                if not is_disabled:
                    print(f"   ✓ Sync completed after {i+1} seconds")
                    break
                time.sleep(1)
                if i % 5 == 0:
                    print(f"   ... still syncing ({i+1}s)...")

            # Wait a bit more for any final logs
            page.wait_for_timeout(2000)

            # Take a screenshot after sync
            page.screenshot(path='/tmp/proxies_after_sync.png', full_page=True)
            print("7. Screenshot saved: /tmp/proxies_after_sync.png")

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            page.screenshot(path='/tmp/proxies_error.png', full_page=True)
            print("   Error screenshot saved: /tmp/proxies_error.png")

        finally:
            # Print all console logs
            print("\n" + "="*80)
            print("CONSOLE LOGS")
            print("="*80)
            if console_logs:
                for log in console_logs:
                    print(log)
            else:
                print("(No console logs captured)")

            # Check for [DISCORD] logs
            discord_logs = [log for log in console_logs if "[DISCORD]" in log]
            print("\n" + "="*80)
            print("DISCORD-RELATED LOGS")
            print("="*80)
            if discord_logs:
                print(f"Found {len(discord_logs)} Discord-related logs:")
                for log in discord_logs:
                    print(f"  {log}")
            else:
                print("❌ NO [DISCORD] LOGS FOUND!")
                print("   This means the Discord alert function was NOT called during sync.")

            # Print network activity summary
            print("\n" + "="*80)
            print("NETWORK ACTIVITY SUMMARY")
            print("="*80)
            discord_webhooks = [log for log in network_logs if "discord" in log.lower() or "webhook" in log.lower()]
            if discord_webhooks:
                print("Discord webhook requests found:")
                for log in discord_webhooks:
                    print(f"  {log}")
            else:
                print("No Discord webhook requests detected in network traffic.")

            # Count API calls
            convex_calls = [log for log in network_logs if "convex" in log.lower()]
            print(f"\nTotal Convex API calls: {len(convex_calls)}")

            print("\n" + "="*80)
            print("TEST COMPLETE")
            print("="*80 + "\n")

            browser.close()

if __name__ == "__main__":
    test_proxy_sync()
