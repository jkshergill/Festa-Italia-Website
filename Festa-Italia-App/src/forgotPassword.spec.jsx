import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ForgotPassword from './forgotpassword'

// Test case 1
describe('Forgot Password renders correctly', () => {
  it('shows important static text', async () => {
    render(<ForgotPassword />) // Just rendering the component to check if it renders without crashing
  })
})

describe('Email input renders correctly', () => {
  it('shows email input field', async () => {
    render(<ForgotPassword />)
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toBeInTheDocument() // Check if the email input field is present in the document
  })
})

describe('Header renders correctly', () => {
  it('shows the correct header text', async () => {
    render(<ForgotPassword />)
    const header = screen.getByText('Forgot Your Password?')
    expect(header).toBeInTheDocument() // Check if the header text is present in the document
  })
})

describe('Button renders correctly', () => {
  it('shows the correct button text', async () => {
    render(<ForgotPassword />)
    const button = screen.getByText('Send Reset Link')
    expect(button).toBeInTheDocument() // Check if the button text is present in the document
  })
})