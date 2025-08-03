import type { ProjectContext, AgentType, AgentSelection } from '~/types/agents';
import { getAllAgents, getAgentByType } from './agent-definitions';

export class AgentRouter {
  private static instance: AgentRouter;

  public static getInstance(): AgentRouter {
    if (!AgentRouter.instance) {
      AgentRouter.instance = new AgentRouter();
    }
    return AgentRouter.instance;
  }

  /**
   * Analyze project context from files and user request
   */
  analyzeProjectContext(files: { [path: string]: string }, userRequest: string): ProjectContext {
    const allFiles = Object.keys(files);
    const fileContents = Object.values(files).join('\n').toLowerCase();
    
    // Detect project type
    const projectType = this.detectProjectType(allFiles, fileContents);
    
    // Extract technologies and frameworks
    const technologies = this.extractTechnologies(allFiles, fileContents);
    const frameworks = this.extractFrameworks(allFiles, fileContents);
    
    // Analyze project structure
    const dependencies = this.extractDependencies(files);
    const hasTests = this.hasTestFiles(allFiles);
    const hasDatabase = this.hasDatabaseFiles(allFiles, fileContents);
    const hasDocker = this.hasDockerFiles(allFiles);
    const hasCI = this.hasCIFiles(allFiles);

    return {
      type: projectType,
      technologies,
      frameworks,
      files,
      dependencies,
      hasTests,
      hasDatabase,
      hasDocker,
      hasCI
    };
  }

  /**
   * Select the best agent based on project context and user request
   */
  selectAgent(context: ProjectContext, userRequest: string): AgentSelection {
    const requestLower = userRequest.toLowerCase();
    const scores: { [key in AgentType]: number } = {
      'frontend-specialist': 0,
      'backend-architect': 0,
      'database-master': 0,
      'devops-commander': 0,
      'design-guru': 0,
      'performance-optimizer': 0,
      'testing-specialist': 0,
      'general': 0.5 // Base score for general agent
    };

    // Score based on project type
    this.scoreByProjectType(scores, context.type);
    
    // Score based on technologies and frameworks
    this.scoreByTechnologies(scores, context.technologies, context.frameworks);
    
    // Score based on user request content
    this.scoreByUserRequest(scores, requestLower);
    
    // Score based on project features
    this.scoreByProjectFeatures(scores, context);

    // Find the agent with the highest score
    const sortedAgents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([agentType, score]) => ({ agentType: agentType as AgentType, score }));

    const selectedAgent = sortedAgents[0];
    const suggestedAgents = sortedAgents
      .slice(1, 4)
      .filter(({ score }) => score > 0.3)
      .map(({ agentType }) => agentType);

    return {
      selectedAgent: selectedAgent.agentType,
      confidence: Math.min(selectedAgent.score, 1.0),
      reasoning: this.generateReasoningText(selectedAgent.agentType, context, userRequest),
      suggestedAgents
    };
  }

  private detectProjectType(files: string[], content: string): ProjectContext['type'] {
    // Frontend indicators
    const frontendFiles = files.filter(f => 
      f.includes('src/components') || 
      f.includes('pages/') || 
      f.includes('.tsx') || 
      f.includes('.vue') || 
      f.includes('.svelte')
    );

    // Backend indicators
    const backendFiles = files.filter(f => 
      f.includes('api/') || 
      f.includes('server/') || 
      f.includes('routes/') ||
      f.includes('controllers/') ||
      f.includes('models/')
    );

    // Database indicators
    const databaseFiles = files.filter(f => 
      f.includes('migrations/') || 
      f.includes('schema') || 
      f.includes('.sql') ||
      f.includes('database/')
    );

    // DevOps indicators
    const devopsFiles = files.filter(f => 
      f.includes('Dockerfile') || 
      f.includes('docker-compose') || 
      f.includes('.yml') ||
      f.includes('k8s/') ||
      f.includes('.github/workflows/')
    );

    if (frontendFiles.length > 0 && backendFiles.length > 0) {
      return 'fullstack';
    } else if (frontendFiles.length > 0) {
      return 'frontend';
    } else if (backendFiles.length > 0) {
      return 'backend';
    } else if (databaseFiles.length > 0) {
      return 'database';
    } else if (devopsFiles.length > 0) {
      return 'devops';
    } else if (content.includes('design') || content.includes('ui') || content.includes('ux')) {
      return 'design';
    }

    return 'unknown';
  }

  private extractTechnologies(files: string[], content: string): string[] {
    const technologies: string[] = [];
    
    // Language detection
    if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
      technologies.push('TypeScript');
    }
    if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) {
      technologies.push('JavaScript');
    }
    if (files.some(f => f.endsWith('.py'))) {
      technologies.push('Python');
    }
    if (files.some(f => f.endsWith('.go'))) {
      technologies.push('Go');
    }
    if (files.some(f => f.endsWith('.rs'))) {
      technologies.push('Rust');
    }

    // Frontend technologies
    if (content.includes('react')) technologies.push('React');
    if (content.includes('vue')) technologies.push('Vue');
    if (content.includes('svelte')) technologies.push('Svelte');
    if (content.includes('angular')) technologies.push('Angular');

    // Backend technologies
    if (content.includes('express')) technologies.push('Express');
    if (content.includes('fastify')) technologies.push('Fastify');
    if (content.includes('next')) technologies.push('Next.js');
    if (content.includes('nuxt')) technologies.push('Nuxt');

    // Databases
    if (content.includes('postgresql') || content.includes('postgres')) technologies.push('PostgreSQL');
    if (content.includes('mysql')) technologies.push('MySQL');
    if (content.includes('mongodb')) technologies.push('MongoDB');
    if (content.includes('redis')) technologies.push('Redis');

    return [...new Set(technologies)];
  }

  private extractFrameworks(files: string[], content: string): string[] {
    const frameworks: string[] = [];
    
    if (content.includes('remix')) frameworks.push('Remix');
    if (content.includes('nextjs') || content.includes('next.js')) frameworks.push('Next.js');
    if (content.includes('nuxtjs') || content.includes('nuxt.js')) frameworks.push('Nuxt.js');
    if (content.includes('sveltekit')) frameworks.push('SvelteKit');
    if (content.includes('astro')) frameworks.push('Astro');
    if (content.includes('gatsby')) frameworks.push('Gatsby');
    
    // Backend frameworks
    if (content.includes('fastapi')) frameworks.push('FastAPI');
    if (content.includes('django')) frameworks.push('Django');
    if (content.includes('flask')) frameworks.push('Flask');
    if (content.includes('gin')) frameworks.push('Gin');
    if (content.includes('echo')) frameworks.push('Echo');

    return [...new Set(frameworks)];
  }

  private extractDependencies(files: { [path: string]: string }): string[] {
    const dependencies: string[] = [];
    
    // Check package.json
    const packageJson = files['package.json'];
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson);
        dependencies.push(...Object.keys(pkg.dependencies || {}));
        dependencies.push(...Object.keys(pkg.devDependencies || {}));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Check requirements.txt
    const requirements = files['requirements.txt'];
    if (requirements) {
      const deps = requirements.split('\n')
        .map(line => line.trim().split('==')[0].split('>=')[0].split('<=')[0])
        .filter(dep => dep && !dep.startsWith('#'));
      dependencies.push(...deps);
    }

    // Check go.mod
    const goMod = files['go.mod'];
    if (goMod) {
      const deps = goMod.match(/require\s+([^\s]+)/g) || [];
      dependencies.push(...deps.map(dep => dep.replace('require ', '')));
    }

    return [...new Set(dependencies)];
  }

  private hasTestFiles(files: string[]): boolean {
    return files.some(f => 
      f.includes('test') || 
      f.includes('spec') || 
      f.includes('__tests__') ||
      f.endsWith('.test.ts') ||
      f.endsWith('.test.js') ||
      f.endsWith('.spec.ts') ||
      f.endsWith('.spec.js')
    );
  }

  private hasDatabaseFiles(files: string[], content: string): boolean {
    return files.some(f => 
      f.includes('migration') || 
      f.includes('schema') || 
      f.endsWith('.sql')
    ) || content.includes('database') || content.includes('db');
  }

  private hasDockerFiles(files: string[]): boolean {
    return files.some(f => 
      f.includes('Dockerfile') || 
      f.includes('docker-compose') ||
      f.includes('.dockerignore')
    );
  }

  private hasCIFiles(files: string[]): boolean {
    return files.some(f => 
      f.includes('.github/workflows/') || 
      f.includes('.gitlab-ci.yml') ||
      f.includes('jenkins') ||
      f.includes('circleci')
    );
  }

  private scoreByProjectType(scores: { [key in AgentType]: number }, projectType: ProjectContext['type']) {
    switch (projectType) {
      case 'frontend':
        scores['frontend-specialist'] += 0.8;
        scores['design-guru'] += 0.4;
        scores['performance-optimizer'] += 0.3;
        break;
      case 'backend':
        scores['backend-architect'] += 0.8;
        scores['database-master'] += 0.4;
        scores['performance-optimizer'] += 0.3;
        break;
      case 'fullstack':
        scores['frontend-specialist'] += 0.5;
        scores['backend-architect'] += 0.5;
        scores['database-master'] += 0.3;
        break;
      case 'database':
        scores['database-master'] += 0.8;
        scores['backend-architect'] += 0.4;
        break;
      case 'devops':
        scores['devops-commander'] += 0.8;
        scores['backend-architect'] += 0.3;
        break;
      case 'design':
        scores['design-guru'] += 0.8;
        scores['frontend-specialist'] += 0.4;
        break;
    }
  }

  private scoreByTechnologies(scores: { [key in AgentType]: number }, technologies: string[], frameworks: string[]) {
    const allTech = [...technologies, ...frameworks].map(t => t.toLowerCase());

    // Frontend technologies
    if (allTech.some(t => ['react', 'vue', 'svelte', 'angular'].includes(t))) {
      scores['frontend-specialist'] += 0.6;
    }

    // Backend technologies
    if (allTech.some(t => ['express', 'fastapi', 'django', 'gin', 'echo', 'node'].includes(t))) {
      scores['backend-architect'] += 0.6;
    }

    // Database technologies
    if (allTech.some(t => ['postgresql', 'mysql', 'mongodb', 'redis'].includes(t))) {
      scores['database-master'] += 0.6;
    }

    // DevOps technologies
    if (allTech.some(t => ['docker', 'kubernetes', 'k8s'].includes(t))) {
      scores['devops-commander'] += 0.6;
    }
  }

  private scoreByUserRequest(scores: { [key in AgentType]: number }, request: string) {
    const agents = getAllAgents();
    
    agents.forEach(agent => {
      const keywordMatches = agent.keywords.filter(keyword => 
        request.includes(keyword.toLowerCase())
      ).length;
      
      if (keywordMatches > 0) {
        scores[agent.id] += keywordMatches * 0.2;
      }
    });

    // Specific request patterns
    if (request.includes('performance') || request.includes('optimize') || request.includes('speed')) {
      scores['performance-optimizer'] += 0.5;
    }
    if (request.includes('test') || request.includes('testing') || request.includes('qa')) {
      scores['testing-specialist'] += 0.5;
    }
    if (request.includes('design') || request.includes('ui') || request.includes('ux')) {
      scores['design-guru'] += 0.5;
    }
    if (request.includes('deploy') || request.includes('docker') || request.includes('ci')) {
      scores['devops-commander'] += 0.5;
    }
  }

  private scoreByProjectFeatures(scores: { [key in AgentType]: number }, context: ProjectContext) {
    if (context.hasTests) {
      scores['testing-specialist'] += 0.3;
    }
    if (context.hasDatabase) {
      scores['database-master'] += 0.3;
    }
    if (context.hasDocker || context.hasCI) {
      scores['devops-commander'] += 0.3;
    }
  }

  private generateReasoningText(agentType: AgentType, context: ProjectContext, userRequest: string): string {
    const agent = getAgentByType(agentType);
    const reasons: string[] = [];

    // Project type reasoning
    if (context.type !== 'unknown') {
      reasons.push(`Project appears to be ${context.type}-focused`);
    }

    // Technology reasoning
    if (context.technologies.length > 0) {
      reasons.push(`Technologies detected: ${context.technologies.join(', ')}`);
    }

    // Request content reasoning
    const matchingKeywords = agent.keywords.filter(keyword => 
      userRequest.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matchingKeywords.length > 0) {
      reasons.push(`Request contains keywords: ${matchingKeywords.join(', ')}`);
    }

    return `Selected ${agent.name} because: ${reasons.join('; ')}.`;
  }
}