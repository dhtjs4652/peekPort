// src/components/CustomPieChart.jsx
import React, { useState, useEffect } from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';

// 활성 섹터 렌더링을 위한 컴포넌트
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { 
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value 
  } = props;
  
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
        {`${payload.name} (${(percent * 100).toFixed(1)}%)`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
        {`${value.toLocaleString()}원`}
      </text>
    </g>
  );
};

const CustomPieChart = ({ data, colors }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [animatedData, setAnimatedData] = useState([]);
  
  // 애니메이션 효과를 위한 데이터 초기화
  useEffect(() => {
    // 처음에는 모든 값이 0으로 시작
    setAnimatedData(data.map(item => ({ ...item, value: 0 })));
    
    // 약간의 지연 후 실제 데이터 값으로 변경
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [data]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsChart>
        <Pie
          data={animatedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          animationDuration={1500}
          animationBegin={300}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
        >
          {animatedData.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
              className="transition-all duration-300"
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => value.toLocaleString() + '원'} 
          contentStyle={{ 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: 20
          }}
          formatter={(value) => (
            <span style={{ color: '#333', fontWeight: 500 }}>
              {value}
            </span>
          )}
        />
      </RechartsChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;