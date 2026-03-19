import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import coronationBall from './coronationball'

// Test case 1
describe('Coronation Ball renders correctly', () => {
  it('shows important static text', async () => {
    render(<coronationBall></coronationBall>)
  })
})
