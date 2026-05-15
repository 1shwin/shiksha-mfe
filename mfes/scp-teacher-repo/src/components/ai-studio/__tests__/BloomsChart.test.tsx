import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BloomsChart from '../BloomsChart';

// Mock Recharts entirely to avoid SVG issues in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: ({ children }: any) => <div>{children}</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Cell: () => <div>Cell</div>,
  LabelList: () => <div>LabelList</div>,
}));

describe('BloomsChart', () => {
  const mockQuestions: any[] = [
    { id: '1', bloomsLevel: 'remember' },
    { id: '2', bloomsLevel: 'remember' },
    { id: '3', bloomsLevel: 'understand' },
    { id: '4', bloomsLevel: 'apply' },
  ];

  it('renders bars for each Bloom level present', () => {
    render(<BloomsChart questions={mockQuestions} />);
    expect(screen.getByText("Bloom's Taxonomy Distribution")).toBeInTheDocument();
    // Recharts renders text inside SVG
    expect(screen.getByText('Remember')).toBeInTheDocument();
    expect(screen.getByText('Understand')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('shows correct count labels', () => {
    render(<BloomsChart questions={mockQuestions} />);
    // Check for the counts (rendered as labels in the bar)
    expect(screen.getByText('2')).toBeInTheDocument(); // remember count
    expect(screen.getByText('1')).toBeInTheDocument(); // understand count
  });

  it('handles empty questions array gracefully', () => {
    render(<BloomsChart questions={[]} />);
    expect(screen.getByText('No questions generated yet')).toBeInTheDocument();
  });
});
