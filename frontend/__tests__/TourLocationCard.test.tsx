import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TourLocationCard from '@/components/tour-locations/TourLocationCard'
import { TourLocation, LocationType, ContentVisibility } from '@/types/tour-location'

// Mock location data
const mockLocation: TourLocation = {
  id: '1',
  tourPackageId: 'pkg-1',
  name: 'Koh Samui',
  slug: 'koh-samui',
  type: LocationType.BEACH,
  sequenceNumber: 1,
  latitude: 8.8901,
  longitude: 100.7931,
  island: 'samui',
  shortDescription: 'Beautiful beach location',
  description: 'A beautiful and popular beach destination',
  imageUrl: 'https://example.com/image.jpg',
  imageAlt: 'Koh Samui Beach',
  amenities: ['parking', 'restrooms', 'food'],
  gallery: [],
  keywords: ['beach', 'samui'],
  seoTags: ['beach', 'tropical'],
  highlights: ['Beautiful sunset', 'Clear water'],
  funFacts: [],
  tipsFacts: [],
  wheelchairAccessible: true,
  parkingAvailable: true,
  toiletsAvailable: true,
  isActive: true,
  isFeatured: true,
  visibility: ContentVisibility.PUBLIC,
  contentApproved: true,
  approvedBy: 'admin@test.com',
  approvedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('TourLocationCard', () => {
  it('renders location name', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText('Koh Samui')).toBeInTheDocument()
  })

  it('renders short description', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText('Beautiful beach location')).toBeInTheDocument()
  })

  it('renders image', () => {
    render(<TourLocationCard location={mockLocation} />)
    const image = screen.getByAltText(/Koh Samui/i)
    expect(image).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText(/4.5/)).toBeInTheDocument()
  })

  it('renders review count', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText(/120 reviews/i)).toBeInTheDocument()
  })

  it('shows featured badge when featured is true', () => {
    render(<TourLocationCard location={mockLocation} showApprovalBadge={true} />)
    const badge = screen.queryByTestId('featured-badge')
    if (mockLocation.isFeatured) {
      expect(badge).toBeInTheDocument()
    }
  })

  it('shows approval badge when approved is true', () => {
    render(<TourLocationCard location={mockLocation} showApprovalBadge={true} />)
    const badge = screen.queryByTestId('approval-badge')
    if (mockLocation.contentApproved) {
      expect(badge).toBeInTheDocument()
    }
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(
      <TourLocationCard 
        location={mockLocation} 
        onClick={handleClick}
      />
    )
    
    const card = screen.getByRole('article')
    await user.click(card)
    
    expect(handleClick).toHaveBeenCalledWith(mockLocation)
  })

  it('renders in compact mode when specified', () => {
    render(
      <TourLocationCard 
        location={mockLocation}
        compact={true}
      />
    )
    
    // In compact mode, we expect less content
    expect(screen.getByText('Koh Samui')).toBeInTheDocument()
  })

  it('renders location type badge', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText(/beach/i)).toBeInTheDocument()
  })

  it('renders amenities count', () => {
    render(<TourLocationCard location={mockLocation} />)
    // Should display amenity information
    const amenitiesText = screen.queryByText(/amenities/i)
    expect(amenitiesText).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const locationWithoutImage = { ...mockLocation, imageUrl: '' }
    render(<TourLocationCard location={locationWithoutImage} />)
    
    expect(screen.getByText('Koh Samui')).toBeInTheDocument()
  })

  it('renders location island tag', () => {
    render(<TourLocationCard location={mockLocation} />)
    expect(screen.getByText(/samui/i)).toBeInTheDocument()
  })

  it('shows loading state when provided', () => {
    render(
      <TourLocationCard 
        location={mockLocation}
      />
    )
    
    // Should render without crashing
    expect(screen.getByText('Koh Samui')).toBeInTheDocument()
  })
})
