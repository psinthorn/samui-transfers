# Admin Dashboard Component Architecture

## Directory Structure
```
frontend/
├── components/
│   └── admin/
│       └── tour-locations/
│           ├── LocationForm.tsx          ← 6-tab form, 47 fields
│           ├── LocationTable.tsx         ← Data display table
│           ├── ImageGallery.tsx          ← Image upload/manage
│           ├── ApprovalStatus.tsx        ← Approval workflow
│           └── SEOPreview.tsx            ← SEO optimization
│
└── app/
    └── admin/
        └── tour-locations/
            ├── page.tsx                  ← Main list page
            ├── create/
            │   └── page.tsx              ← Create wrapper
            ├── [id]/
            │   └── edit/
            │       └── page.tsx          ← Edit + approval
            └── import/
                └── page.tsx              ← CSV import wizard
```

## Component Hierarchy Tree

```
AdminTourLocations (List Page)
│
├─ Header & Navigation
│  ├─ Back/Home links
│  ├─ Create button → create/page.tsx
│  └─ Import button → import/page.tsx
│
├─ Filters Section
│  ├─ Search input (text)
│  ├─ Type dropdown
│  ├─ Island text input
│  ├─ Status dropdown
│  └─ Approval dropdown
│
├─ LocationTable
│  ├─ Table header (9 columns)
│  └─ Table rows (paginated)
│     └─ Action buttons per row
│        ├─ Edit → edit/page.tsx
│        ├─ Approve → approval modal
│        └─ Delete → delete handler
│
└─ Pagination Controls
   ├─ Page size selector
   ├─ Prev/Next buttons
   └─ Total count display


CreateLocationPage
│
├─ Back button
├─ Title
└─ LocationForm
   ├─ Tab selector (6 tabs)
   │
   ├─ Tab 1: Basic Info
   │  ├─ Name input
   │  ├─ Auto-slug
   │  ├─ Type select
   │  ├─ Coordinates
   │  ├─ Island
   │  ├─ Address
   │  ├─ Timing
   │  ├─ Activity
   │  └─ Duration
   │
   ├─ Tab 2: Content & Media
   │  ├─ Title input
   │  ├─ Short description
   │  ├─ Full description
   │  ├─ Primary image URL
   │  └─ Image alt text
   │
   ├─ Tab 3: Gallery
   │  └─ ImageGallery
   │     ├─ Drag-drop area
   │     ├─ File input
   │     └─ Image grid
   │        └─ Hover actions
   │           ├─ Move up
   │           ├─ Move down
   │           └─ Delete
   │
   ├─ Tab 4: Marketing & SEO
   │  ├─ Keywords array
   │  ├─ SEO tags array
   │  ├─ Meta description
   │  ├─ Highlights array
   │  ├─ Best time to visit
   │  ├─ Fun facts array
   │  ├─ Travel tips array
   │  │
   │  └─ SEOPreview
   │     ├─ Score card (0-100)
   │     ├─ Score bar
   │     ├─ Elements checklist
   │     │  ├─ Title status
   │     │  ├─ Slug status
   │     │  ├─ Description status
   │     │  └─ Keywords status
   │     ├─ Recommendations list
   │     └─ Google preview
   │
   ├─ Tab 5: Amenities
   │  ├─ Accessibility checkboxes
   │  └─ Amenities array
   │
   ├─ Tab 6: Admin Settings
   │  ├─ Visibility (dropdown)
   │  ├─ Featured (toggle)
   │  └─ Active status (toggle)
   │
   ├─ Error summary (bottom)
   └─ Submit button


EditLocationPage
│
├─ Back button
├─ Title
│
├─ ApprovalStatus
│  ├─ Status badge
│  ├─ Approval metadata
│  ├─ Approval notes display
│  │
│  └─ Action buttons
│     ├─ Approve button (if pending)
│     │  └─ Modal
│     │     ├─ Confirm message
│     │     ├─ Cancel button
│     │     └─ Approve button
│     │
│     ├─ Reject button (if pending)
│     │  └─ Modal
│     │     ├─ Notes textarea
│     │     ├─ Cancel button
│     │     └─ Reject button
│     │
│     └─ Revoke button (if approved)
│        └─ Modal
│           ├─ Notes textarea
│           ├─ Cancel button
│           └─ Revoke button
│
└─ LocationForm (with isEdit=true)
   └─ [Same as Create, showing existing data]


ImportLocationsPage
│
├─ Back button
├─ Title & description
│
└─ Step Container
   │
   ├─ Step 1: Upload (active initially)
   │  ├─ Instructions
   │  ├─ Download template button
   │  ├─ Drag-drop area
   │  ├─ File input
   │  ├─ Required columns reference
   │  └─ Optional columns reference
   │
   ├─ Step 2: Preview (after file selected)
   │  ├─ Row count display
   │  ├─ Preview table
   │  │  └─ First 10 rows
   │  ├─ Metadata display
   │  └─ Action buttons
   │     ├─ Back to upload
   │     └─ Import button
   │
   └─ Step 3: Results (after import)
      ├─ Success count (green)
      ├─ Failure count (red/gray)
      ├─ Error list (if any)
      │  └─ Per-row error messages
      └─ Action buttons
         ├─ View imported locations
         └─ Import another file
```

## Data Flow Diagram

```
List Page
  │
  ├─→ fetchTourLocations() ──→ LocationTable
  │
  ├─→ searchTourLocations() ─→ [if search filter]
  │
  ├─→ Filter changes ────────→ Refresh data
  │
  └─→ CRUD actions:
      │
      ├─ Create button ──→ navigate to create/page
      │                     │
      │                     ├─→ LocationForm
      │                     │    │
      │                     │    ├─→ createTourLocation()
      │                     │    │
      │                     │    └─→ success → navigate to list
      │
      ├─ Edit button ────→ navigate to [id]/edit/page
      │                     │
      │                     ├─→ fetchTourLocation(id)
      │                     │
      │                     ├─→ ApprovalStatus
      │                     │    │
      │                     │    ├─→ approveTourLocation()
      │                     │    │
      │                     │    └─→ refetch location
      │                     │
      │                     └─→ LocationForm
      │                          │
      │                          ├─→ updateTourLocation()
      │                          │
      │                          └─→ success → navigate to list
      │
      ├─ Delete button ──→ deleteTourLocation(id)
      │                     │
      │                     └─→ Refresh table
      │
      ├─ Approve button ─→ approveTourLocation(id, true)
      │                     │
      │                     └─→ Refresh table
      │
      └─ Import button ──→ navigate to import/page
                             │
                             ├─→ File upload
                             │
                             ├─→ CSV parsing
                             │    │
                             │    └─→ batchImportLocations()
                             │
                             └─→ Results display


ImageGallery Component Flow
  │
  ├─ File selection
  │  ├─ Click file input
  │  └─ Drag-drop files
  │
  ├─ File validation
  │  ├─ Type check (images only)
  │  ├─ Size check (<5MB)
  │  └─ Quantity check (<20)
  │
  ├─ Image processing
  │  └─ Create object URLs
  │
  ├─ Display & manage
  │  ├─ Grid display
  │  ├─ Reorder (up/down)
  │  └─ Delete
  │
  └─ Update parent
     └─ onImagesChange()


SEOPreview Component Flow
  │
  ├─ Input changes (title, slug, description, keywords)
  │
  ├─ Score calculation
  │  ├─ Title scoring (0-25 pts)
  │  ├─ Slug scoring (0-15 pts)
  │  ├─ Description scoring (0-30 pts)
  │  └─ Keywords scoring (0-30 pts)
  │  └─ Total (0-100)
  │
  ├─ Recommendations
  │  ├─ Analyze title length
  │  ├─ Check slug format
  │  ├─ Check description length
  │  └─ Check keyword count
  │
  └─ Display updates
     ├─ Score badge
     ├─ Score bar
     ├─ Element checklist
     ├─ Recommendations list
     └─ Google preview


ApprovalStatus Component Flow
  │
  ├─ Display status badge
  │  ├─ Color: green (approved) or yellow (pending)
  │  └─ Text: "Approved" or "Pending Review"
  │
  ├─ Display metadata
  │  └─ Approval date & notes (if approved)
  │
  ├─ Action button click
  │  ├─ Approve → modal.open()
  │  ├─ Reject → modal.open()
  │  └─ Revoke → modal.open()
  │
  ├─ Modal workflow
  │  ├─ Get notes (if reject)
  │  ├─ Call approveTourLocation()
  │  └─ Handle response
  │
  └─ Notify parent
     └─ onApprovalChange()
```

## State Management

### LocationForm State
```typescript
const [formData, setFormData] = useState({
  // Basic Info
  name: '', slug: '', type: '', sequenceNumber: 0,
  latitude: 0, longitude: 0, island: '', address: '',
  timing: '', activity: '', durationMinutes: null,
  
  // Content & Media
  title: '', description: '', shortDescription: '',
  imageUrl: '', imageAlt: '',
  
  // Gallery
  gallery: [],
  
  // Marketing & SEO
  keywords: [], seoTags: [], metaDescription: '',
  highlights: [], bestTimeToVisit: '', funFacts: [],
  tips: [],
  
  // Amenities
  accessibility: [], amenities: [],
  
  // Admin
  visibility: 'PUBLIC', featured: false, isActive: true
});

const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [activeTab, setActiveTab] = useState('basic');
```

### List Page State
```typescript
const [locations, setLocations] = useState<TourLocation[]>([]);
const [pagination, setPagination] = useState(null);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(50);

const [filters, setFilters] = useState({
  search: '', type: '', island: '', status: '', approval: ''
});
```

### Edit Page State
```typescript
const [location, setLocation] = useState<TourLocation | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Import Page State
```typescript
const [file, setFile] = useState<File | null>(null);
const [csvData, setCsvData] = useState<CSVRow[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload');
const [results, setResults] = useState<ImportResult | null>(null);
const [error, setError] = useState<string | null>(null);
```

## API Call Patterns

### Fetch Pattern
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const result = await fetchFunction(params);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  })();
}, [dependencies]);
```

### Mutation Pattern
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async (data: any) => {
  setLoading(true);
  setError(null);
  try {
    const result = await mutationFunction(data);
    // Success handling
    showToast('Success message');
  } catch (err: any) {
    const msg = err.message || 'Error message';
    setError(msg);
    showToast(msg, 'error');
  } finally {
    setLoading(false);
  }
};
```

## Error Handling Patterns

### Form Validation
```typescript
const errors = validateLocationInput(formData);
if (Object.keys(errors).length > 0) {
  setErrors(errors);
  return;
}
```

### API Error Handling
```typescript
try {
  const result = await apiFunction(data);
} catch (error: any) {
  const message = error.message || 'Default error message';
  setError(message);
  showToast(message, 'error');
}
```

### User Confirmation
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  // Proceed with deletion
};
```

## Responsive Design Breakpoints

### Mobile (< 640px)
- Single column forms
- Stacked buttons
- Simplified table (fewer columns)
- Full-width modals

### Tablet (640px - 1024px)
- Two-column layouts where applicable
- Side-by-side buttons
- Table with most columns
- Centered modals with max-width

### Desktop (> 1024px)
- Multi-column layouts
- Full form width
- All table columns visible
- Modals with padding

## Performance Optimizations

### Component-level
- useCallback for event handlers
- useMemo for calculations (SEO score)
- Proper dependency arrays in useEffect

### Data-level
- Pagination (50 items per page default)
- Lazy loading of images
- SearchTourLocations for filtered results

### Rendering-level
- Conditional rendering of tabs
- Modal lazy loading
- Grid lazy loading of images

## Security Measures

### Input Validation
- Client-side validation before submission
- Server-side validation on API routes
- Sanitization of user input

### Authorization
- Admin role check on protected routes
- JWT verification on API endpoints
- User context validation

### Data Protection
- HTTPS for all API calls
- Secure cookie storage
- CSRF protection (NextAuth)

## Testing Strategies

### Unit Tests
- Component rendering
- Props validation
- State changes
- Event handlers

### Integration Tests
- Form submission with API
- Data fetching and display
- Filter and search functionality
- CRUD operations

### E2E Tests
- Complete user workflows
- Multi-step operations (import)
- Error scenarios
- Mobile responsiveness

## Accessibility Features

### Semantic HTML
- Proper heading hierarchy
- Form labels with inputs
- Button semantics
- List items for lists

### ARIA Labels
- Modal role and focus
- Loading indicators
- Error messages
- Hidden decorative elements

### Keyboard Navigation
- Tab through form fields
- Enter to submit
- Escape to close modals
- Arrow keys in tables

### Screen Reader Support
- Image alt text
- Form field descriptions
- Status updates announced
- Error messages prominent
