import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { classNames } from '~/utils/classNames';

interface EnhancedImageUploadProps {
  onImagesSelected: (files: File[], dataUrls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizePerFile?: number; // in MB
  className?: string;
}

interface ImagePreview {
  file: File;
  dataUrl: string;
  id: string;
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onImagesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizePerFile = 10,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizePerFile}MB`;
    }
    return null;
  };

  const processFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const validDataUrls: string[] = [];
    const newPreviews: ImagePreview[] = [];

    if (previews.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        validFiles.push(file);
        validDataUrls.push(dataUrl);
        newPreviews.push({
          file,
          dataUrl,
          id: Math.random().toString(36).substr(2, 9)
        });
      } catch (error) {
        console.error('Error reading file:', error);
        setError('Error reading file');
      }
    }

    if (validFiles.length > 0) {
      setPreviews(prev => [...prev, ...newPreviews]);
      onImagesSelected(validFiles, validDataUrls);
      setError(null);
    }
  }, [previews.length, maxFiles, acceptedTypes, maxSizePerFile, onImagesSelected]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  };

  const removePreview = (id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    setPreviews([]);
    setError(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={classNames('w-full', className)}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <GlassMorphismContainer
          intensity="medium"
          gradient={isDragging}
          borderGlow={isDragging}
          className={classNames(
            'relative cursor-pointer transition-all duration-300',
            'border-2 border-dashed',
            isDragging
              ? 'border-w3j-primary-500 bg-w3j-primary-500/10'
              : 'border-white/30 hover:border-white/50'
          )}
          onClick={openFileDialog}
        >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            className={classNames(
              'i-ph:image text-4xl mb-4 transition-colors duration-300',
              isDragging ? 'text-w3j-primary-500' : 'text-white/60'
            )}
            animate={{
              scale: isDragging ? 1.1 : 1,
              rotate: isDragging ? [0, -5, 5, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          />
          <h3 className="text-lg font-medium text-white mb-2">
            {isDragging ? 'Drop images here' : 'Upload Images'}
          </h3>
          <p className="text-sm text-white/70 mb-4">
            Drag & drop images or click to browse
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-white/50">
            <span>Max {maxFiles} files</span>
            <span>•</span>
            <span>Up to {maxSizePerFile}MB each</span>
            <span>•</span>
            <span>JPG, PNG, GIF, WebP</span>
          </div>
        </div>

        {/* Animated background effect when dragging */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-w3j-primary-500/20 to-w3j-secondary-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </GlassMorphismContainer>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2 text-red-300">
              <div className="i-ph:warning text-lg" />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">
                Selected Images ({previews.length})
              </h4>
              <button
                onClick={clearAll}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {previews.map((preview, index) => (
                <motion.div
                  key={preview.id}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassMorphismContainer
                    intensity="light"
                    className="relative aspect-square overflow-hidden"
                  >
                    <img
                      src={preview.dataUrl}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePreview(preview.id);
                      }}
                      className={classNames(
                        'absolute top-2 right-2 w-6 h-6 rounded-full',
                        'bg-red-500/80 hover:bg-red-500 text-white',
                        'flex items-center justify-center transition-all duration-200',
                        'opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100'
                      )}
                    >
                      <div className="i-ph:x text-sm" />
                    </button>
                    
                    {/* File info overlay */}
                    <div className={classNames(
                      'absolute bottom-0 left-0 right-0 p-2',
                      'bg-gradient-to-t from-black/80 to-transparent',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                    )}>
                      <div className="text-xs text-white truncate">
                        {preview.file.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {(preview.file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  </GlassMorphismContainer>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};