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
describe('Reset Password Button', () => {
  it('checks if Reset Password button is present and clickable', async () => {
    render(<ResetPassword />)
    const resetPasswordButton = await screen.findByText('Reset Password')
    resetPasswordButton.click()
    expect(resetPasswordButton ).toBeInTheDocument() // Just checking the button is there and clickable
  })
})