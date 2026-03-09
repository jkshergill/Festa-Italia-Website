import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FestivalInfo from './FestivalInfo'

// Test case 1
describe('FestivalInfo renders correctly', () => {
  it('shows important static text', async () => {
    render(<FestivalInfo />)
  })
})

// Test case 2 
describe('Shows static text for event days', () => {
  it ('displays the correct event days', async () => {
    render(<FestivalInfo />)
    expect(screen.getByText('Friday Event Schedule')).toBeInTheDocument()
    expect(screen.getByText('Saturday Event Schedule')).toBeInTheDocument()
    expect(screen.getByText('Sunday Event Schedule')).toBeInTheDocument()
  })
})