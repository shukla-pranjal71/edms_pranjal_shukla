
import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  innerRadius?: number;
  outerRadius?: number;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
}

export const DonutChart = ({ 
  data, 
  innerRadius = 60, 
  outerRadius = 80, 
  legendPosition = 'bottom' 
}: DonutChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value}`, name]}
          labelFormatter={() => ''}
        />
        <Legend layout={legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal'} 
                align={legendPosition === 'right' ? 'right' : legendPosition === 'left' ? 'left' : 'center'} 
                verticalAlign={legendPosition === 'top' ? 'top' : legendPosition === 'bottom' ? 'bottom' : 'middle'} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
