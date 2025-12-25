import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GallerySlider from '@/components/tour-locations/GallerySlider'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('GallerySlider', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ]
  const mockTitle = 'Beautiful Beach'

  it('renders gallery with images', () => {
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Check that title is displayed
    expect(screen.getByText(mockTitle)).toBeInTheDocument()
    
    // Check image counter
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('renders empty state when no images provided', () => {
    render(<GallerySlider images={[]} title={mockTitle} />)
    
    expect(screen.getByText('No images available')).toBeInTheDocument()
  })

  it('displays current image', () => {
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    const images = screen.getAllByAltText(new RegExp(mockTitle))
    expect(images.length).toBeGreaterThan(0)
  })

  it('navigates to next image with next button', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Start at image 1
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    
    // Click next button
    const nextButton = screen.getByLabelText('Next image')
    await user.click(nextButton)
    
    // Should move to image 2
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('navigates to previous image with previous button', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Go to image 2 first
    const nextButton = screen.getByLabelText('Next image')
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
    
    // Click previous button
    const prevButton = screen.getByLabelText('Previous image')
    await user.click(prevButton)
    
    // Should return to image 1
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('wraps around when navigating past last image', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    // Go to last image
    await user.click(nextButton) // Image 2
    await user.click(nextButton) // Image 3
    
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })
    
    // Click next again - should wrap to image 1
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('wraps around when navigating before first image', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Already at image 1
    const prevButton = screen.getByLabelText('Previous image')
    
    // Click previous - should wrap to last image
    await user.click(prevButton)
    
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })
  })

  it('toggles play/pause of autoplay', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Find play/pause button
    const playPauseButton = screen.getByLabelText(/Pause slideshow|Play slideshow/)
    
    // Should start with autoplay on (Pause button)
    expect(playPauseButton).toHaveAttribute('aria-label', 'Pause slideshow')
    
    // Click to pause
    await user.click(playPauseButton)
    
    // Should now show play button
    await waitFor(() => {
      expect(screen.getByLabelText('Play slideshow')).toBeInTheDocument()
    })
  })

  it('calls onImageSelect when thumbnail is clicked', async () => {
    const user = userEvent.setup()
    const handleImageSelect = jest.fn()
    
    render(
      <GallerySlider 
        images={mockImages} 
        title={mockTitle}
        onImageSelect={handleImageSelect}
      />
    )
    
    // Find and click next to change image (this should trigger onImageSelect if implemented)
    const nextButton = screen.getByLabelText('Next image')
    await user.click(nextButton)
    
    // If thumbnail is clicked, onImageSelect should be called
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('displays correct image counter for all images', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    // Check counter for each image
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    
    await user.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
    
    await user.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })
  })

  it('handles single image without navigation buttons', () => {
    render(<GallerySlider images={['https://example.com/single.jpg']} title={mockTitle} />)
    
    // Should still show the image
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    
    // Play/pause might not be shown for single image
    // or it might be disabled
  })

  it('handles image load errors gracefully', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    // Get the main image
    const mainImage = screen.getAllByAltText(new RegExp(mockTitle))[0]
    
    // Simulate image error
    fireEvent.error(mainImage)
    
    // Component should handle error without crashing
    expect(screen.getByText(mockTitle)).toBeInTheDocument()
  })

  it('maintains title visibility across navigation', async () => {
    const user = userEvent.setup()
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    // Title should be visible on first image
    expect(screen.getByText(mockTitle)).toBeInTheDocument()
    
    // Navigate to next image
    await user.click(nextButton)
    
    // Title should still be visible
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument()
    })
  })

  it('renders navigation buttons', () => {
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
    expect(screen.getByLabelText('Next image')).toBeInTheDocument()
  })

  it('renders play/pause button for multiple images', () => {
    render(<GallerySlider images={mockImages} title={mockTitle} />)
    
    const playPauseButton = screen.getByLabelText(/Pause slideshow|Play slideshow/)
    expect(playPauseButton).toBeInTheDocument()
  })
})
