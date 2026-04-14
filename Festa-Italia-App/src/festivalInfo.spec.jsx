import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FestivalInfo from './FestivalInfo'

// Test case 1
describe('FestivalInfo renders correctly', () => {
  it('shows important static text', async () => {
    render(<FestivalInfo />)
  })
})
