import React, { useState } from 'react';
import {
  PaintBrushIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CreditCardIcon,
  UserGroupIcon,
  CogIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  domain?: string;
  favicon?: string;
  customCSS?: string;
}

interface WhiteLabelClient {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'pending' | 'suspended';
  branding: BrandingConfig;
  createdAt: string;
  lastActive: string;
  monthlyRevenue: number;
}

interface WhiteLabelSolutionsProps {
  currentUser?: {
    id: string;
    role: 'agency' | 'reseller' | 'enterprise';
    plan: string;
  };
}

export const WhiteLabelSolutions: React.FC<WhiteLabelSolutionsProps> = ({
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'branding' | 'billing'>('overview');
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    primaryColor: '#ff6b35',
    secondaryColor: '#1e90ff',
    accentColor: '#6a0dad',
    companyName: 'My Agency'
  });

  const [clients, setClients] = useState<WhiteLabelClient[]>([
    {
      id: '1',
      name: 'TechStart Solutions',
      domain: 'dev.techstart.com',
      plan: 'professional',
      status: 'active',
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        accentColor: '#059669',
        companyName: 'TechStart Solutions'
      },
      createdAt: '2024-01-15',
      lastActive: '2024-01-30',
      monthlyRevenue: 297
    },
    {
      id: '2',
      name: 'Digital Creative Co',
      domain: 'tools.digitalcreative.io',
      plan: 'enterprise',
      status: 'active',
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#ea580c',
        accentColor: '#7c2d12',
        companyName: 'Digital Creative Co'
      },
      createdAt: '2024-01-10',
      lastActive: '2024-01-29',
      monthlyRevenue: 897
    }
  ]);

  const [showBrandingModal, setShowBrandingModal] = useState(false);

  const handleColorChange = (colorType: keyof BrandingConfig, value: string) => {
    setBrandingConfig(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-500';
      case 'professional': return 'bg-purple-500';
      case 'enterprise': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalRevenue = clients.reduce((sum, client) => sum + client.monthlyRevenue, 0);

  return (
    <div className="w3j-glass-morphism p-6 m-4" data-testid="branding-options">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BuildingOfficeIcon className="w-7 h-7" />
          White-Label Solutions
        </h2>
        
        <div className="flex items-center gap-2 text-w3j-gold">
          <span className="text-sm">Enterprise Revenue:</span>
          <span className="font-bold">${totalRevenue.toLocaleString()}/month</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 w3j-glass-morphism p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: EyeIcon },
          { id: 'clients', label: 'Clients', icon: UserGroupIcon },
          { id: 'branding', label: 'Branding', icon: PaintBrushIcon },
          { id: 'billing', label: 'Billing', icon: CreditCardIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id 
                ? 'bg-w3j-gradient-primary text-white' 
                : 'text-gray-300 hover:text-white hover:bg-opacity-20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-blue">{clients.length}</div>
              <div className="text-sm text-gray-300">Active Clients</div>
            </div>
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-gold">${totalRevenue}</div>
              <div className="text-sm text-gray-300">Monthly Revenue</div>
            </div>
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-purple">98%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-orange">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
          </div>

          <div className="w3j-glass-morphism p-6">
            <h3 className="text-xl font-semibold text-white mb-4">White-Label Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Custom Domain & SSL',
                'Full Brand Customization',
                'Client Management Portal',
                'Revenue Share Program',
                'API Access & Webhooks',
                'Priority Support',
                'Custom Deployment',
                'Analytics Dashboard'
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w3j-glass-morphism p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-w3j-blue rounded-full flex items-center justify-center text-white font-bold">1</div>
                <span className="text-gray-300">Configure your brand settings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-w3j-purple rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span className="text-gray-300">Set up custom domain</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-w3j-gold rounded-full flex items-center justify-center text-white font-bold">3</div>
                <span className="text-gray-300">Invite clients to your platform</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Client Management</h3>
            <button className="w3j-button">Add New Client</button>
          </div>

          <div className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="w3j-glass-morphism p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: client.branding.primaryColor }}
                    >
                      <span className="text-white font-bold">
                        {client.branding.companyName.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold">{client.name}</h4>
                      <p className="text-gray-400 text-sm">{client.domain}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getPlanBadgeColor(client.plan)} text-white`}>
                          {client.plan}
                        </span>
                        <span className={`text-xs ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-w3j-gold font-bold">${client.monthlyRevenue}/month</div>
                    <div className="text-gray-400 text-sm">Last active: {client.lastActive}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="w3j-icon-button">
                        <CogIcon className="w-4 h-4" />
                      </button>
                      <button className="w3j-icon-button">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Brand Customization</h3>
            <button 
              onClick={() => setShowBrandingModal(true)}
              className="w3j-button"
            >
              Preview Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w3j-glass-morphism p-6">
              <h4 className="text-white font-semibold mb-4">Brand Colors</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 w3j-prompt-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandingConfig.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={brandingConfig.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1 w3j-prompt-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandingConfig.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={brandingConfig.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 w3j-prompt-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w3j-glass-morphism p-6">
              <h4 className="text-white font-semibold mb-4">Company Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={brandingConfig.companyName}
                    onChange={(e) => handleColorChange('companyName', e.target.value)}
                    className="w3j-prompt-input"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Custom Domain</label>
                  <input
                    type="text"
                    placeholder="mycompany.com"
                    value={brandingConfig.domain || ''}
                    onChange={(e) => handleColorChange('domain', e.target.value)}
                    className="w3j-prompt-input"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Logo Upload</label>
                  <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Drop your logo here or click to upload</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w3j-glass-morphism p-6">
            <h4 className="text-white font-semibold mb-4">Live Preview</h4>
            <div 
              className="w-full h-64 rounded-lg p-6 flex flex-col justify-between"
              style={{ 
                background: `linear-gradient(135deg, ${brandingConfig.primaryColor}, ${brandingConfig.secondaryColor})` 
              }}
            >
              <div>
                <h1 className="text-white text-2xl font-bold mb-2">{brandingConfig.companyName}</h1>
                <p className="text-white opacity-90">AI-Powered Development Platform</p>
              </div>
              <div className="flex gap-2">
                <div 
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: brandingConfig.accentColor }}
                >
                  Get Started
                </div>
                <div className="px-4 py-2 rounded border border-white text-white">
                  Learn More
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Revenue & Billing</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-gold">${totalRevenue * 0.3}</div>
              <div className="text-sm text-gray-300">Your Commission (30%)</div>
            </div>
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-blue">${totalRevenue * 12 * 0.3}</div>
              <div className="text-sm text-gray-300">Annual Projection</div>
            </div>
            <div className="w3j-glass-morphism p-4 text-center">
              <div className="text-2xl font-bold text-w3j-purple">Next Week</div>
              <div className="text-sm text-gray-300">Next Payout</div>
            </div>
          </div>

          <div className="w3j-glass-morphism p-6">
            <h4 className="text-white font-semibold mb-4">Revenue Breakdown</h4>
            <div className="space-y-3">
              {clients.map(client => (
                <div key={client.id} className="flex justify-between items-center py-2 border-b border-gray-600">
                  <span className="text-gray-300">{client.name}</span>
                  <div className="text-right">
                    <div className="text-white">${client.monthlyRevenue}</div>
                    <div className="text-w3j-gold text-sm">+${(client.monthlyRevenue * 0.3).toFixed(0)} commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};