import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the login page at root path for unauthenticated user', async () => {
    render(<App />)
 
    const heading = await screen.findByRole('heading', { name: /welcome to openchat/i })
    expect(heading).toBeInTheDocument()

  })

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
})
