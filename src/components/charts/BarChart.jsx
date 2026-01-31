import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BarChart = ({ data, dataKeys, xKey, title, stacked = false }) => {
  const colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data}>
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
          {dataKeys && dataKeys.length > 1 && <Legend />}
          {dataKeys ? (
            dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]}
                stackId={stacked ? 'stack' : undefined}
                radius={[8, 8, 0, 0]}
              />
            ))
          ) : (
            <Bar 
              dataKey="count" 
              fill="#10B981"
              radius={[8, 8, 0, 0]}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
