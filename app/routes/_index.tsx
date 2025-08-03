import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { ParticleSystem } from '~/components/ui/ParticleSystem';
import { useCommandPalette } from '~/components/ui/CommandPalette';

export const meta: MetaFunction = () => {
  return [
    { title: 'W3Jverse - Premium AI Full-Stack Development Platform' },
    {
      name: 'description',
      content:
        'W3Jverse - The most advanced, creative, fastest, and accurate premium AI full-stack application builder. Experience the future of development.',
    },
  ];
};

export const loader = () => json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  const { CommandPalette } = useCommandPalette();

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1 relative overflow-hidden">
      {/* Enhanced Background System */}
      <BackgroundRays />
      <ClientOnly fallback={null}>
        {() => <ParticleSystem particleCount={30} interactive={true} speed={0.8} />}
      </ClientOnly>

      {/* Command Palette */}
      <CommandPalette onCommand={(command) => console.log('Command executed:', command)} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
    </div>
  );
}
