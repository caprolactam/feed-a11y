/** @type { import('@storybook/react-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-storysource'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
