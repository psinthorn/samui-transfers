# Bank Transfer Credential Form - Visual Guide

## Form Structure (After Update)

### Top: Required Basic Information
```
┌─────────────────────────────────────────────────┐
│ Bank Name *                                     │
│ [Bangkok Bank                                ] │
├─────────────────────────────────────────────────┤
│ Account Holder Name *                           │
│ [Show/Hide Icon]                                │
│ [Samui Transfers Ltd.                     🔑] │
├─────────────────────────────────────────────────┤
│ Account Number *                                │
│ [Show/Hide Icon]                                │
│ [●●●●●●●●●●          🔑]                       │
└─────────────────────────────────────────────────┘
```

---

## Section 1: Thailand-Specific (NEW)
```
┌──────────────────────────────────────────────────┐
│ SWIFT Code (Thailand) *                          │
│ [BKKATH22                                     ] │
│ ℹ️ Society for Worldwide Interbank Financial    │
│    Telecommunication code                       │
├──────────────────────────────────────────────────┤
│ Bank Branch (Thailand)                           │
│ [Bangkok Branch                               ] │
│ ℹ️ Optional: Thai bank branch name              │
└──────────────────────────────────────────────────┘
```

**SWIFT Code Features:**
- ✅ 8-11 characters
- ✅ Auto-converts to UPPERCASE
- ✅ Monospace font (like BKKATH22, KKBKTHBK)
- ✅ Examples: BKKATH22, SCBLTHBK, GSCBTHBK

**Bank Branch Features:**
- ✅ Optional field
- ✅ Natural text (e.g., "Bangkok Branch")

---

## Visual Separator
```
─────────────────────────────────────────────────
```

---

## Section 2: International Transfers (UPDATED)
```
┌──────────────────────────────────────────────────┐
│ IBAN (International Transfers)                   │
│ [DE89370400440532013000                      ] │
│ ℹ️ Used for EU and international transfers      │
├──────────────────────────────────────────────────┤
│ Routing Number (US/Alternative)                  │
│ [021000021                                   ] │
│ ℹ️ 9-digit US routing number or alternative code│
└──────────────────────────────────────────────────┘
```

**IBAN Features:**
- ✅ 15-34 characters
- ✅ Monospace font
- ✅ For EU and international transfers
- ✅ NOT for Thailand

**Routing Number Features:**
- ✅ 9 digits (US standard)
- ✅ Can be alternative codes
- ✅ Monospace font

---

## Bottom: Action Button
```
┌──────────────────────────────────────────────────┐
│ [💾] Save & Encrypt Credentials                │
└──────────────────────────────────────────────────┘
```

---

## Security Notice (Below Form)
```
┌──────────────────────────────────────────────────┐
│ 🔒 Security Information                          │
│                                                  │
│ • All credentials encrypted with AES-256-GCM   │
│ • Encryption key in environment variables      │
│ • Never shown in plain text in admin panel     │
│ • Decrypted only when needed for payment      │
│ • All changes logged with timestamp & admin ID │
└──────────────────────────────────────────────────┘
```

---

## Usage Scenarios

### Scenario 1: Thailand Bank (Bangkok Bank)
**FILL THIS:**
```
Bank Name:        Bangkok Bank
Account Name:     Samui Transfers Ltd
Account Number:   123-456-789
SWIFT Code:       BKKATH22           ← FILL
Bank Branch:      Bangkok Branch     ← FILL
```

**LEAVE BLANK:**
```
IBAN:             [empty]
Routing Number:   [empty]
```

---

### Scenario 2: Germany Bank Transfer
**FILL THIS:**
```
Bank Name:        Deutsche Bank
Account Name:     Company Name
Account Number:   123456789
IBAN:             DE89370400440532013000  ← FILL
```

**LEAVE BLANK:**
```
SWIFT Code:       [empty]
Bank Branch:      [empty]
Routing Number:   [empty]
```

---

### Scenario 3: US Bank Transfer
**FILL THIS:**
```
Bank Name:        Chase Bank
Account Name:     US Account
Account Number:   123456789
Routing Number:   021000021           ← FILL
```

**LEAVE BLANK:**
```
SWIFT Code:       [empty]
Bank Branch:      [empty]
IBAN:             [empty]
```

---

## Form Responsiveness

### Desktop (>768px)
```
┌────────────────────────────────────────────┐
│ Bank Name         │ Account Name           │
├────────────────────────────────────────────┤
│ Account Number                             │
├────────────────────────────────────────────┤
│ SWIFT Code        │ Bank Branch            │
│ ─────────────────────────────────────────│
│ IBAN              │ Routing Number         │
└────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────┐
│ Bank Name               │
├─────────────────────────┤
│ Account Name            │
├─────────────────────────┤
│ Account Number          │
├─────────────────────────┤
│ SWIFT Code              │
├─────────────────────────┤
│ Bank Branch             │
│ ─────────────────────────
│ IBAN                    │
├─────────────────────────┤
│ Routing Number          │
└─────────────────────────┘
```

---

## Color Coding

| Element | Color | Purpose |
|---------|-------|---------|
| Labels | Dark Slate (slate-700) | Clear hierarchy |
| Inputs | Light Border (slate-300) | Visual separation |
| Focus State | Blue Ring (ring-blue-500) | User feedback |
| Required (*) | Red (red-600) | Visual indicator |
| Helper Text | Light Gray (slate-500) | Guidance |
| Button | Blue (bg-blue-600) | Call-to-action |
| Security Box | Light Blue (bg-blue-50) | Important info |

---

## API Response (Masked)

When you submit the form, the API returns:

```json
{
  "id": "cred_abc123",
  "gatewayId": "gw_xyz789",
  "isConfigured": true,
  "bankBankName": "Bangkok Bank",
  "bankAccountName": "****",
  "bankAccountNumber": "****",
  "bankSwiftCode": "****",
  "bankBankBranch": "****",
  "bankIban": null,
  "bankRoutingNumber": null,
  "verificationStatus": "PENDING"
}
```

**Notice:**
- ✅ All sensitive fields shown as "****"
- ✅ Only bank name shown in full
- ✅ Original values stored encrypted in database
- ✅ Never displayed in plain text

---

## Validation Rules

| Field | Required | Format | Validation |
|-------|----------|--------|-----------|
| Bank Name | ✅ Yes | Text | Any bank name |
| Account Name | ✅ Yes | Text | Any account holder |
| Account Number | ✅ Yes | Text/Number | Any account number |
| SWIFT Code | ❌ No (if IBAN) | 8-11 chars | Auto-uppercase |
| Bank Branch | ❌ No | Text | Natural branch name |
| IBAN | ❌ No (if SWIFT) | 15-34 chars | EU standard |
| Routing Number | ❌ No | 9+ digits | US standard |

---

## Interaction Flow

1. **Admin clicks 🔑 button on payment gateway**
   ↓
2. **Modal opens with credential form**
   ↓
3. **Admin selects gateway type (Bank Transfer)**
   ↓
4. **Form displays with Thailand + International sections**
   ↓
5. **Admin fills in appropriate fields for transfer type**
   ↓
6. **Admin clicks "Save & Encrypt Credentials"**
   ↓
7. **Frontend validates input**
   ↓
8. **Backend encrypts with AES-256-GCM**
   ↓
9. **Database stores encrypted values**
   ↓
10. **API returns masked response**
   ↓
11. **Admin sees confirmation with "****" for security**

---

## Common Errors & Guidance

### Missing SWIFT Code (Thailand Transfer)
```
⚠️ SWIFT Code should be provided for Thailand transfers
📝 Example: BKKATH22 (Bangkok Bank)
```

### Both SWIFT and IBAN Provided
```
ℹ️ You provided both SWIFT and IBAN
✅ Both will be stored (one will be used based on transfer type)
```

### Invalid SWIFT Code Format
```
⚠️ SWIFT codes are typically 8-11 characters
📝 Provided: BKKATH (7 chars)
💡 Check with your bank for correct code
```

---

## Keyboard Navigation

```
Tab 1:  Bank Name
Tab 2:  Account Name (with show/hide button)
Tab 3:  Account Number (with show/hide button)
Tab 4:  SWIFT Code
Tab 5:  Bank Branch
Tab 6:  IBAN
Tab 7:  Routing Number
Tab 8:  Save Button
```

All fields have proper labels and helper text for screen readers.

---

## Status Indicators

### Before Saving
```
[Button: Save & Encrypt Credentials]  (Blue, clickable)
```

### While Saving
```
[Button: Saving...]  (Blue, disabled, shows spinner)
```

### After Saving
```
[Button: Save & Encrypt Credentials]  (Blue, re-enabled)
✅ Security Notice displays below
```

---

## Summary

**Form Layout: CLEAN** ✅
- Clear sections (Thailand vs International)
- Visual separator between sections
- Helpful descriptions and examples

**User Experience: INTUITIVE** ✅
- Only relevant fields shown per transfer type
- Helper text explains what's needed
- Security information always visible

**Technical: SECURE** ✅
- All credentials encrypted
- Never shown in plain text
- Proper form validation
- Audit trail maintained
