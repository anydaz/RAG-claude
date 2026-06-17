import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '@/components/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset the html element to dark mode before each test (matches app default).
    document.documentElement.classList.add('dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('renders a toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('button has an accessible label', () => {
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label')
  })

  it('removes dark class from html element when clicked while in dark mode', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(screen.getByRole('button'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('adds dark class back when clicked again (toggle round-trip)', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    // First click → light mode.
    await user.click(screen.getByRole('button'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    // Second click → dark mode.
    await user.click(screen.getByRole('button'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('starts in dark mode and shows the sun icon (switch to light label)', () => {
    document.documentElement.classList.add('dark')
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode',
    )
  })

  it('after toggle shows the moon icon (switch to dark label)', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode',
    )
  })
})
