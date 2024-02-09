import '@testing-library/jest-dom'
import { test, expect, vi, describe } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Feed, FeedTitle, Article, ArticleTitle } from './Feed'

const consoleError = vi.spyOn(console, 'error')

test('Feed has role feed.', async () => {
  render(<Feed />)

  expect(screen.getByRole('feed')).not.toBe(null)
})

describe('Feed should have label.', async () => {
  test(`error when both <Feed.Title /> and aria-label has not been provided`, () => {
    render(<Feed />)

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  test('no error when <Feed.Title /> has been provided', () => {
    render(
      <Feed>
        <FeedTitle />
      </Feed>,
    )

    expect(consoleError).not.toHaveBeenCalled()
  })

  test('no error when aria-label has been provided', () => {
    render(<Feed aria-label='ranking' />)

    expect(consoleError).not.toHaveBeenCalled()
  })
})

describe('Feed conveys loading state.', async () => {
  test('aria-busy is set to true when loading.', async () => {
    render(<Feed loading />)

    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true')
  })

  test('aria-busy is set to false when not loading.', async () => {
    render(<Feed loading={false} />)

    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'false')
  })

  test('aria-budy is not set when loading is not provided.', async () => {
    render(<Feed />)

    expect(screen.getByRole('feed')).not.toHaveAttribute('aria-busy')
  })
})

test('Article must be used inside Feed.', async () => {
  expect(() => render(<Article />)).toThrowError()
})

describe('Article is recognized as article.', async () => {
  test('no error default', async () => {
    render(
      <Feed>
        <FeedTitle />
        <Article>
          <ArticleTitle />
        </Article>
      </Feed>,
    )

    expect(consoleError).not.toHaveBeenCalled()
  })
  test('no error when <article /> is provided as a child', async () => {
    render(
      <Feed>
        <FeedTitle />
        <Article
          role={undefined}
          asChild
        >
          <article>
            <ArticleTitle />
          </article>
        </Article>
      </Feed>,
    )

    expect(consoleError).not.toHaveBeenCalled()
  })
})

describe('Article should have label.', async () => {
  test(`error when <Article.Title /> has not been provided`, () => {
    render(
      <Feed>
        <FeedTitle />
        <Article />
      </Feed>,
    )

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  test('no error when <Article.Title /> has been provided', () => {
    render(
      <Feed>
        <FeedTitle />
        <Article>
          <ArticleTitle />
        </Article>
      </Feed>,
    )

    expect(consoleError).not.toHaveBeenCalled()
  })
})
