import { createElement, Fragment } from 'react';

function ChartStub({ children }) {
  return createElement('div', { 'data-testid': 'recharts-stub' }, children);
}

const Null = () => null;

export const ResponsiveContainer = ({ children }) => createElement(Fragment, null, children);
export const LineChart = ChartStub;
export const AreaChart = ChartStub;
export const BarChart = ChartStub;
export const Line = Null;
export const Area = Null;
export const Bar = Null;
export const Cell = Null;
export const XAxis = Null;
export const YAxis = Null;
export const Tooltip = Null;
export const CartesianGrid = Null;
