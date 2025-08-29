import React from 'react';
import { render, screen } from '@testing-library/react';
import { HistoryPanel } from '../HistoryPanel';

const mockActions = {
  selectHistoryItem: jest.fn(),
  removeFromHistory: jest.fn(),
  toggleFavorite: jest.fn(),
  clearAllHistory: jest.fn(),
};

const mockHistoryItem = {
  id: 'test-1',
  imageUrl: 'test.jpg',
  thumbnail: 'thumb.jpg',
  prompt: 'Test prompt',
  style: 'editorial' as const,
  createdAt: '2023-01-01',
  isFavorite: false,
};

const mockState = {
  history: {
    items: [mockHistoryItem],
    currentItem: undefined,
  },
  actions: mockActions,
};

jest.mock('@/lib/store', () => ({
  useModeliaStore: jest.fn((selector) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }),
  useActions: jest.fn(() => mockActions),
}));

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  formatRelativeTime: jest.fn(() => '2h ago'),
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('HistoryPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders history items', () => {
    render(<HistoryPanel />);
    
    expect(screen.getByText('History (1/5)')).toBeInTheDocument();
    expect(screen.getByText('Test prompt')).toBeInTheDocument();
  });
});