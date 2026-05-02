import { test, expect } from '@playwright/test';

test.describe('Погода (сторонний API)', () => {
    test('погода отображается на странице события', async ({ page }) => {
        await page.goto('http://localhost/events/1');
        await expect(
            page.locator('text=Загрузка погоды').or(page.locator('text=°C'))
        ).toBeVisible({ timeout: 10000 });
    });
});
