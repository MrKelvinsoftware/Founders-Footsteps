"use client";

import { useState } from "react";
import { Plane, Hotel, Package, Star, MapPin, Calendar, Users, Search } from "lucide-react";

const searchTabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "packages", label: "Packages", icon: Package },
  { id: "activities", label: "Activities", icon: Star },
];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState("flights");

  return (
    <div className="search-box max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {searchTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`search-tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? "active" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* From/Location */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === "flights" ? "From" : "Location"}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === "flights" ? "New York (NYC)" : "Where to?"}
              className="search-input pl-10"
            />
          </div>
        </div>

        {/* To/Destination */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === "flights" ? "To" : "Check-in"}
          </label>
          <div className="relative">
            {activeTab === "flights" ? (
              <>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paris, France"
                  className="search-input pl-10"
                />
              </>
            ) : (
              <>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  className="search-input pl-10"
                />
              </>
            )}
          </div>
        </div>

        {/* Check-in/Departure */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === "flights" ? "Departure" : "Check-out"}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              className="search-input pl-10"
            />
          </div>
        </div>

        {/* Check-out/Return */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === "flights" ? "Return" : "Guests"}
          </label>
          <div className="relative">
            {activeTab === "flights" ? (
              <>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  className="search-input pl-10"
                />
              </>
            ) : (
              <>
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="2 Adults, 1 Child"
                  className="search-input pl-10"
                />
              </>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="lg:col-span-1 flex items-end">
          <button className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
