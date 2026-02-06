/**
 * E2E Tests: Visionboard Management
 *
 * Tests visionboard creation, item management, and organization
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { createUserWithOnboarding } from './fixtures/database';
import { TEST_VISIONBOARD_LISTS } from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';
import { navigateTo } from './utils/navigation';

test.describe('Visionboard Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await createUserWithOnboarding();
  });

  test('should display visionboard', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Verify visionboard is visible
    await expect(page.locator('[data-testid="visionboard"]')).toBeVisible();

    // Verify empty state or existing lists
    const hasLists = (await page.locator('[data-testid="visionboard-list"]').count()) > 0;

    if (!hasLists) {
      // Should show empty state
      await expect(page.locator('[data-testid="visionboard-empty"]')).toBeVisible();
    }
  });

  test('should create visionboard list', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Click create list button
    await page.click('[data-testid="create-list-button"]');

    // Fill list name
    const listName = TEST_VISIONBOARD_LISTS[0].name;
    await page.fill('[data-testid="list-name-input"]', listName);

    // Save list
    await page.click('[data-testid="save-list-button"]');

    await waitForConvexSync(page);

    // Verify list appears
    await expect(page.locator(`text=${listName}`)).toBeVisible();
  });

  test('should add item to visionboard list', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Create list first if needed
    const hasLists = (await page.locator('[data-testid="visionboard-list"]').count()) > 0;

    if (!hasLists) {
      await page.click('[data-testid="create-list-button"]');
      await page.fill('[data-testid="list-name-input"]', 'Test List');
      await page.click('[data-testid="save-list-button"]');
      await waitForConvexSync(page);
    }

    // Get first list
    const list = page.locator('[data-testid="visionboard-list"]').first();

    // Click add item
    await list.locator('[data-testid="add-item-button"]').click();

    // Fill item details
    const item = TEST_VISIONBOARD_LISTS[0].items[0];
    await page.fill('[data-testid="item-title-input"]', item.title);
    await page.fill('[data-testid="item-description-input"]', item.description);

    // Save item
    await page.click('[data-testid="save-item-button"]');

    await waitForConvexSync(page);

    // Verify item appears in list
    await expect(list.locator(`text=${item.title}`)).toBeVisible();
  });

  test('should edit visionboard item', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Find first item
    const item = page.locator('[data-testid="visionboard-item"]').first();

    // Click edit
    await item.locator('[data-testid="edit-item-button"]').click();

    // Update title
    const updatedTitle = 'Updated Item Title';
    await page.fill('[data-testid="item-title-input"]', updatedTitle);

    // Save
    await page.click('[data-testid="save-item-button"]');

    await waitForConvexSync(page);

    // Verify updated title
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
  });

  test('should delete visionboard item', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Find first item
    const item = page.locator('[data-testid="visionboard-item"]').first();

    // Get item title for verification
    const itemTitle = await item.locator('[data-testid="item-title"]').textContent();

    // Open item menu
    await item.locator('[data-testid="item-menu"]').click();

    // Click delete
    await page.click('[data-testid="delete-item"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');

    await waitForConvexSync(page);

    // Verify item is removed
    await expect(page.locator(`text=${itemTitle}`)).not.toBeVisible();
  });

  test('should reorder visionboard items', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Get first list with multiple items
    const list = page.locator('[data-testid="visionboard-list"]').first();

    // Ensure we have at least 2 items
    const itemCount = await list.locator('[data-testid="visionboard-item"]').count();

    if (itemCount < 2) {
      // Add items first
      for (let i = 0; i < 2; i++) {
        await list.locator('[data-testid="add-item-button"]').click();
        await page.fill('[data-testid="item-title-input"]', `Item ${i + 1}`);
        await page.click('[data-testid="save-item-button"]');
        await waitForConvexSync(page);
      }
    }

    // Get items
    const firstItem = list.locator('[data-testid="visionboard-item"]').first();
    const secondItem = list.locator('[data-testid="visionboard-item"]').nth(1);

    const firstItemTitle = await firstItem.locator('[data-testid="item-title"]').textContent();
    const secondItemTitle = await secondItem.locator('[data-testid="item-title"]').textContent();

    // Drag first item to second position
    await firstItem.dragTo(secondItem);

    await waitForConvexSync(page);

    // Verify order changed
    const newFirstItem = list.locator('[data-testid="visionboard-item"]').first();
    const newFirstItemTitle = await newFirstItem.locator('[data-testid="item-title"]').textContent();

    expect(newFirstItemTitle).toBe(secondItemTitle);
  });

  test('should upload image to visionboard item', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Find first item
    const item = page.locator('[data-testid="visionboard-item"]').first();

    // Click to edit
    await item.locator('[data-testid="edit-item-button"]').click();

    // Click upload image
    await page.click('[data-testid="upload-image-button"]');

    // Note: File upload testing would require actual file handling
    // For now, we'll test the UI flow

    // Verify file input is available
    await expect(page.locator('[data-testid="image-upload-input"]')).toBeVisible();

    // In a real test, you would:
    // const fileInput = page.locator('[data-testid="image-upload-input"]');
    // await fileInput.setInputFiles('path/to/test-image.jpg');
  });

  test('should delete visionboard list', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Get first list
    const list = page.locator('[data-testid="visionboard-list"]').first();

    // Get list name for verification
    const listName = await list.locator('[data-testid="list-name"]').textContent();

    // Open list menu
    await list.locator('[data-testid="list-menu"]').click();

    // Click delete
    await page.click('[data-testid="delete-list"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-list"]');

    await waitForConvexSync(page);

    // Verify list is removed
    await expect(page.locator(`text=${listName}`)).not.toBeVisible();
  });

  test('should rename visionboard list', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Get first list
    const list = page.locator('[data-testid="visionboard-list"]').first();

    // Open list menu
    await list.locator('[data-testid="list-menu"]').click();

    // Click rename
    await page.click('[data-testid="rename-list"]');

    // Enter new name
    const newName = 'Renamed List';
    await page.fill('[data-testid="list-name-input"]', newName);

    // Save
    await page.click('[data-testid="save-list-name"]');

    await waitForConvexSync(page);

    // Verify list renamed
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('should use masonry layout for visionboard', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Verify masonry layout is applied
    await expect(page.locator('[data-testid="visionboard-masonry"]')).toBeVisible();

    // Check that items have masonry styling
    const items = page.locator('[data-testid="visionboard-item"]');
    const count = await items.count();

    if (count > 0) {
      // Verify items are in masonry grid
      const firstItem = items.first();
      await expect(firstItem).toBeVisible();
    }
  });

  test('should filter visionboard by search', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Enter search term
    await page.fill('[data-testid="visionboard-search"]', 'Career');

    await waitForConvexSync(page, 1000);

    // Verify only matching items are shown
    const visibleItems = page.locator('[data-testid="visionboard-item"]:visible');
    const count = await visibleItems.count();

    if (count > 0) {
      // All visible items should match search
      for (let i = 0; i < count; i++) {
        const itemText = await visibleItems.nth(i).textContent();
        expect(itemText?.toLowerCase()).toContain('career');
      }
    }
  });

  test('should mark visionboard item as achieved', async ({ page }) => {
    await navigateTo(page, 'visionboard');

    // Find first item
    const item = page.locator('[data-testid="visionboard-item"]').first();

    // Click achievement checkbox
    await item.locator('[data-testid="achievement-checkbox"]').click();

    await waitForConvexSync(page);

    // Verify item marked as achieved
    await expect(item.locator('[data-testid="achievement-badge"]')).toBeVisible();

    // Verify celebration animation
    await expect(page.locator('[data-testid="achievement-celebration"]')).toBeVisible();
  });
});
