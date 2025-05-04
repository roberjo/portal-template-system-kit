import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { Button } from './button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole('button', { name: /destructive/i })
    
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('text-destructive-foreground')
  })

  it('applies size classes correctly', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button', { name: /small/i })
    
    expect(button).toHaveClass('h-9')
    expect(button).toHaveClass('px-3')
  })

  it('renders with tooltip when tooltip prop is provided', () => {
    render(<Button tooltip="Help text">Hover me</Button>)
    
    // Button should be in the document
    const button = screen.getByRole('button', { name: /hover me/i })
    expect(button).toBeInTheDocument()
    
    // Check that it's wrapped in a tooltip
    const tooltipTrigger = button.closest('[data-state]')
    expect(tooltipTrigger).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
  })
}) 