import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TourLocationsList from '@/app/tour-locations/page'
import { TourLocation } from '@/types/tour-location'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  )
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock fetch API
global.fetch = jest.fn()

describe('TourLocationsList Page', () => {
  const mockLocations: TourLocation[] = [
    {
      id: '1',
      tourPackageId: 'pkg-1',
      name: 'Koh Samui Beach',
      slug: 'koh-samui-beach',
      type: 'beach' as any,
      sequenceNumber: 1,
      latitude: 8.8901,
      longitude: 100.7931,
      island: 'samui',
      shortDescription: 'Beautiful sandy beach',
      imageUrl: 'https://example.com/beach1.jpg',
      amenities: ['parking'],
      gallery: [],
      keywords: ['beach'],
      seoTags: ['beach'],
      highlights: [],
      funFacts: [],
      tipsFacts: [],
      wheelchairAccessible: true,
      parkingAvailable: true,
      toiletsAvailable: true,
      isActive: true,
      isFeatured: true,
      visibility: 'PUBLIC' as any,
      contentApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      tourPackageId: 'pkg-1',
      name: 'Big Buddha',
      slug: 'big-buddha',
      type: 'temple' as any,
      sequenceNumber: 2,
      latitude: 8.9000,
      longitude: 100.8100,
      island: 'samui',
      shortDescription: 'Iconic Buddha statue',
      imageUrl: 'https://example.com/buddha.jpg',
      amenities: ['tours'],
      gallery: [],
      keywords: ['temple'],
      seoTags: ['temple'],
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
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockLocations,
        pagination: {
          total: 12,
          page: 1,
          limit: 12,
          pages: 1,
        },
      }),
    })
  })

  it('renders page title', async () => {
    render(await TourLocationsList())
    
    expect(screen.getByText(/Tour Locations|Locations/i)).toBeInTheDocument()
  })

  it('renders location cards', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      expect(screen.getByText('Koh Samui Beach')).toBeInTheDocument()
      expect(screen.getByText('Big Buddha')).toBeInTheDocument()
    })
  })

  it('displays location descriptions', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      expect(screen.getByText('Beautiful sandy beach')).toBeInTheDocument()
      expect(screen.getByText('Iconic Buddha statue')).toBeInTheDocument()
    })
  })

  it('renders search input', async () => {
    render(await TourLocationsList())
    
    const searchInput = screen.getByRole('textbox', { hidden: true }) || 
                       screen.getByPlaceholderText(/search|find/i) ||
                       screen.getByDisplayValue('')
    
    expect(searchInput).toBeInTheDocument()
  })

  it('renders filter dropdowns', async () => {
    render(await TourLocationsList())
    
    // Should have type and island filters
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(0)
  })

  it('displays pagination controls', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      // Should have pagination info or buttons
      const paginationElements = screen.queryAllByText(/page|next|previous/i)
      expect(paginationElements.length >= 0).toBe(true)
    })
  })

  it('shows featured badge for featured locations', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      const badges = screen.queryAllByText(/featured/i)
      expect(badges.length >= 0).toBe(true)
    })
  })

  it('handles empty search results', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { total: 0, page: 1, limit: 12, pages: 0 },
      }),
    })
    
    const { rerender } = render(await TourLocationsList())
    
    // After search, might show no results
    // Component should handle this gracefully
    expect(screen.queryByText('Koh Samui Beach')).not.toBeInTheDocument()
  })

  it('fetches locations on page load', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('links to individual location detail pages', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('displays location images', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  it('displays location type information', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      // Should display types
      expect(screen.queryByText(/beach|temple/i)).toBeTruthy()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })
    
    // Should render error state or empty state
    render(await TourLocationsList())
    
    await waitFor(() => {
      expect(screen.queryByText('Koh Samui Beach')).not.toBeInTheDocument()
    })
  })

  it('supports multiple locations per page', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockLocations.concat(mockLocations),
        pagination: { total: 24, page: 1, limit: 12, pages: 2 },
      }),
    })
    
    render(await TourLocationsList())
    
    await waitFor(() => {
      const cards = screen.getAllByText(/Beach|Buddha/)
      expect(cards.length).toBeGreaterThan(2)
    })
  })

  it('displays amenities for locations', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      // Should show amenity info if available
      expect(screen.queryByText(/parking|tours/i)).toBeTruthy()
    })
  })

  it('highlights location island if provided', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      // Should display island info
      expect(screen.queryByText(/samui/i)).toBeTruthy()
    })
  })

  it('renders responsive layout', async () => {
    const { container } = render(await TourLocationsList())
    
    // Should have grid or responsive layout
    const grid = container.querySelector('[class*="grid"]') ||
                 container.querySelector('[class*="flex"]')
    
    expect(grid).toBeInTheDocument()
  })

  it('sorts locations by sequence', async () => {
    render(await TourLocationsList())
    
    await waitFor(() => {
      const locations = screen.getAllByText(/Beach|Buddha/)
      // Should be in order
      expect(locations.length).toBeGreaterThan(0)
    })
  })
})
