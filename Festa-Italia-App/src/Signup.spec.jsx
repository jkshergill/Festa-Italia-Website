import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Signup from './Signup'

// Test Case 1
it('Signup renders correctly', () => {
  render(<Signup></Signup>)
})

// Test Case 2
describe('Shows important static text', () => {
  it('shows important static text', async () => {
    render(<Signup />)
    expect(await screen.findByText('First name:')).toBeInTheDocument()
    expect(screen.getByText('Last name:')).toBeInTheDocument()
    expect(screen.getByText('Email:')).toBeInTheDocument()
    expect(screen.getByText('Password:')).toBeInTheDocument()
    expect(screen.getByText('Confirm password:')).toBeInTheDocument()
  })
})

// Test Case 3 
describe('Testing Signup button', () => {
  it('allows user to click the signup button', async () => {
    render(<Signup />)
    const signupButton = await screen.findByRole('button', { name: 'Signup' })
    signupButton.click()
    expect(signupButton).toBeInTheDocument() // Just checking the button is there and clickable
  })
})

// Test Case 4
describe('Rendering all input fields', () => {
  it('renders all input fields', async () => {
    render(<Signup />)
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument()
  })
})

describe('Login Hyperlink is rendered', () => {
  it('renders the login hyperlink', async () => {
    render(<Signup />)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})