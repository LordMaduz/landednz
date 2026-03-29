import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

// Make React available globally
;(globalThis as any).React = React

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview