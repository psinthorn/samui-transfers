"use client"

import { useDestinationContext } from '@/context/DestinationContext'
import { useSourceContext } from '@/context/SourceContext'
import Image from 'next/image'
import { useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

// InputItem component for source and destination input
const InputItem = ({ type }) => {
  const [value, setValue] = useState(null)
  const { setSource } = useSourceContext()
  const { setDestination } = useDestinationContext()

  // check if type is source or destination and set the placeholder accordingly
  const placeholder = type === 'source' ? 'Pickup location' : 'Drop‑off location'
  const iconSrc = type === 'source' ? '/icons/person-pin.svg' : '/icons/dropoff-pin.svg'
  const iconAlt = type === 'source' ? 'Pickup pin' : 'Drop‑off pin'

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

  return (
    <div className="flex h-full items-center gap-3 mt-3 rounded-lg bg-slate-100 px-3 py-2 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/40">
      <Image src={iconSrc} width={28} height={28} alt={iconAlt} priority />
      <GooglePlacesAutocomplete
        selectProps={{
          value,
          onChange: (place) => getLatAndLng(place, type),
          placeholder,
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
    </div>
  )
}

export default InputItem