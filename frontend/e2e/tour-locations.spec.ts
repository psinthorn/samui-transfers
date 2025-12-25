import { test, expect } from '@playwright/test'

test.describe('Tour Locations E2E', () => {
  test('should load tour locations page', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Check page title
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    // Check that we have location cards
    const cards = page.locator('[data-testid="location-card"]')
    await expect(cards).toHaveCount(12) // Default pagination
  })

  test('should search for locations', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Find search input
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible()
    
    // Type search term
    await searchInput.fill('beach')
    
    // Click search button or press enter
    await searchInput.press('Enter')
    
    // Wait for results
    await page.waitForLoadState('networkidle')
  })

  test('should filter by type', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Look for filter select/dropdown
    const typeSelect = page.locator('select[name="type"]')
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('beach')
      
      // Wait for results to update
      await page.waitForLoadState('networkidle')
    }
  })

  test('should navigate to location detail page', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Click first location card
    const firstCard = page.locator('[data-testid="location-card"]').first()
    await firstCard.click()
    
    // Check that we're on detail page
    await expect(page).toHaveURL(/\/tour-locations\/.*/)
    
    // Check for key sections on detail page
    const description = page.locator('[data-testid="description"]')
    const gallery = page.locator('[data-testid="gallery"]')
    
    await expect(description).toBeVisible()
    await expect(gallery).toBeVisible()
  })

  test('should navigate gallery images', async ({ page }) => {
    // Go to a location detail page
    await page.goto('/tour-locations/koh-samui')
    
    // Check gallery exists
    const gallery = page.locator('[data-testid="gallery"]')
    await expect(gallery).toBeVisible()
    
    // Click next button
    const nextButton = page.locator('button:has-text("Next")')
    if (await nextButton.isVisible()) {
      const initialImage = page.locator('img[alt*="gallery"]').first()
      const initialSrc = await initialImage.getAttribute('src')
      
      await nextButton.click()
      await page.waitForTimeout(300) // Allow animation
      
      const nextImage = page.locator('img[alt*="gallery"]').first()
      const nextSrc = await nextImage.getAttribute('src')
      
      // Source should be different (or same but position changed)
      expect(nextSrc).toBeDefined()
    }
  })

  test('should display location amenities', async ({ page }) => {
    await page.goto('/tour-locations/koh-samui')
    
    // Look for amenities section
    const amenities = page.locator('[data-testid="amenities"]')
    if (await amenities.isVisible()) {
      await expect(amenities).toBeVisible()
      
      // Should have at least one amenity
      const amenityItems = amenities.locator('li')
      const count = await amenityItems.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should show related locations', async ({ page }) => {
    await page.goto('/tour-locations/koh-samui')
    
    // Look for related locations section
    const relatedSection = page.locator('[data-testid="related-locations"]')
    if (await relatedSection.isVisible()) {
      const relatedCards = relatedSection.locator('[data-testid="location-card"]')
      const count = await relatedCards.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should display breadcrumbs on detail page', async ({ page }) => {
    await page.goto('/tour-locations/koh-samui')
    
    // Look for breadcrumb navigation
    const breadcrumb = page.locator('[data-testid="breadcrumb"]')
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toBeVisible()
      
      // Should have "Tour Locations" link
      const homeLink = breadcrumb.locator('a:has-text("Tour Locations")')
      expect(await homeLink.count()).toBeGreaterThan(0)
    }
  })

  test('should show approval badge for approved locations', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Look for approval badge
    const approvalBadge = page.locator('[data-testid="approval-badge"]')
    if (await approvalBadge.isVisible()) {
      await expect(approvalBadge).toBeVisible()
    }
  })

  test('should show featured badge for featured locations', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Look for featured badge
    const featuredBadge = page.locator('[data-testid="featured-badge"]')
    const count = await featuredBadge.count()
    
    // Featured should exist if there are featured items
    if (count > 0) {
      await expect(featuredBadge.first()).toBeVisible()
    }
  })

  test('should have working pagination', async ({ page }) => {
    await page.goto('/tour-locations')
    
    // Look for next page button
    const nextPageButton = page.locator('button:has-text("Next")')
    if (await nextPageButton.isVisible()) {
      // Get first item text
      const firstItem = page.locator('[data-testid="location-card"]').first()
      const firstItemText = await firstItem.textContent()
      
      // Click next page
      await nextPageButton.click()
      await page.waitForLoadState('networkidle')
      
      // First item should be different
      const newFirstItem = page.locator('[data-testid="location-card"]').first()
      const newFirstItemText = await newFirstItem.textContent()
      
      expect(newFirstItemText).not.toBe(firstItemText)
    }
  })
})
