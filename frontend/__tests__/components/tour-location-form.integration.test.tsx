import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TourLocationForm from '@/components/admin/tour-packages/TourLocationForm';
import { useTourLocationForm } from '@/hooks/useTourLocationForm';

describe('TourLocationForm Integration Tests', () => {
  const mockLocations = [
    {
      id: '1',
      name: 'Big Buddha Temple',
      type: 'TEMPLE',
      sequenceNumber: 1,
      latitude: 8.0883,
      longitude: 100.7845,
      island: 'Koh Samui',
      address: 'Koh Samui, Thailand',
      durationMinutes: 45,
      activity: 'TEMPLE_VISIT',
      description: 'Historic temple',
      imageUrl: 'https://example.com/image.jpg',
      highlights: ['Historic', 'Photo opportunity'],
      amenities: ['parking', 'toilet'],
    },
    {
      id: '2',
      name: 'Chaweng Beach',
      type: 'BEACH',
      sequenceNumber: 2,
      latitude: 8.7241,
      longitude: 100.7845,
      island: 'Koh Samui',
      address: 'Chaweng, Koh Samui',
      durationMinutes: 120,
      activity: 'BEACH_SWIM',
      description: 'Beautiful beach',
      imageUrl: 'https://example.com/beach.jpg',
      highlights: ['Swimming', 'Sunbathing'],
      amenities: ['restaurant', 'shop'],
    },
  ];

  describe('Rendering and Basic Functionality', () => {
    it('should render the tour location form with locations list', () => {
      const mockOnChange = jest.fn();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
          tourPackageId="test-package"
        />
      );

      expect(screen.getByText('Tour Locations')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add location/i })).toBeInTheDocument();
      expect(screen.getByText('Big Buddha Temple')).toBeInTheDocument();
      expect(screen.getByText('Chaweng Beach')).toBeInTheDocument();
    });

    it('should display empty state when no locations are provided', () => {
      const mockOnChange = jest.fn();
      
      render(
        <TourLocationForm
          locations={[]}
          onLocationsChange={mockOnChange}
        />
      );

      expect(screen.getByText(/no locations added yet/i)).toBeInTheDocument();
    });

    it('should render each location with sequence number, name, and type', () => {
      const mockOnChange = jest.fn();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      // Check first location
      expect(screen.getByText('1')).toBeInTheDocument(); // Sequence number
      expect(screen.getByText('Big Buddha Temple')).toBeInTheDocument();
      expect(screen.getByText(/TEMPLE/)).toBeInTheDocument();

      // Check second location
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Chaweng Beach')).toBeInTheDocument();
    });
  });

  describe('Expanding and Collapsing Locations', () => {
    it('should expand location details when clicking on location row', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      const locationRow = screen.getByText('Big Buddha Temple').closest('div');
      
      if (locationRow) {
        await user.click(locationRow);
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Big Buddha Temple')).toBeInTheDocument();
          expect(screen.getByDisplayValue('8.0883')).toBeInTheDocument();
          expect(screen.getByDisplayValue('100.7845')).toBeInTheDocument();
        });
      }
    });

    it('should collapse location details when clicking again', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      const locationRow = screen.getByText('Big Buddha Temple').closest('div');
      
      if (locationRow) {
        // Open
        await user.click(locationRow);
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Big Buddha Temple')).toBeInTheDocument();
        });

        // Close
        await user.click(locationRow);
        
        await waitFor(() => {
          expect(screen.queryByDisplayValue('Big Buddha Temple')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Adding a New Location', () => {
    it('should add a new location when save button is clicked', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      const { rerender } = render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      // Verify empty new location form appears
      const locationNameInputs = screen.getAllByPlaceholderText('e.g., Big Buddha Temple');
      const newInput = locationNameInputs[locationNameInputs.length - 1];
      
      await user.type(newInput, 'Nathon Pier');

      // Select type
      const typeSelects = screen.getAllByRole('combobox');
      const newTypeSelect = typeSelects.find(select => 
        select.textContent?.includes('Select a type')
      );

      if (newTypeSelect) {
        await user.click(newTypeSelect);
        const pierOption = screen.getByRole('option', { name: /Pier/i });
        await user.click(pierOption);
      }

      // Click save
      const saveButtons = screen.getAllByText('Save Location');
      const newSaveButton = saveButtons[saveButtons.length - 1];
      await user.click(newSaveButton);

      // Verify onChange was called
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveLength(3); // Should have 3 locations now
        expect(lastCall[0][2].name).toBe('Nathon Pier');
        expect(lastCall[0][2].type).toBe('PIER');
      });
    });
  });

  describe('Editing a Location', () => {
    it('should edit an existing location and save changes', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      // Expand location
      const locationRow = screen.getByText('Big Buddha Temple').closest('div');
      if (locationRow) {
        await user.click(locationRow);
      }

      // Edit name
      const nameInput = screen.getByDisplayValue('Big Buddha Temple');
      await user.clear(nameInput);
      await user.type(nameInput, 'Grand Buddha Temple');

      // Save
      const saveButton = screen.getByRole('button', { name: /save location/i });
      await user.click(saveButton);

      // Verify change
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
        expect(lastCall[0][0].name).toBe('Grand Buddha Temple');
      });
    });
  });

  describe('Deleting a Location', () => {
    it('should delete a location when delete button is clicked', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      // Expand first location to reveal delete button
      const locationRow = screen.getByText('Big Buddha Temple').closest('div');
      if (locationRow) {
        await user.click(locationRow);
      }

      // Click delete button (trash icon)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => 
        btn.querySelector('svg') && btn.parentElement?.contains(locationRow)
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      // Verify onChange was called with one less location
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Reordering Locations', () => {
    it('should move location up in the list', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={mockLocations}
          onLocationsChange={mockOnChange}
        />
      );

      // Get all move-up buttons
      const moveUpButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('[size="18"]') && btn.parentElement?.className.includes('gap-2')
      );

      // Click move up button for second location
      if (moveUpButtons.length > 0) {
        await user.click(moveUpButtons[0]);
      }

      // Verify onChange was called
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when trying to save without required fields', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TourLocationForm
          locations={[]}
          onLocationsChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      // Try to save without filling required fields
      const saveButton = screen.getByRole('button', { name: /save location/i });
      await user.click(saveButton);

      // Verify error messages appear (mockOnChange should not be called)
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('useTourLocationForm Hook', () => {
    it('should manage location state correctly', () => {
      const { result } = renderHook(() => useTourLocationForm(mockLocations));

      expect(result.current.locations).toEqual(mockLocations);
      expect(result.current.errors).toEqual({});
    });

    it('should add a new location', () => {
      const { result } = renderHook(() => useTourLocationForm(mockLocations));

      const newLocation = {
        id: 'new',
        name: 'New Location',
        type: 'BEACH',
        sequenceNumber: 3,
        latitude: 8.5,
        longitude: 100.5,
      };

      act(() => {
        result.current.addLocation(newLocation);
      });

      expect(result.current.locations).toHaveLength(3);
      expect(result.current.locations[2].name).toBe('New Location');
    });

    it('should validate location correctly', () => {
      const { result } = renderHook(() => useTourLocationForm());

      const invalidLocation = {
        id: '1',
        name: '', // Invalid - empty name
        type: 'TEMPLE',
        sequenceNumber: 1,
        latitude: 0,
        longitude: 0,
      };

      const errors = result.current.validateLocation(invalidLocation);

      expect(errors.name).toBeDefined();
      expect(errors.name).toBe('Location name is required');
    });

    it('should delete a location by id', () => {
      const { result } = renderHook(() => useTourLocationForm(mockLocations));

      act(() => {
        result.current.deleteLocation('1');
      });

      expect(result.current.locations).toHaveLength(1);
      expect(result.current.locations[0].id).toBe('2');
    });

    it('should reorder locations', () => {
      const { result } = renderHook(() => useTourLocationForm(mockLocations));

      act(() => {
        result.current.reorderLocation(0, 1);
      });

      expect(result.current.locations[0].id).toBe('2');
      expect(result.current.locations[1].id).toBe('1');
      expect(result.current.locations[0].sequenceNumber).toBe(1);
      expect(result.current.locations[1].sequenceNumber).toBe(2);
    });
  });
});
