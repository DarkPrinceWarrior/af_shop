import { test, expect } from '@playwright/test';

test('TopBar Sign in pill leads to /login and admin login redirects to /account', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('#auth_email').fill('admin@example.com');
  await page.locator('#auth_password').fill('changethis');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/account$/, { timeout: 10_000 });
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
});

test('protected route redirects unauth user to /login and back after auth', async ({
  page,
}) => {
  await page.goto('/account/profile');
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('#auth_email').fill('admin@example.com');
  await page.locator('#auth_password').fill('changethis');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/account\/profile$/, { timeout: 10_000 });
});
