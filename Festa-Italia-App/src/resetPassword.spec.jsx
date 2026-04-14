import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ResetPassword from './resetPassword'

// Test case 1 
describe('ResetPassword renders correctly', () => {
  it('shows important static text', async () => {
    render(<ResetPassword />) // Just rendering the component to check if it renders without crashing
  })
})

// Test case 2 
describe('Reset Password Button is clickable', () => {
  it('checks if Reset Password button is present and clickable', async () => {
    render(<ResetPassword />)
    const resetPasswordButton = await screen.findByText('Reset Password')
    resetPasswordButton.click()
    expect(resetPasswordButton ).toBeInTheDocument() // Just checking the button is there and clickable
  })
})

// Test Case 3
describe('Email input field is present', () => {
  it('checks if email input field is present', async () => {
    render(<ResetPassword />)
    const emailInput = await screen.findByPlaceholderText('name@domain.com') // Finding the email input field by placeholder text 
    expect(emailInput).toBeInTheDocument() // Checking if the email input field is present
  })
})

describe ('New Password input field is present', () => {
  it('checks if new password input field is present', async () => {
    render(<ResetPassword />)
    const newPasswordInput = await screen.findByPlaceholderText('Enter new password') // Finding the new password input field by label text
    expect(newPasswordInput).toBeInTheDocument() // Checking if the new password input field is present
  })
})

describe('Confirm Password input field is present', () => {
  it('checks if confirm password input field is present', async () => {
    render(<ResetPassword />)
    const confirmNewPasswordInput = await screen.findByPlaceholderText('Confirm new password') // Finding the confirm new password input field by label text
    expect(confirmNewPasswordInput).toBeInTheDocument() // Checking if the confirm new password input field is present
  })
})