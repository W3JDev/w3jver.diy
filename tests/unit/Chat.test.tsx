import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { BaseChat } from '~/components/chat/BaseChat';

describe('W3Jverse AI Chat Interface', () => {
  test('should load with W3Jverse branding', async () => {
    render(<BaseChat />);
    
    // Verify W3Jverse branding elements are present
    expect(screen.getByTestId('w3jverse-logo')).toBeInTheDocument();
    expect(screen.getByText(/W3Jverse/i)).toBeInTheDocument();
    
    // Ensure no bolt.diy branding remains
    expect(screen.queryByText(/bolt\.diy/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bolt\.new/i)).not.toBeInTheDocument();
  });

  test('should connect to all 18 AI models', async () => {
    render(<ModelSelector />);
    
    const modelSelector = screen.getByRole('combobox', { name: /model/i });
    fireEvent.click(modelSelector);
    
    // Verify all 18 AI models are available
    const expectedModels = [
      'gemini-2.0-flash-exp',
      'deepseek-v3',
      'meta-llama/Llama-3.3-70B',
      'claude-3-5-sonnet-20241022',
      'gpt-4o',
      'grok-2-1212',
      'command-r-plus',
      'qwen2.5-72b-instruct',
      'mistral-large-2411',
      'perplexity-llama-3.1-sonar-large-128k-online',
      'o1-mini',
      'cohere/command-r7b-12-2024',
      'anthropic/claude-3-5-haiku:beta',
      'google/gemini-pro-1.5',
      'openai/gpt-4-turbo',
      'meta-llama/llama-3.1-8b-instruct',
      'microsoft/phi-3-medium-4k-instruct',
      'huggingface/starcoder2-15b'
    ];

    for (const modelName of expectedModels) {
      expect(screen.getByText(new RegExp(modelName, 'i'))).toBeInTheDocument();
    }
  });

  test('should generate code under 2 seconds', async () => {
    const mockResponse = { content: 'Generated code', timing: 1800 };
    vi.fn().mockResolvedValue(mockResponse);

    render(<BaseChat />);
    
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    const startTime = Date.now();
    
    fireEvent.change(input, { target: { value: 'Create a React component' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Generated code/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(2000);
  });

  test('should display W3Jverse premium interface elements', () => {
    render(<BaseChat />);
    
    // Check for glass morphism container
    const chatContainer = screen.getByTestId('w3j-prompt-container');
    expect(chatContainer).toHaveClass('w3j-glass-morphism');
    
    // Check for holographic particles
    const particles = screen.getByTestId('w3j-holographic-particles');
    expect(particles).toBeInTheDocument();
    
    // Check for W3Jverse color scheme
    const themeElements = screen.getAllByTestId(/w3j-theme/);
    expect(themeElements.length).toBeGreaterThan(0);
  });

  test('should handle multimodal input', async () => {
    render(<BaseChat />);
    
    // Test text input
    const textInput = screen.getByPlaceholderText(/message/i);
    expect(textInput).toBeInTheDocument();
    
    // Test file upload
    const fileInput = screen.getByTestId('file-upload');
    expect(fileInput).toBeInTheDocument();
    
    // Test voice input
    const voiceButton = screen.getByTestId('voice-input');
    expect(voiceButton).toBeInTheDocument();
    
    // Test image input
    const imageUpload = screen.getByTestId('image-upload');
    expect(imageUpload).toBeInTheDocument();
  });

  test('should show auto-complete suggestions', async () => {
    render(<BaseChat />);
    
    const input = screen.getByPlaceholderText(/message/i);
    fireEvent.change(input, { target: { value: 'Create a' } });
    
    await waitFor(() => {
      const suggestions = screen.getByTestId('auto-complete-suggestions');
      expect(suggestions).toBeInTheDocument();
    });
    
    // Check for smart suggestions
    expect(screen.getByText(/React component/i)).toBeInTheDocument();
    expect(screen.getByText(/Vue application/i)).toBeInTheDocument();
    expect(screen.getByText(/Angular service/i)).toBeInTheDocument();
  });

  test('should handle deployment integration', () => {
    render(<BaseChat />);
    
    // Check for deployment buttons
    const vercelBtn = screen.getByTestId('deploy-vercel');
    const netlifyBtn = screen.getByTestId('deploy-netlify');
    const railwayBtn = screen.getByTestId('deploy-railway');
    
    expect(vercelBtn).toBeInTheDocument();
    expect(netlifyBtn).toBeInTheDocument();
    expect(railwayBtn).toBeInTheDocument();
  });

  test('should maintain conversation context', async () => {
    render(<BaseChat />);
    
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Send first message
    fireEvent.change(input, { target: { value: 'Create a todo app' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
    });
    
    // Send follow-up message
    fireEvent.change(input, { target: { value: 'Add dark mode to it' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('message-2')).toBeInTheDocument();
    });
    
    // Verify context is maintained
    const conversationHistory = screen.getByTestId('conversation-history');
    expect(conversationHistory).toHaveTextContent(/todo app/i);
    expect(conversationHistory).toHaveTextContent(/dark mode/i);
  });
});