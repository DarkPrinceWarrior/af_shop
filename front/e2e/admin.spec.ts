import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'changethis';

async function adminLogin(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('article').first().getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Your cart' })
    .getByRole('button', { name: 'Checkout' })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.locator('#auth_email').fill(ADMIN_EMAIL);
  await page.locator('#auth_password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 10_000 });
}

test('admin sees dashboard, orders list and catalog management', async ({ page }) => {
  await adminLogin(page);
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('link', { name: 'Orders' }).first().click();
  await expect(page).toHaveURL(/\/admin\/orders$/);

  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  await page.getByRole('link', { name: 'Categories' }).click();
  await expect(page).toHaveURL(/\/admin\/categories$/);
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
});

test('non-admin user cannot access /admin', async ({ page }) => {
  const email = `e2e+guard+${Date.now()}@example.com`;
  // register via UI
  await page.goto('/');
  await page.locator('article').first().getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Your cart' })
    .getByRole('button', { name: 'Checkout' })
    .click();
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await page.locator('#auth_full_name').fill('Guard Buyer');
  await page.locator('#auth_email').fill(email);
  await page.locator('#auth_password').fill('testpass1234');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 10_000 });

  await page.goto('/admin');
  await expect(page.getByText(/Admin only/)).toBeVisible();
});
