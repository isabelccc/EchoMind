"use client";

import { Sidebar } from '@/components/sidebar';
import { BarChart3, User, Star, Phone, Clock, Shield, Gift, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col justify-between py-6 px-4">
        <div>
          <div className="flex items-center mb-10">
            <span className="text-2xl font-bold text-blue-400">EchoMind</span>
          </div>
          <nav className="space-y-2">
            <a href="/" className="flex items-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-semibold shadow text-white mb-2">
              <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
            </a>
            <a href="/calls" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <Phone className="w-5 h-5 mr-3" /> Calls
            </a>
            <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <User className="w-5 h-5 mr-3" /> Customers
            </a>
            <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <Shield className="w-5 h-5 mr-3" /> Security
            </a>
            <a href="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <Star className="w-5 h-5 mr-3" /> Reviews
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-3 mt-10">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-blue-400" />
          <div>
            <div className="font-semibold">John Doe</div>
            <div className="text-xs text-gray-400">Admin</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold text-gray-900">Dashboard</div>
          <div className="flex items-center space-x-4">
            <input type="text" placeholder="Search..." className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-blue-400" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
            <div className="flex items-center mb-2"><Phone className="w-6 h-6 text-blue-500 mr-2" /> Today's Calls</div>
            <div className="text-3xl font-bold">12</div>
            <div className="text-green-500 font-semibold mt-1">+15%</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
            <div className="flex items-center mb-2"><Clock className="w-6 h-6 text-purple-500 mr-2" /> Avg. Duration</div>
            <div className="text-3xl font-bold">8m 32s</div>
            <div className="text-green-500 font-semibold mt-1">+2%</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
            <div className="flex items-center mb-2"><Star className="w-6 h-6 text-yellow-500 mr-2" /> Satisfaction</div>
            <div className="text-3xl font-bold">4.8</div>
            <div className="text-green-500 font-semibold mt-1">+0.3</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow p-6 flex flex-col items-start text-white">
            <div className="flex items-center mb-2"><Gift className="w-6 h-6 mr-2" /> Bonus of the Month</div>
            <div className="text-lg font-semibold mb-1">You have Bonus $100<br />10 Free Spins</div>
            <button className="mt-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-bold shadow hover:bg-gray-100">Claim Bonus</button>
          </div>
        </div>

        {/* Chart & Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl shadow p-6 col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-900">Call Analytics</div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Nov, 2023</span>
              </div>
            </div>
            {/* Placeholder for chart */}
            <div className="h-48 flex items-center justify-center text-gray-400">[Bar Chart Here]</div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <div>Total Files: <span className="font-bold text-gray-900">9.5k</span></div>
              <div>Scanned Files: <span className="font-bold text-gray-900">8k</span></div>
            </div>
          </div>

          {/* Protection Status Widget */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="font-semibold text-gray-900 mb-2">Protection Status</div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 flex items-center justify-center mb-2">
              <span className="text-3xl font-bold text-blue-700">80%</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Average Protection</div>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold shadow hover:bg-blue-200">Overview</button>
          </div>
        </div>

        {/* Issues Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <div className="font-semibold text-gray-900 mb-2">262 issues total</div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-500">Simple</span>
                <span>50%</span>
              </div>
              <div className="w-full h-2 bg-red-100 rounded-full mb-2">
                <div className="h-2 bg-red-500 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-500">Medium</span>
                <span>25%</span>
              </div>
              <div className="w-full h-2 bg-yellow-100 rounded-full mb-2">
                <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-500">Complex</span>
                <span>10%</span>
              </div>
              <div className="w-full h-2 bg-purple-100 rounded-full">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 