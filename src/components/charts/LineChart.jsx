import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, dataKey, xKey, title }) => {
  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey={xKey} 
            stroke="#6B7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6B7280" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
