'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export const ImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [active, setActive] = useState(images[0] || '/placeholder.png');

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex flex-row gap-2 md:flex-col overflow-auto shrink-0">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(img)}
            className={`relative h-20 w-20 rounded-md bg-slate-50 border-2 overflow-hidden ${active === img ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Image src={img} alt="Thumbnail preview" fill className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square w-full max-w-xl overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
        <Image src={active} alt="Primary detail perspective" fill className="object-cover" priority />
      </div>
    </div>
  );
};