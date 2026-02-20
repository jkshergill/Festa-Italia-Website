import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Shopping from './Shopping'

// Task 364: Test case 1
describe('Shopping renders correctly', () => {
  it('shows important static text', async () => {
    render(<Shopping />)

    expect(await screen.findByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Drinks')).toBeInTheDocument()
    expect(screen.getByText('Tokens')).toBeInTheDocument()
    expect(screen.getByText('Reset Totals')).toBeInTheDocument()
  })
})

// Task 369: Test case 1
describe('Testing Reset Button', () => {
  it('allows user to click the reset button', async () => {
    render(<Shopping />)
    const resetButton = await screen.findByText('Reset Totals')
    resetButton.click()
    expect(resetButton ).toBeInTheDocument() // Just checking the button is there and clickable
  })
})

