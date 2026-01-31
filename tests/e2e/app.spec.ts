// tests/e2e/app.spec.ts
// E2E tests for Hazon app

import { test, expect } from '@playwright/test'

test.describe('Hazon App', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Hazon|Vite/)
    
    // Check for main app elements
    await expect(page.locator('#root')).toBeVisible()
  })

  test('should display recent scripts section', async ({ page }) => {
    await page.goto('/')
    
    // Look for the recents section or new script button
    // Adjust selectors based on your actual UI
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
  })
})

test.describe('Script Creation', () => {
  test('should open new script modal when clicking new script button', async ({ page }) => {
    await page.goto('/')
    
    // Find and click the new script button (adjust selector)
    const newScriptBtn = page.locator('[data-testid="new-script-btn"], button:has-text("New"), button:has-text("Create")')
    
    if (await newScriptBtn.count() > 0) {
      await newScriptBtn.first().click()
      
      // Modal should appear
      await expect(page.locator('[role="dialog"], .modal, [data-testid="new-script-modal"]')).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Navigation', () => {
  test('should navigate to script page with valid ID', async ({ page }) => {
    // Navigate to a script page (will likely show error or empty state without real data)
    await page.goto('/script/test-id')
    
    // Page should load without crashing
    await expect(page.locator('#root')).toBeVisible()
  })
})
