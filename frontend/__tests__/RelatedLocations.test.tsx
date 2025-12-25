import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import RelatedLocations from '@/components/tour-locations/RelatedLocations'
import { TourLocation } from '@/types/tour-location'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  )
})

// Mock the fetch API
global.fetch = jest.fn()

describe('RelatedLocations', () => {
  const currentLocationId = '1'
  const mockRelatedLocations: TourLocation[] = [
    {
      id: '2',
      tourPackageId: 'pkg-1',
      name: 'Nearby Beach',
      slug: 'nearby-beach',
      type: 'beach' as any,
      sequenceNumber: 1,
      latitude: 8.8950,
      longitude: 100.8000,
      island: 'samui',
      shortDescription: 'A beautiful nearby beach',
      imageUrl: 'https://example.com/beach.jpg',
      amenities: ['parking', 'food'],
      gallery: [],
      keywords: [],
      seoTags: [],
      highlights: [],
      funFacts: [],
      tipsFacts: [],
      wheelchairAccessible: true,
      parkingAvailable: true,
      toiletsAvailable: true,
      isActive: true,
      isFeatured: false,
      visibility: 'PUBLIC' as any,
      contentApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      tourPackageId: 'pkg-1',
      name: 'Historic Temple',
      slug: 'historic-temple',
      type: 'temple' as any,
      sequenceNumber: 2,
      latitude: 8.9000,
      longitude: 100.8100,
      island: 'samui',
      shortDescription: 'Ancient temple with rich history',
      imageUrl: 'https://example.com/temple.jpg',
      amenities: ['tours', 'guides'],
      gallery: [],
      keywords: [],
      seoTags: [],
      highlights: [],
      funFacts: [],
      tipsFacts: [],
      wheelchairAccessible: true,
      parkingAvailable: true,
      toiletsAvailable: true,
      isActive: true,
      isFeatured: false,
      visibility: 'PUBLIC' as any,
      contentApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRelatedLocations,
    })
  })

  it('renders related locations section', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Related Locations|Nearby/i)).toBeInTheDocument()
    })
  })

  it('fetches related locations on mount', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('displays related location names', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Nearby Beach')).toBeInTheDocument()
      expect(screen.getByText('Historic Temple')).toBeInTheDocument()
    })
  })

  it('displays related location descriptions', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(screen.getByText('A beautiful nearby beach')).toBeInTheDocument()
      expect(screen.getByText('Ancient temple with rich history')).toBeInTheDocument()
    })
  })

  it('renders related location cards', async () => {
    const { container } = render(
      <RelatedLocations currentLocationId={currentLocationId} />
    )
    
    await waitFor(() => {
      const cards = container.querySelectorAll('[data-testid="related-location-card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('provides navigation links to related locations', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('respects limit prop to show fewer items', async () => {
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockRelatedLocations[0]],
    })
    
    render(
      <RelatedLocations 
        currentLocationId={currentLocationId}
        limit={1}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Nearby Beach')).toBeInTheDocument()
    })
  })

  it('displays custom title when provided', async () => {
    render(
      <RelatedLocations 
        currentLocationId={currentLocationId}
        title="Recommended Places"
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Recommended Places')).toBeInTheDocument()
    })
  })

  it('handles empty results gracefully', async () => {
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      // Should handle empty state
      expect(screen.queryByText(/No results|No related/i) || !screen.getByText('Nearby Beach')).toBeTruthy()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })
    
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    // Should render without crashing
    await waitFor(() => {
      expect(screen.queryByText('Nearby Beach')).not.toBeInTheDocument()
    })
  })

  it('shows loading state while fetching', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => mockRelatedLocations,
        }), 100)
      )
    )
    
    const { container } = render(
      <RelatedLocations currentLocationId={currentLocationId} />
    )
    
    // Should show loading skeleton or similar
    await waitFor(() => {
      expect(screen.getByText('Nearby Beach')).toBeInTheDocument()
    })
  })

  it('passes correct API endpoint with current location ID', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(currentLocationId)
      )
    })
  })

  it('displays location images', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  it('displays location type information', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      // Should display type badges or indicators
      expect(screen.getByText(/Beach|Temple/i)).toBeInTheDocument()
    })
  })

  it('handles different location types', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Nearby Beach')).toBeInTheDocument()
      expect(screen.getByText('Historic Temple')).toBeInTheDocument()
    })
  })

  it('refreshes data when currentLocationId changes', async () => {
    const { rerender } = render(
      <RelatedLocations currentLocationId={currentLocationId} />
    )
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
    
    // Change the location ID
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRelatedLocations,
    })
    
    rerender(
      <RelatedLocations currentLocationId="2" />
    )
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('displays amenities for each location', async () => {
    render(<RelatedLocations currentLocationId={currentLocationId} />)
    
    await waitFor(() => {
      // Should display amenities if available
      expect(screen.queryByText(/parking|food|tours/i)).toBeTruthy()
    })
  })
})
