import { test, expect } from '@playwright/test';

test.describe('Modelia AI Studio', () => {
  test('app loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if main elements are visible using more specific selectors
    await expect(page.locator('h1:has-text("Modelia AI Studio")')).toBeVisible();
    await expect(page.locator('h2:has-text("Upload Image")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate")')).toBeVisible();
  });

  test('upload area is interactive', async ({ page }) => {
    await page.goto('/');
    
    // Check if upload area exists and is clickable using role selector
    const uploadButton = page.getByRole('button', { name: /upload image area/i });
    await expect(uploadButton).toBeVisible();
    
    // Check if file input exists (it's actually visible but transparent)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached(); // Just check it exists
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/');
    
    // Generate button should be disabled initially
    const generateButton = page.locator('button:has-text("Generate")');
    await expect(generateButton).toBeDisabled();
    
    // Check if prompt textarea exists
    const promptInput = page.locator('textarea[placeholder*="transform"]');
    await expect(promptInput).toBeVisible();
  });
});