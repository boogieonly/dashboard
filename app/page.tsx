'use client';

import { useState } from 'react';

type Commodity = {
  id: string;
  name: string;
  price: string;
  change: string;
  percentChange: string;
  high: string;
  low: string;
  volume: string;
  time: string;
};

const dailyData: Commodity[] = [
  {
    id: '1',
    name: 'Copper',
    price: '$9,500',
    change: '+50',
    percentChange: '+0.53%',
    high: '$9,550',
    low: '$9,450',
    volume: '125,000',
    time: '10:00',
  },
  {
    id: '2',
    name: 'Aluminium',
    price: '$2,450',
    change: '-15',
    percentChange: '-0.61%',
    high: '$2,470',
    low: '$2,440',
    volume: '89,000',
    time: '09:45',
  },
  {
    id: '3',
    name: 'Nickel',
    price: '$18,200',
    change: '+320',
    percentChange: '+1.79%',
    high: '$18,400',
    low: '$17,900',
    volume: '45,500',
    time: '10:15',
  },
  {
    id: '4',
    name: 'Tin',
    price: '$32,100',
    change: '-200',
    percentChange: '-0.62%',
    high: '$32,350',
    low: '$31,950',
    volume: '12,000',
    time: '09:50',
  },
  {
    id: '5',
    name: 'Zinc',
    price: '$2,850',
    change: '+25',
    percentChange: '+0.88%',
    high: '$2,870',
    low: '$2,830',
    volume: '67,000',
    time: '10:05',
  },
  {
    id: '6',
    name: 'Lead',
    price: '$2,120',
    change: '-10',
    percentChange: '-0.47%',
    high: '$2,135',
    low: '$2,110',
    volume: '34,000',
    time: '09:55',
  },
];

const weeklyData: Commodity[] = [
  {
    id: '1',
    name: 'Copper',
    price: '$9,450',
    change: '+150',
    percentChange: '+1.61%',
    high: '$9,550',
    low: '$9,300',
    volume: '850,000',
    time: 'Weekly Avg',
  },
  {
    id: '2',
    name: 'Aluminium',
    price: '$2,440',
    change: '-20',
    percentChange: '-0.81%',
    high: '$2,470',
    low: '$2,420',
    volume: '620,000',
    time: 'Weekly Avg',
  },
  // Add more similar entries for consistency
  {
    id: '3',
    name: 'Nickel',
    price: '$18,100',
    change: '+500',
    percentChange: '+2.84%',
    high: '$18,400',
    low: '$17,600',
    volume: '320,000',
    time: 'Weekly Avg',
  },
  {
    id: '4',
    name: 'Tin',
    price: '$32,000',
    change: '-300',
    percentChange: '-0.93%',
    high: '$32,350',
    low: '$31,700',
    volume: '85,000',
    time: 'Weekly Avg',
  },
  {
    id: '5',
    name: 'Zinc',
    price: '$2,840',
    change: '+40',
    percentChange: '+1.43%',
    high: '$2,870',
    low: '$2,800',
    volume: '480,000',
    time: 'Weekly Avg',
  },
  {
    id: '6',
    name: 'Lead',
    price: '$2,115',
    change: '-15',
    percentChange: '-0.70%',
    high: '$2,135',
    low: '$2,100',
    volume: '240,000',
    time: 'Weekly Avg',
  },
];

const monthlyData: Commodity[] = [
  {
    id: '1',
    name: 'Copper',
    price: '$9,400',
    change: '+400',
    percentChange: '+4.44%',
    high: '$9,550',
    low: '$9,000',
    volume: '3,500,000',
    time: 'Monthly Avg',
  },
  {
    id: '2',
    name: 'Aluminium',
    price: '$2,430',
    change: '-50',
    percentChange: '-2.02%',
    high: '$2,500',
    low: '$2,400',
    volume: '2,800,000',
    time: 'Monthly Avg',
  },
  // Similar pattern
  {
    id: '3',
    name: 'Nickel',
    price: '$17,900',
    change: '+900',
    percentChange: '+5.30%',
    high: '$18,400',
    low: '$17,000',
    volume: '1,400,000',
    time: 'Monthly Avg',
  },
  {
    id: '4',
    name: 'Tin',
    price: '$31,800',
    change: '-800',
    percentChange: '-2.45%',
    high: '$32,800',
    low: '$31,000',
    volume: '380,000',
    time: 'Monthly Avg',
  },
  {
    id: '5',
    name: 'Zinc',
    price: '$2,820',
    change: '+120',
    percentChange: '+4.45%',
    high: '$2,870',
    low: '$2,700',
    volume: '2,100,000',
    time: 'Monthly Avg',
  },
  {
    id: '6',
    name: 'Lead',
    price: '$2,100',
    change: '-40',
    percentChange: '-1.87%',
    high: '$2,150',
    low: '$2,060',
    volume: '1,050,000',
    time: 'Monthly Avg',
  },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const data = activeTab === 'daily' ? dailyData : activeTab === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            LME Quotes
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Real-time and historical quotes for London Metal Exchange commodities. Switch between daily, weekly, and monthly views.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-3 inline-block">
            <span className="text-lg font-semibold">Live Market Data</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white shadow-xl rounded-2xl p-1 flex space-x-1 max-w-md w-full">
            {[
              { key: 'daily' as const, label: 'Daily' },
              { key: 'weekly' as const, label: 'Weekly' },
              { key: 'monthly' as const, label: 'Monthly' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Commodity</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">% Change</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">High</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Low</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((commodity) => (
                  <tr key={commodity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                      {commodity.name}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                      {commodity.price}
                    </td>
                    <td
                      className={`px-6 py-5 whitespace-nowrap text-sm text-right font-semibold ${
                        parseFloat(commodity.change) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {commodity.change}
                    </td>
                    <td
                      className={`px-6 py-5 whitespace-nowrap text-sm text-right font-semibold ${
                        parseFloat(commodity.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {commodity.percentChange}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 text-right">
                      {commodity.high}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 text-right">
                      {commodity.low}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 text-right">
                      {commodity.volume}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 text-right">
                      {commodity.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
