# Quick Edit Modal - Visual Guide & Interaction Flows

## Tour Package Table View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Tour Packages                                    + Create New Package│
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ Name        │ Type           │ Duration  │ Group Size │ Actions  │
├───────────────────────────────────────────────────────────────────┤
│ Island      │ Island Hopping │ 480 min   │ 1-20       │ 🟣 🔵 🔴 │
│ Paradise    │ / 1 days       │           │            │ Quick Edit
│             │                │           │            │ Edit Delete
├───────────────────────────────────────────────────────────────────┤
│ Cultural    │ Cultural       │ 480 min   │ 2-15       │ 🟣 🔵 🔴 │
│ Tour        │ / 1 days       │           │            │ Quick Edit
│             │                │           │            │ Edit Delete
└───────────────────────────────────────────────────────────────────┘
                                ↓
                          Click "🟣 Quick Edit"
                                ↓
```

## Modal - Tour Type Tab

```
╔═══════════════════════════════════════════════════════════════════╗
║ Quick Edit Tour Package                                        ×  ║
║ Island Paradise                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║ [Tour Type] [Included] [Excluded]                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║ Select Tour Type                                                   ║
║                                                                    ║
║ ┌──────────────────┐  ┌──────────────────┐                        ║
║ │ Island Hopping   │  │ Cultural Tour    │                        ║
║ │ (Currently Select)│  │ (Click to select)│                        ║
║ └──────────────────┘  └──────────────────┘                        ║
║                                                                    ║
║ ┌──────────────────┐  ┌──────────────────┐                        ║
║ │ Adventure        │  │ Luxury Tour      │                        ║
║ │ (Click to select) │  │ (Click to select)│                        ║
║ └──────────────────┘  └──────────────────┘                        ║
║                                                                    ║
║ ┌──────────────────┐                                              ║
║ │ Themed Tour      │                                              ║
║ │ (Click to select) │                                              ║
║ └──────────────────┘                                              ║
║                                                                    ║
║ ✓ Tour type will change from Island Hopping to Luxury Tour       ║
║                                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                     [ Cancel ]  [ Save Changes ]   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Modal - Included Services Tab

```
╔═══════════════════════════════════════════════════════════════════╗
║ Quick Edit Tour Package                                        ×  ║
║ Island Paradise                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║ [Tour Type] [Included] [Excluded]                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║ Select Services to Include                                         ║
║                                                                    ║
║ ☑ Meals Included           ☐ Professional Guide                   ║
║ ☑ Transportation           ☐ Snorkel Gear                         ║
║ ☑ Insurance                ☐ Equipment                            ║
║ ☑ Activities               ☐ Accommodation                        ║
║                                                                    ║
║ 4 service(s) selected                                              ║
║                                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                     [ Cancel ]  [ Save Changes ]   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Modal - Excluded Services Tab

```
╔═══════════════════════════════════════════════════════════════════╗
║ Quick Edit Tour Package                                        ×  ║
║ Island Paradise                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║ [Tour Type] [Included] [Excluded]                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║ Select Services to Exclude                                         ║
║                                                                    ║
║ ☑ Snorkel Gear             ☐ Meals Included                       ║
║ ☑ Equipment                ☐ Professional Guide                   ║
║ ☐ Insurance                ☐ Transportation                       ║
║ ☐ Activities               ☐ Accommodation                        ║
║                                                                    ║
║ 2 service(s) excluded                                              ║
║                                                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                     [ Cancel ]  [ Save Changes ]   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Button States

### Normal State
```
[ Cancel ]  [ Save Changes ]
```

### No Changes (Disabled)
```
[ Cancel ]  [ Save Changes ] (grayed out, disabled)
```

### Saving State
```
[ Cancel ]  [ Saving... ] (spinner, disabled)
```

### Error State
```
┌─────────────────────────────────────────┐
│ ⚠ Error: Failed to save changes         │
└─────────────────────────────────────────┘
[ Cancel ]  [ Save Changes ]
```

## Data Update Flow

```
User Clicks "Quick Edit"
        ↓
Modal Opens with Current Data
        ↓
User Makes Selection Changes
        ↓
"Save Changes" Button Enabled
        ↓
User Clicks "Save Changes"
        ↓
handleQuickEditSave() Called
        ↓
quickUpdateTourPackage(id, updateData)
        ↓
PATCH /api/admin/tour-packages/[id]/quick-update
        ↓
Server: Validate Package Exists
        ↓
Server: Check for Changes
        ↓
Server: Update Database
        ↓
Server: Return Updated Package
        ↓
Client: Receive Success Response
        ↓
Modal Auto-Closes
        ↓
User Back at Tour Packages Table
        ↓
✅ Updated Data Visible
```

---

**Quick Edit is fully implemented and ready for testing!**
