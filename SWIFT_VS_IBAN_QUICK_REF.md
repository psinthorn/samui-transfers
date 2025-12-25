# Thailand Bank Transfer: SWIFT vs IBAN - Quick Reference

## The Question
> "On bank transfer thailand have SWIFT I see you put IBAN it is the same?"

## The Answer
**No.** SWIFT and IBAN are completely different systems:

| Aspect | SWIFT | IBAN |
|--------|-------|------|
| **Full Name** | Society for Worldwide Interbank Financial Telecommunication | International Bank Account Number |
| **Length** | 8-11 characters | 15-34 characters |
| **Regions** | Global (including Thailand) | EU, Middle East, some Asia (NOT Thailand) |
| **Purpose** | International wire transfer routing | Account identification |
| **For Thailand** | ✅ YES - Primary method | ❌ NO - Not used |
| **Example** | BKKATH22 (Bangkok Bank) | DE89370400440532013000 (Germany) |

## Thailand Bank Examples

### Major Thai Banks with SWIFT Codes
| Bank | SWIFT Code | Type |
|------|-----------|------|
| Bangkok Bank | BKKATH22 | Commercial |
| Kasikornbank | KKBKTHBK | Commercial |
| Siam Commercial Bank | SCBLTHBK | Commercial |
| Government Savings Bank | GSCBTHBK | Government |
| Krung Thai Bank | KRTBTHBK | Commercial |
| Bank of Ayudhya | AYUDTHBK | Commercial |

## What's Been Implemented

### Database Changes ✅
Added to `PaymentGatewayCredential` model:
- `bankSwiftCode?: String` - Thailand SWIFT codes
- `bankBankBranch?: String` - Thai branch names
- `bankIban?: String` - International IBAN
- `bankRoutingNumber?: String` - US routing or alternative

### UI Form Changes ✅
Bank Transfer credentials form now has TWO sections:

**Thailand-Specific Section:**
- SWIFT Code field (auto-uppercase)
- Bank Branch field

**International Section:**
- IBAN field
- Routing Number field

### API Changes ✅
- All new fields encrypted with AES-256-GCM
- Proper validation and masking
- Support for both Thailand and international transfers

## Usage Examples

### Thailand Transfer Setup
```
Bank Name: Bangkok Bank
Account Name: Samui Transfers Ltd
Account Number: 123-456-789
SWIFT Code: BKKATH22        ← Thailand-specific
Bank Branch: Bangkok Branch  ← Thai context
```

### International Transfer Setup
```
Bank Name: Deutsche Bank
Account Name: International Account
Account Number: 123456789
IBAN: DE89370400440532013000  ← International
```

### US Transfer Setup
```
Bank Name: Chase Bank
Account Name: US Account
Account Number: 123456789
Routing Number: 021000021  ← US-specific
```

## Files Updated
1. ✅ `prisma/schema.prisma` - Database fields added
2. ✅ `components/admin/PaymentGatewayCredentials.tsx` - UI form split
3. ✅ `app/api/admin/payment-gateways/[id]/credentials/route.ts` - API handling

## Security
- ✅ All credentials encrypted before storage
- ✅ Never shown in plain text
- ✅ Masked in API responses
- ✅ Change audit trail maintained

## Status
**COMPLETE** - Ready for credential submission with proper SWIFT/IBAN handling
