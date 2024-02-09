# feed-a11y

headless and accessible feed component for React.

**Features**

- Keyboard navigation
  [Interaction](https://www.w3.org/WAI/ARIA/apg/patterns/feed#keyboardinteraction).
- ARIA roles and states
  [link](https://www.w3.org/WAI/ARIA/apg/patterns/feed#wai-ariaroles,states,andproperties).

## Install

```sh
npm install feed-a11y
```

## Usage

```tsx
import * as Feed from 'feed-a11y'

export default () => (
  <Feed.Root>
    <Feed.RootTitle />
    <Feed.Item>
      <Feed.ItemTitle />
    </Feed.Item>
  </Feed.Root>
)
```

## API

### Root

| Prop    | Type    | Default | Description                                                                                          |
| ------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| loading | boolean | -       | To convey the loading state to users using assistive technologies.                                   |
| asChild | boolean | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### RootTitle

| Prop    | Type    | Default | Description                                                                                          |
| ------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| asChild | boolean | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### Item

| Prop    | Type    | Default | Description                                                                                          |
| ------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| asChild | boolean | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. |

### ItemTitle

| Prop    | Type    | Default | Description                                                                                          |
| ------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| asChild | boolean | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. |

## Accessibility

### Keyboard Interactions

| Key            | Description                                                |
| -------------- | ---------------------------------------------------------- |
| Page Up        | Move focus to previous article.                            |
| Page Down      | Move focus to next article.                                |
| Control + Home | Move focus to the first focusable element before the feed. |
| Control + End  | Move focus to the first focusable element after the feed.  |

## FAQs

**React version?** Requires React 18, because using `useId` internally.

**Combination with virtualization?** Not supported, because it's not possible to
manage focus properly.

## Contribute

If you have issues or questions, feel free to create an issue or pull request.
