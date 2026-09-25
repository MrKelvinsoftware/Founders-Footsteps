"use client";

import { useState } from "react";
import { Calendar, Clock, Users, Mail, Phone, MessageSquare, Home, Car, Utensils, Plane, Scissors, DollarSign, CheckCircle } from "lucide-react";

interface AdvancedBookingFormProps {
  serviceLineSlug: string;
}

const constructionOptions = [
  { id: "new-construction", name: "New Home Construction", icon: Home, basePrice: 150000 },
  { id: "kitchen-reno", name: "Kitchen Renovation", icon: Home, basePrice: 25000 },
  { id: "bathroom-reno", name: "Bathroom Renovation", icon: Home, basePrice: 15000 },
  { id: "full-remodel", name: "Full Home Remodel", icon: Home, basePrice: 75000 },
  { id: "addition", name: "Home Addition", icon: Home, basePrice: 50000 },
  { id: "roofing", name: "Roofing", icon: Home, basePrice: 12000 },
];

const carRentalOptions: any[] = [
  { id: "economy", name: "Economy Car", basePrice: 49, icon: Car },
  { id: "compact", name: "Compact Car", basePrice: 59, icon: Car },
  { id: "sedan", name: "Standard Sedan", basePrice: 79, icon: Car },
  { id: "suv", name: "SUV", basePrice: 99, icon: Car },
  { id: "luxury", name: "Luxury Car", basePrice: 149, icon: Car },
  { id: "van", name: "Passenger Van", basePrice: 119, icon: Car },
];

const travelOptions: any[] = [
  { id: "domestic", name: "Domestic Trip", basePrice: 299, icon: Plane },
  { id: "international", name: "International Trip", basePrice: 899, icon: Plane },
  { id: "luxury", name: "Luxury Package", basePrice: 2499, icon: Plane },
  { id: "adventure", name: "Adventure Tour", basePrice: 1299, icon: Plane },
  { id: "honeymoon", name: "Honeymoon Package", basePrice: 3499, icon: Plane },
];

export default function AdvancedBookingForm({ serviceLineSlug }: AdvancedBookingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceType: "",
    startDate: "",
    endDate: "",
    guests: "1",
    propertyType: "",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    currentCondition: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    budget: "",
    timeline: "",
    notes: "",
    preferredContact: "email",
    referralSource: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateEstimate = () => {
    let base = 0;
    if (serviceLineSlug === "construction") {
      const option = constructionOptions.find(o => o.id === formData.serviceType);
      base = option?.basePrice || 0;
      if (formData.squareFootage) {
        const sqft = parseInt(formData.squareFootage);
        if (formData.serviceType === "new-construction") {
          base += sqft * 150;
        } else if (formData.serviceType === "full-remodel") {
          base += sqft * 75;
        }
      }
      if (formData.currentCondition === "poor") base *= 1.2;
      if (formData.currentCondition === "excellent") base *= 0.9;
    } else if (serviceLineSlug === "car-rental") {
      const option = carRentalOptions.find(o => o.id === formData.serviceType);
      base = (option?.basePrice || 50) * 7;
    } else if (serviceLineSlug === "travel-trips") {
      const option = travelOptions.find(o => o.id === formData.serviceType);
      base = (option?.basePrice || 500) * parseInt(formData.guests || "1");
    }
    setEstimate(Math.round(base));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    calculateEstimate();
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log("Booking submitted:", formData);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Request Submitted!</h3>
        <p className="text-slate-600 mb-6">
          Thank you for your booking request. Our team will contact you within 24 hours with a detailed estimate.
        </p>
        {estimate && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-blue-600 mb-2">Estimated Range</p>
            <p className="text-3xl font-bold text-blue-900">${estimate.toLocaleString()} - ${(estimate * 1.2).toLocaleString()}</p>
          </div>
        )}
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setFormData({ ...formData, serviceType: "" });
          }}
          className="btn-primary px-8 py-3"
        >
          Make Another Request
        </button>
      </div>
    );
  }

  const getServiceOptions = () => {
    switch (serviceLineSlug) {
      case "construction": return constructionOptions;
      case "car-rental": return carRentalOptions;
      case "travel-trips": return travelOptions;
      default: return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-8">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? "gradient-primary text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-24 md:w-32 h-1 mx-2 rounded ${step > s ? "gradient-primary" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Service Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {getServiceOptions().map((option) => {
              const Icon = option.icon || Home;
              return (
                <label
                  key={option.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.serviceType === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={option.id}
                    checked={formData.serviceType === option.id}
                    onChange={handleChange}
                    className="sr-only"
                    required
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{option.name}</p>
                      <p className="text-sm text-slate-500">From ${option.basePrice.toLocaleString()}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {serviceLineSlug === "construction" && formData.serviceType && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="search-input">
                  <option value="">Select...</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Square Footage</label>
                <input type="number" name="squareFootage" value={formData.squareFootage} onChange={handleChange} className="search-input" placeholder="e.g., 2000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Condition</label>
                <select name="currentCondition" value={formData.currentCondition} onChange={handleChange} className="search-input">
                  <option value="">Select...</option>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="search-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Number of People
              </label>
              <select name="guests" value={formData.guests} onChange={handleChange} className="search-input">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? "Person" : "People"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="search-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="search-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="search-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="search-input" required />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="search-input" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="search-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="search-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="search-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Budget Range
            </label>
            <select name="budget" value={formData.budget} onChange={handleChange} className="search-input">
              <option value="">Select budget range...</option>
              <option value="under-10k">Under $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-plus">$100,000+</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Additional Details</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Project Details / Special Requirements
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="search-input min-h-[150px]"
              placeholder="Tell us more about your project, specific requirements, or any questions..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Timeline</label>
              <select name="timeline" value={formData.timeline} onChange={handleChange} className="search-input">
                <option value="">Select...</option>
                <option value="asap">As soon as possible</option>
                <option value="1-month">Within 1 month</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Contact Method</label>
              <select name="preferredContact" value={formData.preferredContact} onChange={handleChange} className="search-input">
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="sms">SMS/Text</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a preliminary estimate. Our team will provide a detailed quote after reviewing your requirements.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary px-8 py-3">
            Back
          </button>
        ) : (
          <div />
        )}
        <button type="submit" className="btn-primary px-8 py-3">
          {step === 3 ? "Submit Request" : "Continue"}
        </button>
      </div>
    </form>
  );
}
