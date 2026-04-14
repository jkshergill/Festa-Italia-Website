import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import QueensEditor from './QueensEditor'

// Test Case 1 
describe('Queens Editor renders correctly', () => {
  it('shows important static text', async () => {
    render(<QueensEditor></QueensEditor>)
  })
})