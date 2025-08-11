import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageInput from '../components/chat/MessageInput'

vi.mock('emoji-picker-react', () => ({
  default: ({ onEmojiClick }) => (
    <div data-testid='emoji-picker'>
      <button
        onClick={() => onEmojiClick({ emoji: '😊' })}
        data-testid='emoji-button'
      >
        😊
      </button>
    </div>
  ),
}))

describe('MessageInput', () => {
  it('should not retain previous message when adding emoji after send', async () => {
    const onSendMessage = vi.fn()
    const user = userEvent.setup()

    render(
      <MessageInput
        onSendMessage={onSendMessage}
        isConnected
      />
    )

    const textarea = screen.getByPlaceholderText('Message #general')
    const emojiToggle = screen.getByTitle('Add emoji')

    await user.type(textarea, 'First message ')
    await user.click(emojiToggle)
    await user.click(screen.getByTestId('emoji-button'))
    expect(textarea.value).toBe('First message 😊')

    await user.click(screen.getByText('Send'))
    expect(onSendMessage).toHaveBeenCalledWith('First message 😊')
    expect(textarea.value).toBe('')

    await user.click(emojiToggle)
    await user.click(screen.getByTestId('emoji-button'))
    expect(textarea.value).toBe('😊')
  })

  it('should send message on Enter key', async () => {
    const onSendMessage = vi.fn()
    const user = userEvent.setup()

    render(
      <MessageInput
        onSendMessage={onSendMessage}
        isConnected
      />
    )

    const textarea = screen.getByPlaceholderText('Message #general')
    await user.type(textarea, 'Test message{Enter}')

    expect(onSendMessage).toHaveBeenCalledWith('Test message')
    expect(textarea.value).toBe('')
  })
})
