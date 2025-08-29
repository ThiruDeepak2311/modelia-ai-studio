import React from 'react';
import { render, screen } from '@testing-library/react';
import { UploadArea } from '../UploadArea';

// Mock the store
const mockActions = {
  setCurrentImage: jest.fn(),
  setUploadDragging: jest.fn(),
  setUploadProcessing: jest.fn(),
  setUploadError: jest.fn(),
};

jest.mock('@/lib/store', () => ({
  useModeliaStore: jest.fn(() => ({
    upload: {
      isDragging: false,
      isProcessing: false,
      currentImage: undefined,
      error: undefined,
    },
  })),
  useActions: jest.fn(() => mockActions),
}));

describe('UploadArea', () => {
  it('renders upload area correctly', () => {
    render(<UploadArea />);
    
    expect(screen.getByText('Upload an image')).toBeInTheDocument();
  });
});
