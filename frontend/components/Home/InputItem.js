"use client"

import { useDestinationContext } from '@/context/DestinationContext'
import { useSourceContext } from '@/context/SourceContext'
import Image from 'next/image'
import { useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { useLanguage } from '@/context/LanguageContext'

const LABELS = {
  en: {
    source: { placeholder: 'Pickup location', iconAlt: 'Pickup pin' },
    destination: { placeholder: 'Drop‑off location', iconAlt: 'Drop‑off pin' },
  },
  th: {
    source: { placeholder: 'จุดรับ', iconAlt: 'หมุดจุดรับ' },
    destination: { placeholder: 'จุดส่ง', iconAlt: 'หมุดจุดส่ง' },
  },
}

// InputItem component for source and destination input
const InputItem = ({ type, mapsReady }) => {
  const [value, setValue] = useState(null)
  const { lang } = useLanguage()
  const { setSource } = useSourceContext()
  const { setDestination } = useDestinationContext()

  // Localized placeholder and icon alt based on type
  const key = type === 'source' ? 'source' : 'destination'
  const t = (LABELS[lang === 'th' ? 'th' : 'en'] || LABELS.en)[key]
  const placeholder = t.placeholder
  const iconSrc = type === 'source' ? '/icons/pickup-pin.svg' : '/icons/dropoff-pin.svg'
  const iconAlt = t.iconAlt

  const getLatAndLng = (selected, which) => {
    setValue(selected)
    const g = typeof window !== 'undefined' ? window.google : undefined
    const placeId = selected?.value?.place_id
    if (!g?.maps?.places || !placeId) return

    const service = new g.maps.places.PlacesService(document.createElement('div'))
    service.getDetails(
      { placeId, fields: ['geometry.location', 'formatted_address', 'name'] },
      (place, status) => {
        if (status === g.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const payload = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.formatted_address,
            label: place.name,
          }
          if (which === 'source') setSource(payload)
          else setDestination(payload)
        }
      }
    )
  }

  const g = typeof window !== 'undefined' ? window.google : undefined
  const ok = !!g?.maps?.places && mapsReady !== false

  return (
    <div className="flex h-full items-center gap-3 mt-3 rounded-lg bg-slate-100 px-3 py-2 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/40">
      <Image src={iconSrc} width={28} height={28} alt={iconAlt} priority />
      {ok ? (
        <GooglePlacesAutocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
          apiOptions={{
            language: lang === 'th' ? 'th' : 'en',
            region: lang === 'th' ? 'TH' : 'US',
            libraries: ['places'],
          }}
          selectProps={{
            value,
            onChange: (place) => getLatAndLng(place, type),
            placeholder,
            'aria-label': placeholder,
            isClearable: true,
            className: 'w-full',
            components: { DropdownIndicator: null, IndicatorSeparator: null },
            styles: {
              control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none', minHeight: '2.25rem' }),
              valueContainer: (base) => ({ ...base, paddingLeft: 0 }),
              input: (base) => ({ ...base, color: '#111827' }),
              placeholder: (base) => ({ ...base, color: '#6b7280' }),
              menu: (base) => ({ ...base, zIndex: 50 }),
            },
          }}
        />
      ) : (
        <input
          aria-label={placeholder}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          value={value?.label || ''}
          onChange={(e) => setValue({ label: e.target.value })}
        />
      )}
    </div>
  )
}

export default InputItem