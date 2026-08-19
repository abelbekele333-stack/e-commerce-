import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 py-12">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Contact Us</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Have a question or need assistance with your order? Our support team is here to help.
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Email</h3>
            <p className="text-slate-600">support@luxemarket.com</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
            <p className="text-slate-600">+1 (800) 123-4567</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Office</h3>
            <p className="text-slate-600">123 Commerce Avenue, Suite 400<br/>New York, NY 10001</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg" placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-3 rounded-lg" placeholder="jane@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea rows={5} className="w-full px-4 py-3 rounded-lg resize-none" placeholder="How can we help you?" required></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
