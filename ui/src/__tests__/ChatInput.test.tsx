import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '@/components/ChatInput'

describe('ChatInput', () => {
  const noop = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders send button', () => {
    render(<ChatInput onSend={noop} disabled={false} />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<ChatInput onSend={noop} disabled={false} />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
  })

  it('send button is enabled after typing text', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={noop} disabled={false} />)
    await user.type(screen.getByRole('textbox'), 'Hello')
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled()
  })

  it('calls onSend with the correct message when Enter is pressed', async () => {
    const onSend = jest.fn()
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), 'Tell me about your experience{Enter}')
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Tell me about your experience')
  })

  it('calls onSend when the send button is clicked', async () => {
    const onSend = jest.fn()
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(onSend).toHaveBeenCalledWith('Hello there')
  })

  it('clears the input after sending', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={noop} disabled={false} />)
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'My message')
    await user.keyboard('{Enter}')
    expect(textarea).toHaveValue('')
  })

  it('Shift+Enter does not submit the form', async () => {
    const onSend = jest.fn()
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), 'Line one')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('button is disabled when disabled prop is true', () => {
    render(<ChatInput onSend={noop} disabled={true} />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
  })

  it('does not call onSend when disabled and Enter is pressed', async () => {
    const onSend = jest.fn()
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={true} />)
    // fireEvent used here because userEvent respects disabled on textarea
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: false })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('trims whitespace before calling onSend', async () => {
    const onSend = jest.fn()
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)
    await user.type(screen.getByRole('textbox'), '  trimmed  {Enter}')
    expect(onSend).toHaveBeenCalledWith('trimmed')
  })
})
