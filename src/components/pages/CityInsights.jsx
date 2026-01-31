import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../shared/Card';
import BarChart from '../charts/BarChart';
import { cityInsights } from '../../data/mockData';

const CityInsights = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy">City Insights</h2>
        <p className="text-sm text-gray-600 mt-1">Regional performance analysis and comparison</p>
      </div>

      {/* India Map Visual */}
      <Card className="p-8">
        <h3 className="text-lg font-bold text-navy mb-6 text-center">Regional Performance Map</h3>
        <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
          {/* Simplified India Map Representation */}
          <div className="relative w-full h-full">
            {cityInsights.map((city, index) => (
              <motion.div
                key={city.city}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, type: 'spring' }}
                className="absolute cursor-pointer group"
                style={{ left: `${city.coords.x}%`, top: `${city.coords.y}%` }}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg transform transition-transform group-hover:scale-110 ${
                    city.avgQAScore > city.companyAvg ? 'bg-teal' : 'bg-amber'
                  }`}>
                    {city.avgQAScore}%
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="text-sm font-bold text-navy">{city.city}</p>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-navy text-white p-4 rounded-lg shadow-xl min-w-[200px]">
                      <p className="font-bold mb-2">{city.city}</p>
                      <div className="text-xs space-y-1">
                        <p>QA Score: {city.avgQAScore}%</p>
                        <p>Call Volume: {city.callVolume.toLocaleString()}</p>
                        <p>Escalation: {city.escalationRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal rounded-full"></div>
            <span className="text-xs text-gray-600">Above Company Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber rounded-full"></div>
            <span className="text-xs text-gray-600">Below Company Average</span>
          </div>
        </div>
      </Card>

      {/* City Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cityInsights.map((city, index) => (
          <motion.div
            key={city.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy">{city.city}</h3>
                    <p className="text-xs text-gray-500">{city.callVolume.toLocaleString()} calls today</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  city.avgQAScore > city.companyAvg ? 'text-teal' : 'text-danger'
                }`}>
                  {city.avgQAScore > city.companyAvg ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(city.avgQAScore - city.companyAvg).toFixed(1)}%</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Avg QA Score</p>
                  <p className="text-2xl font-bold text-navy">{city.avgQAScore}%</p>
                  <p className="text-xs text-gray-500 mt-1">vs {city.companyAvg}% company avg</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Escalation Rate</p>
                  <p className="text-2xl font-bold text-navy">{city.escalationRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">of total calls</p>
                </div>
              </div>

              {/* Top Issues */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Top Issues</p>
                <div className="space-y-2">
                  {city.topIssues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber rounded-full"></div>
                      <span className="text-xs text-gray-600">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-6">City Performance Comparison</h3>
        <BarChart
          data={cityInsights.map(city => ({
            city: city.city,
            'QA Score': city.avgQAScore,
            'Company Avg': city.companyAvg
          }))}
          xKey="city"
          dataKeys={['QA Score', 'Company Avg']}
        />
      </Card>
    </motion.div>
  );
};

export default CityInsights;
