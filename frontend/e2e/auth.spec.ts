import { test, expect } from '@playwright/test';

test.describe('Авторизация', () => {
    test('пользователь может залогиниться', async ({ page }) => {
    await page.goto('http://localhost/');
    await page.fill('input[placeholder="ivanovii25"]', 'admin');
    await page.fill('input[placeholder="12345678"]', 'admin');
    
    await page.click('button:has-text("Login")');

    await page.waitForTimeout(2000);
    
    await expect(page).toHaveURL(/.*events/, { timeout: 10000 });
});

    test('неверный пароль показывает ошибку', async ({ page }) => {
        await page.goto('http://localhost/');
        await page.fill('input[placeholder="ivanovii25"]', 'admin');
        await page.fill('input[placeholder="12345678"]', 'wrongpassword');
        await page.click('button:has-text("Login")', { force: true });

        const snackbar = page.locator('.MuiAlert-root');
        await expect(snackbar).toBeVisible({ timeout: 5000 });

        await expect(page.locator('.MuiAlert-message')).toHaveText('Incorrect username or password');
    });

    test('пользователь может выйти', async ({ page }) => {
        await page.goto('http://localhost/');
        await page.fill('input[placeholder="ivanovii25"]', 'admin');
        await page.fill('input[placeholder="12345678"]', 'admin');
        await page.click('button:has-text("Login")');
        await expect(page).toHaveURL(/.*events/);

        await page.click('text=admin');

        await expect(page.locator('text=Выйти')).toBeVisible();
        await page.click('text=Выйти');

        await expect(page.locator('button:has-text("Выйти")').last()).toBeVisible();
        await page.click('button:has-text("Выйти")');

        await expect(page).toHaveURL('/');
    });
});
