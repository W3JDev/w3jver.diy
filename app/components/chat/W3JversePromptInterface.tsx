import React, { useState, useRef, useEffect } from 'react';
import { HolographicParticles } from '~/components/ui/HolographicParticles';
import { IconButton } from '~/components/ui/IconButton';
import { 
  MicrophoneIcon, 
  PhotoIcon, 
  DocumentIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CodeBracketIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface AutocompleteItem {
  id: string;
  text: string;
  icon?: React.ReactNode;
  category: 'component' | 'application' | 'feature' | 'style';
}

interface W3JversePromptInterfaceProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onImageUpload?: (files: File[]) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isLoading?: boolean;
  isListening?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const W3JversePromptInterface: React.FC<W3JversePromptInterfaceProps> = ({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  onImageUpload,
  onVoiceStart,
  onVoiceStop,
  isLoading = false,
  isListening = false,
  placeholder = "✨ Ask W3Jverse AI to create anything...",
  maxLength = 4000
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const suggestions: AutocompleteItem[] = [
    { id: '1', text: 'Create a React component', icon: <CodeBracketIcon className="w-4 h-4" />, category: 'component' },
    { id: '2', text: 'Build a Next.js application', icon: <GlobeAltIcon className="w-4 h-4" />, category: 'application' },
    { id: '3', text: 'Design a landing page', icon: <SparklesIcon className="w-4 h-4" />, category: 'feature' },
    { id: '4', text: 'Create a dashboard interface', icon: <CodeBracketIcon className="w-4 h-4" />, category: 'component' },
    { id: '5', text: 'Build an e-commerce site', icon: <GlobeAltIcon className="w-4 h-4" />, category: 'application' },
    { id: '6', text: 'Add dark mode toggle', icon: <SparklesIcon className="w-4 h-4" />, category: 'feature' },
    { id: '7', text: 'Create responsive navigation', icon: <CodeBracketIcon className="w-4 h-4" />, category: 'component' },
    { id: '8', text: 'Build a blog with CMS', icon: <GlobeAltIcon className="w-4 h-4" />, category: 'application' },
    { id: '9', text: 'Add user authentication', icon: <SparklesIcon className="w-4 h-4" />, category: 'feature' },
    { id: '10', text: 'Create animated components', icon: <CodeBracketIcon className="w-4 h-4" />, category: 'component' },
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle autocomplete
  useEffect(() => {
    if (value.length >= 3) {
      const filtered = suggestions.filter(item =>
        item.text.toLowerCase().includes(value.toLowerCase())
      );
      setAutocompleteItems(filtered.slice(0, 5));
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
      setAutocompleteItems([]);
    }
    setSelectedIndex(-1);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutocomplete && autocompleteItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < autocompleteItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteItems.length - 1
        );
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        selectAutocompleteItem(autocompleteItems[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showAutocomplete) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectAutocompleteItem = (item: AutocompleteItem) => {
    onChange(item.text);
    setShowAutocomplete(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onImageUpload) {
      onImageUpload(files);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  };

  return (
    <div className="w3j-prompt-container w3j-glass-morphism" data-testid="w3j-prompt-container">
      <HolographicParticles count={30} />
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w3j-prompt-input"
          data-testid="chat-input"
          maxLength={maxLength}
          disabled={isLoading}
          rows={1}
        />
        
        {/* Character Counter */}
        <div className="text-right text-xs mt-2 opacity-60">
          {value.length}/{maxLength}
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && autocompleteItems.length > 0 && (
          <div className="w3j-autocomplete" data-testid="auto-complete-suggestions">
            {autocompleteItems.map((item, index) => (
              <div
                key={item.id}
                className={`w3j-autocomplete-item ${
                  index === selectedIndex ? 'bg-opacity-30' : ''
                }`}
                onClick={() => selectAutocompleteItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.text}</span>
                  <span className="text-xs opacity-60 ml-auto">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="w3j-input-controls">
        {/* File Upload */}
        <div className="w3j-file-upload">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.js,.jsx,.ts,.tsx,.json,.css,.html,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt"
            onChange={handleFileChange}
            data-testid="file-upload"
          />
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            className="w3j-icon-button"
            title="Upload files"
          >
            <DocumentIcon className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Image Upload */}
        <div className="w3j-file-upload">
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            data-testid="image-upload"
          />
          <IconButton
            onClick={() => imageInputRef.current?.click()}
            className="w3j-icon-button"
            title="Upload images"
          >
            <PhotoIcon className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Voice Input */}
        <IconButton
          onClick={handleVoiceToggle}
          className={`w3j-icon-button ${isListening ? 'w3j-voice-active' : ''}`}
          title={isListening ? "Stop recording" : "Start voice input"}
          data-testid="voice-input"
        >
          <MicrophoneIcon className="w-5 h-5" />
        </IconButton>

        {/* Deployment Buttons */}
        <div className="w3j-deploy-buttons ml-auto">
          <button 
            className="w3j-deploy-button"
            data-testid="deploy-vercel"
            title="Deploy to Vercel"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2z"/>
            </svg>
            Vercel
          </button>
          
          <button 
            className="w3j-deploy-button"
            data-testid="deploy-netlify"
            title="Deploy to Netlify"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L0 8v8l12 8 12-8V8L12 0z"/>
            </svg>
            Netlify
          </button>
          
          <button 
            className="w3j-deploy-button"
            data-testid="deploy-railway"
            title="Deploy to Railway"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 12h20l-8-8v6H2v2z"/>
            </svg>
            Railway
          </button>
        </div>

        {/* Send Button */}
        <IconButton
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={`w3j-send-button ${isLoading ? 'opacity-50' : ''}`}
          title="Send message"
          data-testid="send-button"
        >
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </IconButton>
      </div>
    </div>
  );
};