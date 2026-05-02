import { test, expect } from '@playwright/test';

test.describe('Админ-панель', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/');
        await page.fill('input[placeholder="ivanovii25"]', 'admin');
        await page.fill('input[placeholder="12345678"]', 'admin');
        await page.click('button:has-text("Login")');
        await expect(page).toHaveURL(/.*events/);
    });

    test('админ видит кнопку "Загрузить постер"', async ({ page }) => {
        await expect(page.locator('text=Загрузить постер & Создать событие')).toBeVisible();
    });

    test('админ может удалить событие', async ({ page }) => {
        await page.click('text=Загрузить постер & Создать событие');

        await page.getByLabel('Название').fill('Событие для удаления');
        await page.getByLabel('Дата (дд.мм.гггг)').fill('31.12.2026');
        await page.getByLabel('Время (чч:мм)').fill('20:00');
        await page.getByLabel('Место').fill('Москва');
        await page.getByLabel('Вместимость').fill('100');
        
        await page.click('button:has-text("Создать событие")');
        await expect(page.locator('.MuiAlert-message')).toBeVisible({ timeout: 10000 });
        
        await page.waitForTimeout(2000);
        await page.goto('http://localhost/events/1');
        
        await page.click('button:has-text("Delete")');
        await page.click('button:has-text("Удалить")');
        await expect(page).toHaveURL(/.*events/);
    });
});
