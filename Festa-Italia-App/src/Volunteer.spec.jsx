import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Volunteer from './Volunteer'



// Test Case 1
it('Volunteer renders correctly', () => {
  render(<Volunteer />)
})

// Test Case 2
describe('Shows important static text', () => {
  it('shows important static text', async () => {
    render(<Volunteer />)
    expect(await screen.findByText('Volunteer Sign-Up')).toBeInTheDocument()
    expect(screen.getByText('Preferred Booth (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Selected Shifts:')).toBeInTheDocument()
  })
})

// Test Case 3
describe('Renders schedule table days', () => {
  it('renders all three days in the schedule', async () => {
    render(<Volunteer />)
    expect(await screen.findByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })
})

// Test Case 4
describe('Renders schedule table timeframes', () => {
  it('renders all timeframe columns', async () => {
    render(<Volunteer />)
    expect(await screen.findByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('Evening')).toBeInTheDocument()
    expect(screen.getByText('Night')).toBeInTheDocument()
  })
})

// Test Case 5
describe('Testing Sign Up button', () => {
  it('renders the sign up button', async () => {
    render(<Volunteer />)
    const signupButton = await screen.findByRole('button', { name: 'Sign up for Selected Shifts' })
    expect(signupButton).toBeInTheDocument()
  })
})

// Test Case 6
describe('No shifts selected message', () => {
  it('shows empty state message when no shifts are selected', async () => {
    render(<Volunteer />)
    expect(await screen.findByText('No shifts selected.')).toBeInTheDocument()
  })
})
