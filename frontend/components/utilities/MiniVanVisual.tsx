import React from 'react'
import { FaMapMarkerAlt, FaShuttleVan, FaMapPin } from 'react-icons/fa'

const MiniVanVisual = () => {
  return (
    // Pickup & Dropoff Visual
    <div className="flex flex-col items-center my-6">
      <div className="flex items-center gap-2 w-full">
        <FaMapMarkerAlt className="text-gray-400 text-lg" />
        <span className="font-thin text-gray-400 text-sm">Pickup</span>
        <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2"></div>
        <FaShuttleVan className="text-gray-500 text-lg animate-bounce" />
        <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2"></div>
        <FaMapPin className="text-gray-400 text-lg " />
        <span className="font-thin text-gray-400 text-sm">Dropoff</span>
      </div>
    </div>
  )
}

export default MiniVanVisual