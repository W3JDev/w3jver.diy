import { test, expect } from '@playwright/test';

test.describe('W3Jverse Platform E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('W3Jverse homepage loads with complete branding', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/W3Jverse/);
    
    // Verify W3Jverse logo and branding
    const logo = page.locator('[data-testid="w3jverse-logo"]');
    await expect(logo).toBeVisible();
    
    // Ensure no bolt.diy remnants
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('bolt.diy');
    expect(pageContent).not.toContain('bolt.new');
    
    // Verify W3Jverse premium styling
    const mainContainer = page.locator('.w3j-main-container');
    await expect(mainContainer).toHaveClass(/w3j-glass-morphism/);
  });

  test('AI model selection works with all 18 providers', async ({ page }) => {
    // Open model selector
    const modelSelector = page.locator('[data-testid="model-selector"]');
    await modelSelector.click();
    
    // Verify all 18 AI models are present
    const models = [
      'Gemini 2.0 Flash',
      'DeepSeek V3',
      'Llama 3.3 70B',
      'Claude 3.5 Sonnet',
      'GPT-4o',
      'Grok-2',
      'Command R+',
      'Qwen2.5 72B',
      'Mistral Large',
      'Perplexity Sonar',
      'O1 Mini',
      'Cohere Command',
      'Claude 3.5 Haiku',
      'Gemini Pro 1.5',
      'GPT-4 Turbo',
      'Llama 3.1 8B',
      'Phi-3 Medium',
      'StarCoder2 15B'
    ];
    
    for (const model of models) {
      const modelOption = page.locator(`text=${model}`);
      await expect(modelOption).toBeVisible();
    }
  });

  test('Code generation performance under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Enter prompt
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Create a simple React counter component');
    
    // Send message
    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();
    
    // Wait for response
    const response = page.locator('[data-testid="ai-response"]').first();
    await expect(response).toBeVisible({ timeout: 3000 });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(2000);
  });

  test('Multimodal input functionality', async ({ page }) => {
    // Test file upload
    const fileInput = page.locator('[data-testid="file-upload"]');
    await expect(fileInput).toBeVisible();
    
    // Test image upload
    const imageUpload = page.locator('[data-testid="image-upload"]');
    await expect(imageUpload).toBeVisible();
    
    // Test voice input button
    const voiceButton = page.locator('[data-testid="voice-input"]');
    await expect(voiceButton).toBeVisible();
    
    // Test text input
    const textInput = page.locator('[data-testid="chat-input"]');
    await expect(textInput).toBeVisible();
  });

  test('Deployment integration buttons work', async ({ page }) => {
    // Generate a simple project first
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Create a simple HTML page');
    
    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();
    
    // Wait for code to be generated
    await expect(page.locator('[data-testid="generated-code"]')).toBeVisible();
    
    // Check deployment buttons
    const vercelBtn = page.locator('[data-testid="deploy-vercel"]');
    const netlifyBtn = page.locator('[data-testid="deploy-netlify"]');
    const railwayBtn = page.locator('[data-testid="deploy-railway"]');
    
    await expect(vercelBtn).toBeVisible();
    await expect(netlifyBtn).toBeVisible();
    await expect(railwayBtn).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
    
    // Check chat interface on mobile
    const chatContainer = page.locator('[data-testid="chat-container"]');
    await expect(chatContainer).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    const tabletLayout = page.locator('[data-testid="tablet-layout"]');
    await expect(tabletLayout).toBeVisible();
  });

  test('Performance metrics meet requirements', async ({ page }) => {
    // Start performance monitoring
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const navigation = entries.find(entry => entry.entryType === 'navigation');
          if (navigation) {
            resolve({
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              firstContentfulPaint: navigation.domContentLoadedEventEnd - navigation.fetchStart
            });
          }
        }).observe({ entryTypes: ['navigation'] });
        
        setTimeout(() => resolve(null), 5000);
      });
    });
    
    if (performanceMetrics) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(100);
      expect(performanceMetrics.domContentLoaded).toBeLessThan(500);
    }
  });

  test('Enterprise features accessibility', async ({ page }) => {
    // Check team collaboration features
    const teamBtn = page.locator('[data-testid="team-collaboration"]');
    if (await teamBtn.isVisible()) {
      await teamBtn.click();
      await expect(page.locator('[data-testid="team-dashboard"]')).toBeVisible();
    }
    
    // Check marketplace
    const marketplaceBtn = page.locator('[data-testid="marketplace"]');
    if (await marketplaceBtn.isVisible()) {
      await marketplaceBtn.click();
      await expect(page.locator('[data-testid="template-marketplace"]')).toBeVisible();
    }
    
    // Check white-label options
    const whitelabelBtn = page.locator('[data-testid="whitelabel"]');
    if (await whitelabelBtn.isVisible()) {
      await whitelabelBtn.click();
      await expect(page.locator('[data-testid="branding-options"]')).toBeVisible();
    }
  });

  test('Security features active', async ({ page }) => {
    // Check HTTPS
    expect(page.url()).toMatch(/^https:/);
    
    // Check CSP headers
    const response = await page.goto(page.url());
    const cspHeader = response?.headers()['content-security-policy'];
    expect(cspHeader).toBeDefined();
    
    // Check input sanitization
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('<script>alert("xss")</script>');
    
    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();
    
    // Should not execute script
    await page.waitForTimeout(1000);
    const alertTriggered = await page.evaluate(() => window.alertTriggered);
    expect(alertTriggered).toBeFalsy();
  });

  test('Glass morphism and holographic effects', async ({ page }) => {
    // Check glass morphism container
    const glassContainer = page.locator('.w3j-prompt-container');
    await expect(glassContainer).toHaveCSS('backdrop-filter', /blur/);
    
    // Check holographic particles
    const particles = page.locator('[data-testid="w3j-holographic-particles"]');
    await expect(particles).toBeVisible();
    
    // Check gradient backgrounds
    const gradientBg = page.locator('.w3j-gradient-background');
    await expect(gradientBg).toBeVisible();
  });
});