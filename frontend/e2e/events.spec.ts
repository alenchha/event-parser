import { test, expect } from '@playwright/test';

test.describe('События', () => {
    test.setTimeout(60000);
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/');
        await page.fill('input[placeholder="ivanovii25"]', 'admin');
        await page.fill('input[placeholder="12345678"]', 'admin');
        await page.click('button:has-text("Login")');
        await expect(page).toHaveURL(/.*events/);
    });

    test('админ может создать событие', async ({ page }) => {
        await page.click('text=Загрузить постер & Создать событие');
        await expect(page).toHaveURL(/.*upload/);

        await page.getByLabel('Название').fill('E2E Тестовое событие');
        await page.getByLabel('Дата (дд.мм.гггг)').fill('31.12.2026');
        await page.getByLabel('Время (чч:мм)').fill('20:00');
        await page.getByLabel('Место').fill('Москва');
        await page.getByLabel('Вместимость').fill('100');
        
        await page.click('button:has-text("Создать событие")');

        await expect(page.locator('.MuiAlert-message')).toBeVisible({ timeout: 10000 });
    });

    test('пользователь может просматривать детали события', async ({ page }) => {
        await page.goto('http://localhost/events/1');
        await expect(page.locator('text=Регистрация')).toBeVisible({ timeout: 10000 });
    });

    test('фильтрация событий работает', async ({ page }) => {
        await page.goto('http://localhost/events');
        await page.getByLabel('Поиск по названию').fill('концерт');
        await expect(page).toHaveURL(/.*search=/);
    });
});
