"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We&apos;re here to help. Reach out to us with any questions or inquiries.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-white -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Phone</h4>
              <p className="text-slate-600">+1 (800) 123-4567</p>
              <p className="text-slate-500 text-sm">Mon-Fri 9am-6pm</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Email</h4>
              <p className="text-slate-600">info@foundersfootsteps.com</p>
              <p className="text-slate-500 text-sm">24/7 Support</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Address</h4>
              <p className="text-slate-600">123 Business Street</p>
              <p className="text-slate-500 text-sm">New York, NY 10001</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-red-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Business Hours</h4>
              <p className="text-slate-600">Mon-Sat: 9am-8pm</p>
              <p className="text-slate-500 text-sm">Sunday: 10am-6pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary px-8 py-3"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="search-input"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="search-input"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="search-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="search-input"
                        required
                      >
                        <option value="">Select a subject...</option>
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="search-input min-h-[150px]"
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Map & Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="card overflow-hidden">
                <div className="aspect-video bg-slate-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Links</h3>
                <div className="space-y-4">
                  {[
                    { question: "How do I make a booking?", link: "/booking" },
                    { question: "What is your cancellation policy?", link: "/faq" },
                    { question: "How do I contact customer support?", link: "/support" },
                    { question: "What payment methods do you accept?", link: "/payment" },
                  ].map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-slate-700 font-medium">{item.question}</span>
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Teams */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Support Teams</h2>
            <p className="text-lg text-slate-600">Specialized support for each service line</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Travel & Trips", email: "phrimpongkelvin@gmail.com", phone: "+233261404904", color: "#10b981" },
              { name: "Car Services", email: "phrimpongkelvin@gmail.com", phone: "+233 261404904", color: "#3b82f6" },
              { name: "Events & Catering", email: "events@foundersfootsteps.com", phone: "+233257664762", color: "#f59e0b" },
            ].map((team, index) => (
              <div key={index} className="card p-6">
                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0)}
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-4">{team.name}</h4>
                <div className="space-y-2">
                  <p className="text-slate-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {team.email}
                  </p>
                  <p className="text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {team.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
