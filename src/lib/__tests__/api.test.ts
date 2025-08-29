import { generateImage } from '../api';
import { GenerationRequest } from '@/types';

// Mock utils to control randomness
jest.mock('../utils', () => ({
  delay: jest.fn(() => Promise.resolve()),
  randomId: jest.fn(() => 'test-id'),
  randomChoice: jest.fn(() => 'https://example.com/test.jpg'),
  MOCK_GENERATED_IMAGES: ['https://example.com/test.jpg']
}));

describe('generateImage', () => {
  let mathSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mathSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    mathSpy.mockRestore();
  });

  it('should generate image successfully', async () => {
    const request: GenerationRequest = {
      imageDataUrl: 'data:image/jpeg;base64,test',
      prompt: 'Test prompt',
      style: 'editorial',
    };

    const result = await generateImage(request);

    expect(result.prompt).toBe('Test prompt');
    expect(result.style).toBe('editorial');
    expect(result.id).toBe('test-id');
  });
});