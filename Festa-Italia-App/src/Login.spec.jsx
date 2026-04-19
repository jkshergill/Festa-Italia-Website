import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from './Login'


const mockSetPage = vi.fn()

// Test Case 1
it('Login renders correctly', () => {
  render(<Login setPage={mockSetPage} />)
})

// Test Case 2
describe('Shows important static text', () => {
  it('shows important static text', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your account and event features.')).toBeInTheDocument()
  })
})

// Test Case 3
describe('Rendering all input fields', () => {
  it('renders all input fields', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })
})

// Test Case 4
describe('Testing Log In button', () => {
  it('renders and allows clicking the log in button', () => {
    render(<Login setPage={mockSetPage} />)
    const loginButton = screen.getByRole('button', { name: 'Log In' })
    loginButton.click()
    expect(loginButton).toBeInTheDocument()
  })
})

// Test Case 5
describe('Testing Show/Hide password button', () => {
  it('renders the show password toggle button', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })
})

// Test Case 6
describe('Sign Up and Forgot Password links are rendered', () => {
  it('renders the Sign Up hyperlink', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('renders the Forgot Password link', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
  })
})
