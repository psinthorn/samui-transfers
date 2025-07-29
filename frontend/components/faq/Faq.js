import React from 'react';
import Item from './Item';

const Faq = () => {
  return (
    <div className='p-2'>
      <div className="p-4 max-w-screen-lg mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center text-primary">Frequently Asked Questions (FAQs)</h1>
        <div className="space-y-4">
          <Item question="What is the capital of Nigeria?" answer="Abuja" />
          <Item question="What is the capital of Ghana?" answer="Accra" />
          <Item question="What is the capital of Kenya?" answer="Nairobi" />
          <Item question="What is the capital of South Africa?" answer="Pretoria" />
          <Item question="What is the capital of Egypt?" answer="Cairo" />
        </div>
      </div>
    </div>
  );
};

export default Faq;