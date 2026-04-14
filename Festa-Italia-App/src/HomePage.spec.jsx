import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from './HomePage'

// Test case 1
describe('HomePage renders correctly', () => {
  it('shows important static text', async () => {
    render(<HomePage />)
  })
})
