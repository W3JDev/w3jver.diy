import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickActionsFAB, VoiceInputFAB, CameraCaptureFAB, FileUploadFAB } from './FloatingActionButton';
import { classNames } from '~/utils/classNames';

interface FloatingActionMenuProps {
  onVoiceToggle: () => void;
  onCameraCapture: () => void;
  onFileUpload: () => void;
  isVoiceListening: boolean;
  uploadedFilesCount?: number;
  className?: string;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  onVoiceToggle,
  onCameraCapture,
  onFileUpload,
  isVoiceListening,
  uploadedFilesCount = 0,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      component: (
        <VoiceInputFAB
          key="voice"
          isListening={isVoiceListening}
          onToggle={onVoiceToggle}
        />
      ),
      delay: 0.1
    },
    {
      component: (
        <CameraCaptureFAB
          key="camera"
          onClick={onCameraCapture}
        />
      ),
      delay: 0.15
    },
    {
      component: (
        <FileUploadFAB
          key="file"
          onClick={onFileUpload}
          badge={uploadedFilesCount > 0 ? uploadedFilesCount : undefined}
        />
      ),
      delay: 0.2
    }
  ];

  return (
    <div className={classNames(
      'fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3',
      className
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ 
                  delay: item.delay,
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 300
                }}
              >
                {item.component}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <QuickActionsFAB onMenuToggle={toggleMenu} isOpen={isOpen} />
      
      {/* Background overlay when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Alternative compact horizontal menu
export const CompactFloatingMenu: React.FC<FloatingActionMenuProps> = ({
  onVoiceToggle,
  onCameraCapture,
  onFileUpload,
  isVoiceListening,
  uploadedFilesCount = 0,
  className = ''
}) => {
  return (
    <motion.div
      className={classNames(
        'flex items-center gap-2 p-2 rounded-full',
        'bg-white/10 backdrop-blur-md border border-white/20',
        'shadow-2xl',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VoiceInputFAB
        isListening={isVoiceListening}
        onToggle={onVoiceToggle}
      />
      <CameraCaptureFAB onClick={onCameraCapture} />
      <FileUploadFAB
        onClick={onFileUpload}
        badge={uploadedFilesCount > 0 ? uploadedFilesCount : undefined}
      />
    </motion.div>
  );
};