import * as React from 'react'
import { Primitive } from '@radix-ui/react-primitive'
import { tabbable, type FocusableElement } from 'tabbable'

const ITEM_SELECTOR = `[data-feed-a11y-item=""]`

type Children = { children?: React.ReactNode }
type DivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
type HeaderProps = React.ComponentPropsWithoutRef<typeof Primitive.h2>

type FeedContext = {
  feedRef: React.RefObject<HTMLDivElement | null>
  itemSet: Set<React.RefObject<HTMLDivElement>>
  item: (ref: React.RefObject<HTMLDivElement>) => () => void
  labelId: string
}
type FeedProps = Children &
  Omit<DivProps, 'role'> & {
    /**
     * Enables assistive technologies to ignore DOM changes during the load process and then render the changes when the DOM is stable.
     */
    loading?: boolean
  }

type ArticleContext = {
  labelId: string
}
type ArticleProps = Children & DivProps

type FeedTitleProps = Omit<HeaderProps, 'id'>
type ArticleTitleProps = Omit<HeaderProps, 'id'>

const FeedContext = React.createContext<FeedContext | undefined>(undefined)
const useFeed = () => {
  const context = React.useContext(FeedContext)
  if (!context)
    throw new Error('This component must be used within a `Feed` component.')

  return context
}

const ArticleContext = React.createContext<ArticleContext | undefined>(
  undefined,
)
const useArticle = () => {
  const context = React.useContext(ArticleContext)
  if (!context)
    throw new Error('This component must be used within a `Article` component.')

  return context
}

const Feed = React.forwardRef<HTMLDivElement, FeedProps>(
  function Feed(props, forwardedRef) {
    const { loading, children, ...rest } = props

    const ref = React.useRef<HTMLDivElement | null>(null)
    const itemSet = React.useRef<Set<React.RefObject<HTMLDivElement>>>(
      new Set(),
    )

    const labelId = `feed-a11y-${React.useId()}`

    const context: FeedContext = React.useMemo(
      () => ({
        feedRef: ref,
        itemSet: itemSet.current,
        item: ref => {
          itemSet.current.add(ref)
          return () => {
            itemSet.current.delete(ref)
          }
        },
        labelId,
      }),
      [labelId],
    )

    return (
      <FeedContext.Provider value={context}>
        <Primitive.div
          ref={mergeRefs([ref, forwardedRef])}
          {...rest}
          role='feed'
          aria-busy={loading}
          aria-labelledby={labelId}
        >
          {isDeveloping() && (
            <FeedA11yWarning
              feedRef={ref}
              labelId={labelId}
            />
          )}
          {children}
        </Primitive.div>
      </FeedContext.Provider>
    )
  },
)

const Article = React.forwardRef<HTMLDivElement, ArticleProps>(
  function Article(props, forwardedRef) {
    const { children, ...rest } = props
    const ref = React.useRef<HTMLDivElement>(null)
    const labelId = `feed-a11y-${React.useId()}`

    const context = useFeed()

    React.useEffect(() => {
      const cleanup = context.item(ref)
      return cleanup
    }, [context])

    const getItems = () => {
      const collectionNode = context.feedRef.current
      if (!collectionNode) return []
      const orderedNodes = Array.from(
        collectionNode.querySelectorAll(ITEM_SELECTOR),
      )

      const items = [...context.itemSet]

      const orderedItems = items.sort(
        (a, b) =>
          orderedNodes.indexOf(a.current!) - orderedNodes.indexOf(b.current!),
      )
      return orderedItems
    }

    function focusFirst(candidates: HTMLElement[]) {
      const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement
      for (const candidate of candidates) {
        if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return
        candidate.focus()
        if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return
      }
    }

    function updateSelectedByItem(
      event: React.KeyboardEvent<HTMLDivElement>,
      change: 1 | -1,
    ) {
      let items = getItems().map(item => item.current!)

      if (change === -1) items.reverse()

      const currentIndex = items.indexOf(event.currentTarget)
      items = items.slice(currentIndex + 1)

      setTimeout(() => focusFirst(items))
    }

    function findInScope(scope: HTMLElement, target: FocusableElement) {
      const treeWalker = document.createTreeWalker(
        scope,
        NodeFilter.SHOW_ELEMENT,
      )

      while (treeWalker.nextNode()) {
        if (treeWalker.currentNode === target) return true
      }

      return false
    }

    return (
      <ArticleContext.Provider value={{ labelId }}>
        <Primitive.div
          // able to overwrite role because you can choose `role="article"` or `tagName="ARTICLE"`
          role='article'
          {...rest}
          // no need aria-posinset and aria-setsize because all items should be in the DOM.
          // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-posinset
          ref={mergeRefs([forwardedRef, ref])}
          tabIndex={0}
          data-feed-a11y-item=''
          aria-labelledby={labelId}
          onKeyDown={e => {
            rest.onKeyDown?.(e)
            if (e.defaultPrevented) return

            switch (e.key) {
              case 'PageUp': {
                e.preventDefault()
                updateSelectedByItem(e, -1)
                break
              }
              case 'PageDown': {
                e.preventDefault()
                updateSelectedByItem(e, 1)
                break
              }
              case 'Home': {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault()
                  const nodes = getItems().map(item => item.current!)
                  if (!hasAny(nodes)) return

                  const elm = nodes[0]

                  const tabbableNodes = tabbable(document.body)
                  const index = tabbableNodes.indexOf(elm)

                  // if elm is first focusable element in document, focus it.
                  if (index <= 0) {
                    return elm.focus()
                  }

                  let target = index - 1
                  let prevTargetInScope: FocusableElement | undefined

                  // find the first focusable element before the feed, and focus it.
                  while (tabbableNodes[target]) {
                    if (!findInScope(elm, tabbableNodes[target])) {
                      return tabbableNodes[target].focus()
                    }
                    if (!prevTargetInScope)
                      prevTargetInScope = tabbableNodes[target]
                    target -= 1
                  }

                  // if no focusable element before the feed,
                  // focus the first focusable element closer to elm.
                  prevTargetInScope?.focus()
                }
                break
              }
              case 'End': {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault()

                  const nodes = getItems().map(item => item.current!)
                  if (!hasAny(nodes)) return

                  const elm = nodes[nodes.length - 1]

                  const tabbableNodes = tabbable(document.body)
                  const index = tabbableNodes.indexOf(elm)

                  // if elm is last focusable element in document, focus it.
                  if (index === tabbableNodes.length - 1) {
                    return elm.focus()
                  }

                  let target = index + 1
                  let nextTargetInScope: FocusableElement | undefined

                  // find the first focusable element after the feed, and focus it.
                  while (tabbableNodes[target]) {
                    if (!findInScope(elm, tabbableNodes[target])) {
                      return tabbableNodes[target].focus()
                    }
                    if (!nextTargetInScope)
                      nextTargetInScope = tabbableNodes[target]
                    target += 1
                  }

                  // if no focusable element after the feed,
                  // focus the first focusable element closer to elm.
                  nextTargetInScope?.focus()
                }
                break
              }
            }
          }}
        >
          {children}
        </Primitive.div>
        {isDeveloping() && (
          <ArticleA11yWarning
            articleRef={ref}
            labelId={labelId}
          />
        )}
      </ArticleContext.Provider>
    )
  },
)

const FeedTitle = React.forwardRef<HTMLHeadingElement, FeedTitleProps>(
  function FeedTitle(props, forwardedRef) {
    const context = useFeed()

    return (
      <Primitive.h2
        ref={forwardedRef}
        {...props}
        id={context.labelId}
      />
    )
  },
)

const ArticleTitle = React.forwardRef<HTMLHeadingElement, ArticleTitleProps>(
  function ArticleTitle(props, forwardedRef) {
    const context = useArticle()

    return (
      <Primitive.h3
        ref={forwardedRef}
        {...props}
        id={context.labelId}
      />
    )
  },
)

function FeedA11yWarning({
  feedRef,
  labelId,
}: {
  feedRef: React.RefObject<HTMLDivElement>
  labelId: string
}) {
  const mounted = React.useRef(false)

  React.useEffect(() => {
    if (mounted.current == null || mounted.current) return

    const titleByAriaLabel =
      typeof feedRef.current?.getAttribute('aria-label') === 'string'
    const titleByAriaLabelledby = document.getElementById(labelId)

    if (!titleByAriaLabel && !titleByAriaLabelledby) {
      console.error(
        `<Feed.Root /> must have a <Feed.RootTitle />, or set aria-label to <Feed.Root />.
        cf. you can make it visible to screen readers using CSS. https://tailwindcss.com/docs/screen-readers`,
      )
    }

    mounted.current = true
  }, [feedRef, labelId])

  return null
}

function ArticleA11yWarning({
  articleRef,
  labelId,
}: {
  articleRef: React.RefObject<HTMLDivElement>
  labelId: string
}) {
  const mounted = React.useRef(false)

  React.useEffect(() => {
    if (mounted.current == null || mounted.current) return

    const titleByAriaLabelledby = document.getElementById(labelId)

    if (!titleByAriaLabelledby) {
      console.error(
        `<Feed.Item /> must have a <Feed.ItemTitle />.
        cf. or you can make it visible to screen readers using CSS. https://tailwindcss.com/docs/screen-readers`,
      )
    }

    const tagName = articleRef.current?.tagName
    const role = articleRef.current?.getAttribute('role')

    if (tagName !== 'ARTICLE' && role !== 'article') {
      console.error(
        '<Feed.Item /> must have a `role="article"` or use `<article></article>` element as child.',
      )
    }

    mounted.current = true
  }, [articleRef, labelId])

  return null
}

// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>,
): React.RefCallback<T> {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        // eslint-disable-next-line no-extra-semi
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

function hasAny<T>(target: Array<T>): boolean {
  return target.length > 0
}

function isDeveloping() {
  return process.env.NODE_ENV === 'development' || process.env.FEED_A11Y_TEST
}

const Root = Feed
const RootTitle = FeedTitle
const Item = Article
const ItemTitle = ArticleTitle

export {
  Feed,
  FeedTitle,
  Article,
  ArticleTitle,
  //
  Root,
  RootTitle,
  Item,
  ItemTitle,
}

export type { FeedProps, ArticleProps, FeedTitleProps, ArticleTitleProps }
