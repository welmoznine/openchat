import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the index page at root path', () => {
    render(<App />)
    
    const heading = screen.getByRole('heading', { name: /welcome to openchat/i })
    expect(heading).toBeInTheDocument()
    
    const paragraph = screen.getByText(/this is the main page!/i)
    expect(paragraph).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
})