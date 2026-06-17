import React from 'react'
import { render } from '@testing-library/react'
import LoadingIndicator from '@/components/LoadingIndicator'

describe('LoadingIndicator', () => {
  it('renders three dot elements', () => {
    const { container } = render(<LoadingIndicator />)
    const dots = container.querySelectorAll('span')
    expect(dots).toHaveLength(3)
  })

  it('each dot has the animate-bounce class', () => {
    const { container } = render(<LoadingIndicator />)
    const dots = container.querySelectorAll('span')
    dots.forEach((dot) => {
      expect(dot.className).toMatch(/animate-bounce/)
    })
  })

  it('each dot has the rounded-full class', () => {
    const { container } = render(<LoadingIndicator />)
    const dots = container.querySelectorAll('span')
    dots.forEach((dot) => {
      expect(dot.className).toMatch(/rounded-full/)
    })
  })

  it('renders inside a containing div', () => {
    const { container } = render(<LoadingIndicator />)
    expect(container.firstChild).not.toBeNull()
  })
})
