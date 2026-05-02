import { test, expect } from '@playwright/test';

test.describe('Аватарки (S3 хранилище)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/');
        await page.fill('input[placeholder="ivanovii25"]', 'admin');
        await page.fill('input[placeholder="12345678"]', 'admin');
        await page.click('button:has-text("Login")', { force: true });
        await expect(page).toHaveURL(/.*events/);
    });

    test('пользователь может загрузить аватарку', async ({ page }) => {
        await page.click('text=admin');

        await page.click('text=Сменить аватар');

        await expect(page.locator('.MuiDialog-root')).toBeVisible();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('./test-files/avatar.jpg');

        await expect(page.locator('text=avatar.jpg')).toBeVisible();

        await page.click('button:has-text("Загрузить")');

        await expect(page.locator('.MuiDialog-root')).not.toBeVisible();

        const avatar = page.locator('.MuiAvatar-root');
        await expect(avatar).toBeVisible();
    });

    test('пользователь может удалить аватарку', async ({ page }) => {
        await page.click('text=admin');

        await page.click('text=Сменить аватар');

        await expect(page.locator('.MuiDialog-root')).toBeVisible();

        const deleteButton = page.locator('button:has-text("Удалить")');
        if (await deleteButton.isVisible()) {
            await deleteButton.click();
            await expect(page.locator('.MuiDialog-root')).not.toBeVisible();
        }
    });
});
