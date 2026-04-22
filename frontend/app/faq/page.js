export default function FAQPage() {
  const faqs = [
    {
      q: "What is your return policy?",
      a: "We offer a 7-day return policy for all unworn sarees in their original packaging with tags attached. Custom tailored items are non-refundable."
    },
    {
      q: "How long does shipping take?",
      a: "Domestic orders typically arrive within 3-5 business days. International shipping takes 7-14 days depending on the destination."
    },
    {
      q: "Do you offer custom tailoring?",
      a: "Yes, we offer custom blouse stitching and fall/picot services for an additional fee. You can select these options before adding a saree to your cart."
    },
    {
      q: "How can I track my order?",
      a: "Once your order ships, you will receive an email with tracking information. You can also track your order through your account dashboard."
    },
    {
      q: "Are the colors exactly as shown in the pictures?",
      a: "We do our best to ensure that our photos are as true to color as possible. However, due to inconsistencies in monitors, digital photography, and production variations, we cannot guarantee that the color you see on your screen accurately portrays the true color of the product."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-500">Still have questions?</p>
          <a href="/contact" className="inline-block mt-4 px-6 py-2 bg-[#1a0a2e] text-white rounded-full hover:bg-opacity-90 transition-all">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
