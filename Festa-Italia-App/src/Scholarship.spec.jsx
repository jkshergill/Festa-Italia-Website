import {screen, render} from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Scholarship from './Scholarship'

// Test case 1
describe('Scholarship renders correctly', () => {
  it('shows important static text', async () => {
    render(<Scholarship></Scholarship>)
  })
})

describe('CLICK HERE link', () => {
  it('has the correct href attribute', async () => {
    render(<Scholarship></Scholarship>)
    const linkElement = screen.getByText('CLICK HERE')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', 'https://festaitaliamonterey.org/Publish/docs/2020_scholarship_application_form.pdf')
  })
})

describe('CLICK HERE link opens in a new tab', () => {
  it('has the correct target attribute', async () => {
    render(<Scholarship></Scholarship>)
    const linkElement = screen.getByText('CLICK HERE')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('target', '_blank')
  })
})