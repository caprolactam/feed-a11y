import { test, expect } from '@playwright/test'

const storyUrl = (id: string) =>
  `http://127.0.0.1:6006/iframe.html?viewMode=story&id=${id}`

test('Move focus to next article when keydown `Page Down`', async ({
  page,
}) => {
  await page.goto(storyUrl('feed--default'))

  const firstArticle = page.getByRole('article').nth(0)
  const secondArticle = page.getByRole('article').nth(1)

  await expect(firstArticle).toBeVisible()
  await expect(secondArticle).toBeVisible()

  await firstArticle.focus()

  await page.keyboard.press('PageDown')

  await expect(secondArticle).toBeFocused()
})

test('Move focus to previous article when keydown `Page Up`', async ({
  page,
}) => {
  await page.goto(storyUrl('feed--default'))

  const count = await page.getByRole('article').count()

  const lastArticle = page.getByRole('article').nth(count - 1)
  const beforeLastArticle = page.getByRole('article').nth(count - 2)

  await expect(lastArticle).toBeVisible()
  await expect(beforeLastArticle).toBeVisible()

  await lastArticle.focus()

  await page.keyboard.press('PageUp')

  await expect(beforeLastArticle).toBeFocused()
})

test.describe('Move focus to the first focusable element after the feed when keydown `Control + Home`', () => {
  test('windows or linux', async ({ page }) => {
    await page.goto(storyUrl('feed--default'))

    const headButton = page.getByRole('button', { name: 'head' })
    const firstArticle = page.getByRole('article').first()

    await expect(headButton).toBeVisible()
    await expect(firstArticle).toBeVisible()

    await firstArticle.focus()

    await page.keyboard.press('Control+Home')

    await expect(headButton).toBeFocused()
  })

  test('macos', async ({ page }) => {
    await page.goto(storyUrl('feed--default'))

    const headButton = page.getByRole('button', { name: 'head' })
    const firstArticle = page.getByRole('article').first()

    await expect(headButton).toBeVisible()
    await expect(firstArticle).toBeVisible()

    await firstArticle.focus()

    await page.keyboard.press('Meta+Home')

    await expect(headButton).toBeFocused()
  })
})

test.describe('Move focus to the last focusable element before the feed when keydown `Control + End`', () => {
  test('windows or linux', async ({ page }) => {
    await page.goto(storyUrl('feed--default'))

    const footButton = page.getByRole('button', { name: 'foot' })
    const lastArticle = page.getByRole('article').last()

    await expect(footButton).toBeVisible()
    await expect(lastArticle).toBeVisible()

    await lastArticle.focus()

    await page.keyboard.press('Control+End')

    await expect(footButton).toBeFocused()
  })

  test('macos', async ({ page }) => {
    await page.goto(storyUrl('feed--default'))

    const footButton = page.getByRole('button', { name: 'foot' })
    const lastArticle = page.getByRole('article').last()

    await expect(footButton).toBeVisible()
    await expect(lastArticle).toBeVisible()

    await lastArticle.focus()

    await page.keyboard.press('Meta+End')

    await expect(footButton).toBeFocused()
  })
})
