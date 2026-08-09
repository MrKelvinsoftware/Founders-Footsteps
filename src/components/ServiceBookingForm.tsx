"use client";

import { useState } from "react";
import { Calendar, Clock, Users, Mail, Phone, MessageSquare } from "lucide-react";

interface ServiceBookingFormProps {
  serviceLineSlug: string;
}

export default function ServiceBookingForm({ serviceLineSlug }: ServiceBookingFormProps) {
  const [formData, setFormData] = useState({
    service: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    guests: "1",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking form submitted:", formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Request Submitted!</h3>
        <p className="text-slate-600 mb-6">
          Thank you for your booking request. Our team will contact you within 24 hours to confirm your reservation.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-primary px-8 py-3"
        >
          Make Another Booking
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Service
          </label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="search-input"
            required
          >
            <option value="">Choose a service...</option>
            <option value="standard">Standard Package</option>
            <option value="premium">Premium Package</option>
            <option value="deluxe">Deluxe Package</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="search-input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="search-input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="search-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="search-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Number of Guests
          </label>
          <select
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            className="search-input"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>{num} {num === 1 ? "Guest" : "Guests"}</option>
            ))}
            <option value="10+">10+ Guests</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="search-input"
            placeholder="John"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="search-input"
            placeholder="Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="search-input"
            placeholder="0261404904"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="search-input min-h-[120px]"
            placeholder="Any special requests or requirements..."
            rows={4}
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          className="btn-primary w-full py-4 text-lg"
        >
          Submit Booking Request
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          By submitting this form, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </form>
  );
}
