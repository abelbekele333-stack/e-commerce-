import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-16">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8">About LuxeMarket</h1>
      
      <div className="prose prose-lg prose-slate">
        <p className="lead text-xl text-slate-600 mb-6">
          LuxeMarket was founded on a simple principle: to curate the finest products for the modern lifestyle.
        </p>
        
        <p className="mb-6 text-slate-700 leading-relaxed">
          We believe that quality and aesthetic balance shouldn't be compromised. Every item in our collection is meticulously selected to ensure it meets our high standards for design, durability, and utility.
        </p>
        
        <p className="mb-6 text-slate-700 leading-relaxed">
          From the materials we source to the artisans we partner with, transparency and integrity are at the core of everything we do. Thank you for being a part of our journey.
        </p>
      </div>
    </div>
  );
}
