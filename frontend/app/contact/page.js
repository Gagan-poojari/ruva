export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Contact Us</h1>
        <p className="text-gray-500 text-center mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a0a2e] focus:border-transparent transition-all bg-gray-50 focus:bg-white" 
              placeholder="Your name" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a0a2e] focus:border-transparent transition-all bg-gray-50 focus:bg-white" 
              placeholder="your@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea 
              rows="5" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a0a2e] focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none" 
              placeholder="How can we help?"
            ></textarea>
          </div>
          <button 
            type="button" 
            className="w-full bg-[#1a0a2e] text-white py-4 rounded-xl font-medium hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
