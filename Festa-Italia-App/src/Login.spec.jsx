import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login'
import { supabase } from './supabaseClient'


vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

const mockSetPage = vi.fn()

beforeEach(() => {
  mockSetPage.mockReset()
  supabase.auth.signInWithPassword.mockReset()
})

it('Login renders correctly', () => {
  render(<Login setPage={mockSetPage} />)
})

describe('Shows important static text', () => {
  it('shows important static text', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your account and event features.')).toBeInTheDocument()
  })
})

describe('Rendering all input fields', () => {
  it('renders all input fields', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })
})

describe('Testing Log In button', () => {
  it('renders and allows clicking the log in button', () => {
    render(<Login setPage={mockSetPage} />)
    const loginButton = screen.getByRole('button', { name: 'Log In' })
    loginButton.click()
    expect(loginButton).toBeInTheDocument()
  })
})

describe('Testing Show/Hide password button', () => {
  it('renders the show password toggle button', () => {
    render(<Login setPage={mockSetPage} />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })
})

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

describe('Login attempt limiting', () => {
  it('locks the user out after 10 failed login attempts', async () => {
    const user = userEvent.setup()
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })

    render(<Login setPage={mockSetPage} />)

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const loginButton = screen.getByRole('button', { name: 'Log In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await user.click(loginButton)
    }

    await waitFor(() => {
      expect(screen.getByText(/too many incorrect login attempts/i)).toBeInTheDocument()
    })

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(10)
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled()
  })

  it('resets failed attempts after a successful login', async () => {
    const user = userEvent.setup()

    supabase.auth.signInWithPassword
      .mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
      .mockResolvedValueOnce({ error: null })

    render(<Login setPage={mockSetPage} />)

    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'correctpassword')

    await user.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() => {
      expect(screen.getByText(/9 login attempts remaining/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument()
    })

    expect(mockSetPage).toHaveBeenCalledWith('home')
  })
})
