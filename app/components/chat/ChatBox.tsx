import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { APIKeyManager } from './APIKeyManager';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { IconButton } from '~/components/ui/IconButton';
import { AgentStatusIndicator } from '~/components/ui/AgentStatusIndicator';
import { toast } from 'react-toastify';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { SupabaseConnection } from './SupabaseConnection';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import { GlassMorphismContainer } from '~/components/ui/GlassMorphismContainer';
import styles from './BaseChat.module.scss';
import type { ProviderInfo } from '~/types/model';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import type { AgentType } from '~/types/agents';
import { McpTools } from './MCPTools';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
  selectedAgent?: AgentType;
  onOpenAgentSelector?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  return (
    <GlassMorphismContainer
      intensity="heavy"
      gradient={true}
      shadow={true}
      borderGlow={true}
      className={classNames(
        'relative p-3 w-full max-w-chat mx-auto z-prompt animate-fade-in',
        'hover:shadow-glow transition-all duration-300',
      )}
    >
      {/* Enhanced SVG Effects for W3Jverse */}
      <svg className={classNames(styles.PromptEffectContainer)}>
        <defs>
          <linearGradient
            id="w3j-line-gradient"
            x1="20%"
            y1="0%"
            x2="-14%"
            y2="10%"
            gradientUnits="userSpaceOnUse"
            gradientTransform="rotate(-45)"
          >
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#FF6B35" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#1E90FF" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="#6A0DAD" stopOpacity="0%"></stop>
          </linearGradient>
          <linearGradient id="w3j-shine-gradient">
            <stop offset="0%" stopColor="white" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#FFD700" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="white" stopOpacity="0%"></stop>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          className={classNames(styles.PromptEffectLine)}
          pathLength="100"
          strokeLinecap="round"
          stroke="url(#w3j-line-gradient)"
          filter="url(#glow)"
        />
        <rect
          className={classNames(styles.PromptShine)}
          x="48"
          y="24"
          width="70"
          height="1"
          fill="url(#w3j-shine-gradient)"
        />
      </svg>
      <div>
        <ClientOnly>
          {() => (
            <div className={props.isModelSettingsCollapsed ? 'hidden' : ''}>
              <ModelSelector
                key={props.provider?.name + ':' + props.modelList.length}
                model={props.model}
                setModel={props.setModel}
                modelList={props.modelList}
                provider={props.provider}
                setProvider={props.setProvider}
                providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                apiKeys={props.apiKeys}
                modelLoading={props.isModelLoading}
              />
              {(props.providerList || []).length > 0 &&
                props.provider &&
                (!LOCAL_PROVIDERS.includes(props.provider.name) || 'OpenAILike') && (
                  <APIKeyManager
                    provider={props.provider}
                    apiKey={props.apiKeys[props.provider.name] || ''}
                    setApiKey={(key) => {
                      props.onApiKeysChange(props.provider.name, key);
                    }}
                  />
                )}
            </div>
          )}
        </ClientOnly>
      </div>
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />
      <ClientOnly>
        {() => (
          <ScreenshotStateManager
            setUploadedFiles={props.setUploadedFiles}
            setImageDataList={props.setImageDataList}
            uploadedFiles={props.uploadedFiles}
            imageDataList={props.imageDataList}
          />
        )}
      </ClientOnly>
      {props.selectedElement && (
        <div className="flex mx-1.5 gap-2 items-center justify-between rounded-lg rounded-b-none border border-b-none border-bolt-elements-borderColor text-bolt-elements-textPrimary flex py-1 px-2.5 font-medium text-xs">
          <div className="flex gap-2 items-center lowercase">
            <code className="bg-accent-500 rounded-4px px-1.5 py-1 mr-0.5 text-white">
              {props?.selectedElement?.tagName}
            </code>
            selected for inspection
          </div>
          <button
            className="bg-transparent text-accent-500 pointer-auto"
            onClick={() => props.setSelectedElement?.(null)}
          >
            Clear
          </button>
        </div>
      )}
      <div
        className={classNames(
          'relative shadow-xs border border-white/20 backdrop-blur-md rounded-xl overflow-hidden',
          'bg-gradient-to-br from-white/5 to-white/10',
          'hover:from-white/10 hover:to-white/15 transition-all duration-300',
        )}
      >
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
            'transition-all duration-300 ease-out',
            'hover:placeholder-white/70 focus:placeholder-white/50',
            'focus:ring-2 focus:ring-w3j-primary-500/30 focus:border-w3j-primary-500/50',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #1488fc';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #1488fc';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const base64Image = e.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              // ignore if using input method engine
              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder={
            props.chatMode === 'build'
              ? '🚀 What would you like to build with W3Jverse today?'
              : '💬 What would you like to discuss?'
          }
          translate="no"
        />
        <ClientOnly>
          {() => (
            <SendButton
              show={props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0}
              isStreaming={props.isStreaming}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={(event) => {
                if (props.isStreaming) {
                  props.handleStop?.();
                  return;
                }

                if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                  props.handleSendMessage?.(event);
                }
              }}
            />
          )}
        </ClientOnly>
        <div className="flex justify-between items-center text-sm p-4 pt-2">
          <div className="flex gap-1 items-center">
            {/* Agent Status Indicator */}
            {props.selectedAgent && props.onOpenAgentSelector && (
              <AgentStatusIndicator
                selectedAgent={props.selectedAgent}
                onOpenAgentSelector={props.onOpenAgentSelector}
                className="mr-2"
              />
            )}
            
            <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
            <McpTools />
            <IconButton
              title="Upload file"
              className="transition-all hover:bg-w3j-primary-500/20 hover:text-w3j-primary-300"
              onClick={() => props.handleFileUpload()}
            >
              <div className="i-ph:paperclip text-xl"></div>
            </IconButton>
            <IconButton
              title="Enhance prompt"
              disabled={props.input.length === 0 || props.enhancingPrompt}
              className={classNames(
                'transition-all hover:bg-w3j-accent-500/20 hover:text-w3j-accent-300',
                props.enhancingPrompt ? 'opacity-100 animate-glow' : '',
              )}
              onClick={() => {
                props.enhancePrompt?.();
                toast.success('✨ Prompt enhanced!');
              }}
            >
              {props.enhancingPrompt ? (
                <div className="i-svg-spinners:90-ring-with-bg text-w3j-accent-500 text-xl animate-spin"></div>
              ) : (
                <div className="i-bolt:stars text-xl"></div>
              )}
            </IconButton>

            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />
            {props.chatStarted && (
              <IconButton
                title="Discussion Mode"
                className={classNames(
                  'transition-all flex items-center gap-1 px-1.5 rounded-lg',
                  props.chatMode === 'discuss'
                    ? 'bg-w3j-secondary-500/20 text-w3j-secondary-300 shadow-glow-blue'
                    : 'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault hover:bg-w3j-secondary-500/10',
                )}
                onClick={() => {
                  props.setChatMode?.(props.chatMode === 'discuss' ? 'build' : 'discuss');
                }}
              >
                <div className={`i-ph:chats text-xl`} />
                {props.chatMode === 'discuss' ? <span className="text-xs font-medium">Discuss</span> : <span />}
              </IconButton>
            )}
            <IconButton
              title="Model Settings"
              className={classNames('transition-all flex items-center gap-1 rounded-lg', {
                'bg-w3j-royal-500/20 text-w3j-royal-300 shadow-glow-purple': props.isModelSettingsCollapsed,
                'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault hover:bg-w3j-royal-500/10':
                  !props.isModelSettingsCollapsed,
              })}
              onClick={() => props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed)}
              disabled={!props.providerList || props.providerList.length === 0}
            >
              <div className={`i-ph:caret-${props.isModelSettingsCollapsed ? 'right' : 'down'} text-lg`} />
              {props.isModelSettingsCollapsed ? (
                <span className="text-xs font-medium px-1">{props.model}</span>
              ) : (
                <span />
              )}
            </IconButton>
          </div>
          {props.input.length > 3 ? (
            <div className="text-xs text-bolt-elements-textTertiary opacity-80">
              Use <kbd className="kdb px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Shift</kbd> +{' '}
              <kbd className="kdb px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Return</kbd> for new line
            </div>
          ) : null}
          <SupabaseConnection />
          <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
        </div>
      </div>
    </GlassMorphismContainer>
  );
};
