import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RichTextEditor from '../../modules/tasks/RichTextEditor'

// Mock ReactQuill
vi.mock('react-quill', () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <div data-testid="rich-text-editor">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
}))

describe('RichTextEditor', () => {
  it('renders without crashing', () => {
    const mockOnChange = vi.fn()
    render(<RichTextEditor value="" onChange={mockOnChange} />)
    
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    const mockOnChange = vi.fn()
    render(
      <RichTextEditor 
        value="" 
        onChange={mockOnChange} 
        placeholder="Enter description..."
      />
    )
    
    expect(screen.getByPlaceholderText('Enter description...')).toBeInTheDocument()
  })

  it('displays initial value', () => {
    const mockOnChange = vi.fn()
    const initialValue = '<p>Test content</p>'
    
    render(<RichTextEditor value={initialValue} onChange={mockOnChange} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(initialValue)
  })

  it('calls onChange when content changes', () => {
    const mockOnChange = vi.fn()
    render(<RichTextEditor value="" onChange={mockOnChange} />)
    
    const textarea = screen.getByRole('textbox')
    textarea.dispatchEvent(new Event('change', { bubbles: true }))
    
    expect(mockOnChange).toHaveBeenCalled()
  })
})
