import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassMorphismContainer } from './GlassMorphismContainer';
import { classNames } from '~/utils/classNames';

interface EnhancedVoiceInputProps {
  onTranscriptionUpdate: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  className?: string;
  autoStart?: boolean;
}

interface TranscriptionSegment {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export const EnhancedVoiceInput: React.FC<EnhancedVoiceInputProps> = ({
  onTranscriptionUpdate,
  onError,
  language = 'en-US',
  continuous = true,
  className = '',
  autoStart = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          stopVolumeAnalysis();
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcript;
              
              // Add to segments
              const newSegment: TranscriptionSegment = {
                text: transcript,
                confidence: result[0].confidence || 0,
                isFinal: true,
                timestamp: Date.now()
              };
              
              setSegments(prev => [...prev, newSegment]);
              setTranscription(prev => prev + transcript);
              onTranscriptionUpdate(finalTranscript, true);
            } else {
              interimTranscript += transcript;
            }
          }

          setInterimTranscription(interimTranscript);
          if (interimTranscript) {
            onTranscriptionUpdate(interimTranscript, false);
          }
        };

        recognition.onerror = (event) => {
          const errorMessage = `Speech recognition error: ${event.error}`;
          setError(errorMessage);
          onError?.(errorMessage);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language, continuous, onTranscriptionUpdate, onError]);

  // Audio volume analysis
  const startVolumeAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateVolume = () => {
        if (analyserRef.current && isListening) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setVolume(average / 255);
          
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };

      updateVolume();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone');
    }
  }, [isListening]);

  const stopVolumeAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setVolume(0);
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        startVolumeAnalysis();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Could not start speech recognition');
      }
    }
  }, [isListening, startVolumeAnalysis]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscription = () => {
    setTranscription('');
    setInterimTranscription('');
    setSegments([]);
  };

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isSupported) {
      startListening();
    }
  }, [autoStart, isSupported, startListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopVolumeAnalysis();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [stopVolumeAnalysis]);

  if (!isSupported) {
    return (
      <GlassMorphismContainer intensity="light" className={classNames('p-4', className)}>
        <div className="text-center text-white/70">
          <div className="i-ph:microphone-slash text-2xl mb-2" />
          <p>Speech recognition is not supported in your browser</p>
        </div>
      </GlassMorphismContainer>
    );
  }

  return (
    <div className={classNames('w-full', className)}>
      <GlassMorphismContainer
        intensity="medium"
        gradient={isListening}
        borderGlow={isListening}
        className="relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2">
            <motion.div
              className={classNames(
                'w-3 h-3 rounded-full',
                isListening ? 'bg-green-500' : 'bg-red-500'
              )}
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                opacity: isListening ? [1, 0.7, 1] : 1
              }}
              transition={{
                duration: 1,
                repeat: isListening ? Infinity : 0
              }}
            />
            <span className="text-sm font-medium text-white">
              {isListening ? 'Listening...' : 'Voice Input'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {segments.length > 0 && (
              <button
                onClick={clearTranscription}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
            <div className="text-xs text-white/60">
              {language.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="p-4">
          <div className="flex flex-col items-center gap-4">
            {/* Microphone Button with Volume Visualization */}
            <motion.button
              onClick={toggleListening}
              className={classNames(
                'relative w-20 h-20 rounded-full flex items-center justify-center',
                'transition-all duration-300',
                isListening
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-glow-green'
                  : 'bg-gradient-to-br from-w3j-primary-500 to-w3j-primary-600 hover:from-w3j-primary-400 hover:to-w3j-primary-500'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: isListening
                  ? `0 0 ${20 + volume * 30}px rgba(34, 197, 94, 0.5)`
                  : '0 0 0px rgba(34, 197, 94, 0)'
              }}
            >
              <div className={classNames(
                isListening ? 'i-ph:microphone' : 'i-ph:microphone',
                'text-2xl text-white'
              )} />
              
              {/* Volume rings */}
              {isListening && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-green-400/30"
                      animate={{
                        scale: [1, 1.5 + i * 0.3],
                        opacity: [0.6, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </>
              )}
            </motion.button>

            {/* Volume Level Indicator */}
            {isListening && (
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                  animate={{ width: `${volume * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Transcription Display */}
        <AnimatePresence>
          {(transcription || interimTranscription) && (
            <motion.div
              className="p-4 pt-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-white/5 rounded-lg p-4 max-h-32 overflow-y-auto modern-scrollbar">
                <div className="text-white text-sm leading-relaxed">
                  {transcription && (
                    <span className="text-white">{transcription}</span>
                  )}
                  {interimTranscription && (
                    <span className="text-white/60 italic">{interimTranscription}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="p-4 pt-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-300">
                  <div className="i-ph:warning text-lg" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassMorphismContainer>
    </div>
  );
};