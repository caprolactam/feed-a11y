import { flushSync } from 'react-dom'
import { faker } from '@faker-js/faker'
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import * as Feed from '../src/index'

export default {
  component: Feed.Root,
} as Meta

export const Default: StoryObj = {
  render: () => {
    const length = 5
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        <button type='button'>head</button>
        <Feed.Root
          style={{
            border: '1px solid black',
            padding: '1rem',
            display: 'grid',
            gap: '0.5rem',
          }}
        >
          <Feed.RootTitle>Ranking</Feed.RootTitle>
          {Array.from({ length }).map((_, i) => (
            <Feed.Item
              key={i}
              style={{ border: '1px solid black', padding: '1rem' }}
            >
              <Feed.ItemTitle>Item {i}</Feed.ItemTitle>
              <button type='button'>like</button>
            </Feed.Item>
          ))}
        </Feed.Root>
        <button type='button'>foot</button>
      </div>
    )
  },
}

type ReviewProps = {
  name: string
  rating: number
  street: string
  citystate: string
  index: number
}
const Review = React.forwardRef<HTMLDivElement, ReviewProps>(
  function Review(props, ref) {
    const { index, name, rating, street, citystate, ...rest } = props

    return (
      <div
        ref={ref}
        {...rest}
        className='restaurant-item'
        aria-describedby={`restaurant-rating-${index} restaurant-type-${index} restaurant-location-${index}`}
      >
        <div className='restaurant-details'>
          <Feed.ItemTitle className='restaurant-name'>{name}</Feed.ItemTitle>
          <div
            className='restaurant-rating'
            id={`restaurant-rating-${index}`}
            data-rating-value={rating}
          >
            <svg
              aria-label='5 stars'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='38 -5 100 48'
              width='90'
              height='25'
            >
              <defs>
                <g id='star'>
                  <polygon points='2.0,13.4 11.7,20.5 8.0,31.1 17.7,24.8 27.4,31.9 23.7,20.5 33.4,13.4 21.4,13.4 17.7,2.0 14.0,13.4'></polygon>
                </g>
              </defs>
              <g className='star-1 star-2 star-3 star-4 star-5'>
                <use
                  className='star'
                  xlinkHref='#star'
                  x='0'
                  y='0'
                ></use>
              </g>
              <g className='star-2 star-3 star-4 star-5'>
                <use
                  className='star'
                  xlinkHref='#star'
                  x='35'
                  y='0'
                ></use>
              </g>
              <g className='star-3 star-4 star-5'>
                <use
                  className='star'
                  xlinkHref='#star'
                  x='70'
                  y='0'
                ></use>
              </g>
              <g className='star-4 star-5'>
                <use
                  className='star'
                  xlinkHref='#star'
                  x='105'
                  y='0'
                ></use>
              </g>
              <g className='star-5'>
                <use
                  className='star'
                  xlinkHref='#star'
                  x='140'
                  y='0'
                ></use>
              </g>
            </svg>
          </div>
          <div
            className='restaurant-type'
            id={`restaurant-type-${index}`}
          >
            Mexican, Tacos
          </div>
        </div>
        <div
          id={`restaurant-location-${index}`}
          className='location-block'
        >
          <div className='restaurant-street'>{street}</div>
          <div className='restaurant-citystate'>{citystate}</div>
          <div className='restaurant-phone'>(111) 111-1111</div>
        </div>
        <div className='restaurant-actions'>
          <button
            type='button'
            className='bookmark-button'
          >
            Bookmark
          </button>
        </div>
      </div>
    )
  },
)

const createItems: (length: number, count: number) => Array<ReviewProps> = (
  length,
  count,
) =>
  Array.from({ length }).map((_, i) => ({
    index: count + i,
    name: faker.commerce.productName(),
    rating: Math.floor(Math.random() * 5) + 1,
    type: faker.commerce.product(),
    street: faker.location.streetAddress(),
    citystate: faker.location.street(),
  }))

export const ApgExample: StoryObj = {
  render: () => {
    const [delay, setDelay] = React.useState(200)

    const length = 10

    const [loading, setLoading] = React.useState(false)
    const [items, setItems] = React.useState(() => createItems(length, 0))

    const fetchRef = React.useRef<NodeJS.Timeout>()

    React.useEffect(() => {
      const THRESHOLD = 50
      const onScroll = () => {
        const documentHeight = document.documentElement.scrollHeight
        const scrollDifference = Math.floor(window.innerHeight + window.scrollY)
        const scrollEnded = documentHeight < scrollDifference + THRESHOLD

        if (scrollEnded && !loading) {
          if (fetchRef.current) clearTimeout(fetchRef.current)

          flushSync(() => {
            setLoading(true)
          })

          fetchRef.current = setTimeout(() => {
            setItems(prev => [...prev, ...createItems(length, prev.length)])
            setLoading(false)
          }, delay)
        }
      }

      window.addEventListener('scroll', onScroll)

      return () => {
        window.removeEventListener('scroll', onScroll)
        clearTimeout(fetchRef.current)
      }
    }, [delay, length, loading])

    return (
      <div>
        <span>
          This is copy of the WAI-ARIA Authoring Practices Example of a feed
          component{' '}
          <a href='https://www.w3.org/WAI/ARIA/apg/patterns/feed/examples/feed-display.html'>
            link
          </a>
          .
        </span>
        <h1>Recommended Restaurants</h1>
        <section>
          <h2>About This Example</h2>
          <p>
            <strong>NOTE:</strong> The feed role is a new WAI-ARIA feature,
            introduced by WAI-ARIA 1.1. This page provides a proposed
            implementation of a feed component. This proposal does not yet have
            ARIA Practices Task Force consensus. Feedback is welcome in{' '}
            <a href='https://github.com/w3c/aria-practices/issues/565'>
              issue 565.
            </a>
          </p>
        </section>
        <section id='main-content'>
          <Feed.Root
            aria-label='Recommended Restaurants'
            loading={loading}
          >
            {items.map(item => (
              <Feed.Item
                asChild
                key={item.index}
                aria-setsize={length}
                aria-posinset={item.index}
              >
                <Review {...item} />
              </Feed.Item>
            ))}
          </Feed.Root>
        </section>
        <section id='side-panel'>
          <label htmlFor='delay-time-select'>
            Select article loading delay
          </label>
          <select
            id='delay-time-select'
            name='delay_time'
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
          >
            <option value={200}>200 ms</option>
            <option value={400}>400 ms</option>
          </select>
        </section>
      </div>
    )
  },
}
