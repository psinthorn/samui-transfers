import React from 'react'

const ContactBanner = () => {
  return (
     <div className="flex flex-col gap-4 items-start justify-center bg-primary text-white font-thin rounded-lg shadow-md mx-4 sm:flex-row sm:gap-6 sm:items-center">
      <div className="flex items-center gap-2 text-left sm:w-auto sm:justify-center sm:text-center">
        <span role="img" aria-label="Email">📧</span>
        <a href="mailto:info@samui-transfers.com" className="text-sm hover:text-light-gray transition break-all">info@samui-transfers.com</a>
      </div>
     
      <div className="flex text-thin text-sm items-center gap-2 text-left sm:w-auto sm:justify-center sm:text-center">
        <span role="img" aria-label="WhatsApp">💬</span>
        <a href="https://wa.me/66991087999" target="_blank" rel="samui-transferd.com whatsapp" className="hover:text-light-gray transition ">WhatsApp</a>
      </div>
    </div>
    
  )
}

export default ContactBanner