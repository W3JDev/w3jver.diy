import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// Type declaration for dynamic import that may not exist during development
declare const __BUILD_SERVER__: ServerBuild;

export const onRequest: PagesFunction = async (context) => {
  try {
    // Dynamic import with fallback for development
    const serverBuild = await import('../build/server').then(
      (module) => module as unknown as ServerBuild
    ).catch(() => {
      throw new Error('Build not available');
    });
    
    const handler = createPagesFunctionHandler({
      build: serverBuild,
    });
    
    return handler(context);
  } catch (error) {
    // During development, the build folder may not exist
    console.warn('Build folder not found, this is expected during development:', error);
    return new Response('Build not found - this function is for production deployment', {
      status: 503
    });
  }
};
