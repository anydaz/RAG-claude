import React from 'react'
import { render, screen } from '@testing-library/react'
import ChatMessage from '@/components/ChatMessage'

const FIXED_DATE = new Date('2024-01-15T14:30:00')

describe('ChatMessage', () => {
  describe('user message', () => {
    it('renders the message content', () => {
      render(<ChatMessage role="user" content="Hello assistant" timestamp={FIXED_DATE} />)
      expect(screen.getByText('Hello assistant')).toBeInTheDocument()
    })

    it('aligns user message to the right', () => {
      const { container } = render(
        <ChatMessage role="user" content="Hi" timestamp={FIXED_DATE} />,
      )
      // The outermost wrapper div should have items-end for right-alignment.
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toMatch(/items-end/)
    })

    it('renders a timestamp', () => {
      render(<ChatMessage role="user" content="Hi" timestamp={FIXED_DATE} />)
      // Timestamp is formatted as HH:MM — just assert something time-like exists.
      const timeElements = document.querySelectorAll('span')
      const hasTime = Array.from(timeElements).some((el) =>
        /\d{1,2}:\d{2}/.test(el.textContent ?? ''),
      )
      expect(hasTime).toBe(true)
    })
  })

  describe('assistant message', () => {
    it('renders the message content', () => {
      render(
        <ChatMessage
          role="assistant"
          content="I have 5 years of experience."
          timestamp={FIXED_DATE}
        />,
      )
      expect(screen.getByText('I have 5 years of experience.')).toBeInTheDocument()
    })

    it('aligns assistant message to the left', () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Hello" timestamp={FIXED_DATE} />,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toMatch(/items-start/)
    })

    it('renders a timestamp for assistant message', () => {
      render(
        <ChatMessage role="assistant" content="Response" timestamp={FIXED_DATE} />,
      )
      const timeElements = document.querySelectorAll('span')
      const hasTime = Array.from(timeElements).some((el) =>
        /\d{1,2}:\d{2}/.test(el.textContent ?? ''),
      )
      expect(hasTime).toBe(true)
    })
  })

  describe('content rendering', () => {
    it('renders long content correctly', () => {
      const longContent = 'A'.repeat(500)
      render(<ChatMessage role="user" content={longContent} timestamp={FIXED_DATE} />)
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('renders different content for each role', () => {
      const { rerender } = render(
        <ChatMessage role="user" content="User says hi" timestamp={FIXED_DATE} />,
      )
      expect(screen.getByText('User says hi')).toBeInTheDocument()

      rerender(
        <ChatMessage role="assistant" content="Assistant replies" timestamp={FIXED_DATE} />,
      )
      expect(screen.getByText('Assistant replies')).toBeInTheDocument()
    })
  })
})
