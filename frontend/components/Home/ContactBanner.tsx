import React from 'react'

const ContactBanner = () => {
  return (
     <div className="flex flex-col gap-4 items-start justify-center bg-primary text-white py-7 px-4 rounded-lg shadow-md sm:flex-row sm:gap-6 sm:items-center">
      <div className="flex w-full items-center gap-2 text-left sm:w-auto sm:justify-center sm:text-center">
        <span role="img" aria-label="Email">📧</span>
        <a href="mailto:info@samui-transfers.com" className="hover:text-light-gray transition  break-all">info@samui-transfers.com</a>
      </div>
      <div className="flex w-full items-center gap-2 text-left sm:w-auto sm:justify-center sm:text-center">
        <span role="img" aria-label="Mobile">📱</span>
        <a href="tel:+6612345678" className="hover:text-light-gray transition ">+66 99 108 7999</a>
      </div>
      <div className="flex w-full items-center gap-2 text-left sm:w-auto sm:justify-center sm:text-center">
        <span role="img" aria-label="WhatsApp">💬</span>
        <a href="https://wa.me/66991087999" target="_blank" rel="samui-transferd.com whatsapp" className="hover:text-light-gray transition ">WhatsApp</a>
      </div>
    </div>
    // <div className="bg-primary text-white py-6 px-4 rounded-lg flex flex-col md:flex-row items-center justify-center gap-6 shadow-md">
    //   <div className="flex items-center gap-2">
    //     <span role="img" aria-label="Email">📧</span>
    //     <a href="mailto:info@samui-transfers.com" className=" hover:text-light-gray transition">info@samui-transfers.com</a>
    //   </div>
    //   <div className="flex items-center gap-2">
    //     <span role="img" aria-label="Mobile">📱</span>
    //     <a href="tel:+6612345678" className=" hover:text-light-gray transition">+66 99 108 7999</a>
    //   </div>
    //   <div className="flex items-center gap-2">
    //     <span role="img" aria-label="WhatsApp">💬</span>
    //     <a href="https://wa.me/66991087999" target="_blank" rel="noopener noreferrer" className=" hover:text-light-gray transition">WhatsApp</a>
    //   </div>
    // </div>
  )
}

export default ContactBanner