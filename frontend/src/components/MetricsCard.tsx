import React from 'react';

interface Props {
  title: string;
  value: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
};

export default function MetricsCard({ title, value, color = 'blue' }: Props) {
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} shadow-sm`}>
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}