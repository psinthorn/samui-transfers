import React from 'react'

const ContactBanner = () => {
  return (
     
    <div className="flex flex-row flex-nowrap items-center justify-center gap-6 bg-primary text-white font-thin rounded-lg shadow-md mx-4 overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span role="img" aria-label="Email">📧</span>
        <a
          href="mailto:info@samui-transfers.com"
          className="text-sm hover:text-light-gray transition break-all"
        >
          info@samui-transfers.com
        </a>
      </div>

      <div className="flex items-center gap-2">
        <span role="img" aria-label="WhatsApp">💬</span>
        <a
          href="https://wa.me/66991087999"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-light-gray transition"
        >
          WhatsApp
        </a>
      </div>
    </div>
  )
}

export default ContactBanner