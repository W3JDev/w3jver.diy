import React, { useState, useEffect } from 'react';
import {
  RectangleStackIcon,
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserIcon,
  FunnelIcon,
  SortAscendingIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Template {
  id: string;
  name: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  price: number; // 0 for free
  rating: number;
  reviewCount: number;
  downloads: number;
  preview: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  premium: boolean;
}

interface TemplateMarketplaceProps {
  onTemplateSelect?: (template: Template) => void;
  onPurchaseTemplate?: (templateId: string) => void;
  currentUser?: {
    id: string;
    isPremium: boolean;
    ownedTemplates: string[];
  };
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onTemplateSelect,
  onPurchaseTemplate,
  currentUser
}) => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'E-commerce Dashboard',
      description: 'Modern React dashboard with analytics, inventory management, and order tracking',
      author: { name: 'W3Jverse Team', verified: true },
      category: 'Dashboard',
      tags: ['React', 'TypeScript', 'Tailwind', 'Charts'],
      price: 49,
      rating: 4.8,
      reviewCount: 127,
      downloads: 2543,
      preview: 'https://example.com/preview1',
      thumbnail: '/templates/ecommerce-dash.jpg',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      featured: true,
      premium: true
    },
    {
      id: '2',
      name: 'AI Chat Interface',
      description: 'Beautiful chat interface with AI integration, message threading, and typing indicators',
      author: { name: 'Sarah Chen', verified: true },
      category: 'Components',
      tags: ['React', 'AI', 'Chat', 'WebSocket'],
      price: 0,
      rating: 4.9,
      reviewCount: 89,
      downloads: 1876,
      preview: 'https://example.com/preview2',
      thumbnail: '/templates/ai-chat.jpg',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      featured: true,
      premium: false
    },
    {
      id: '3',
      name: 'SaaS Landing Page',
      description: 'Convert visitors with this high-converting SaaS landing page template',
      author: { name: 'Mike Rodriguez', verified: false },
      category: 'Landing Pages',
      tags: ['Next.js', 'SEO', 'Conversion', 'Marketing'],
      price: 29,
      rating: 4.6,
      reviewCount: 203,
      downloads: 4321,
      preview: 'https://example.com/preview3',
      thumbnail: '/templates/saas-landing.jpg',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-18',
      featured: false,
      premium: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Dashboard', 'Components', 'Landing Pages', 'Applications', 'Utilities'];
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    const matchesPrice = priceFilter === 'all' ||
                        (priceFilter === 'free' && template.price === 0) ||
                        (priceFilter === 'paid' && template.price > 0);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  const handleTemplateAction = (template: Template) => {
    if (template.price === 0) {
      onTemplateSelect?.(template);
    } else if (currentUser?.ownedTemplates.includes(template.id)) {
      onTemplateSelect?.(template);
    } else {
      onPurchaseTemplate?.(template.id);
    }
  };

  const getActionButtonText = (template: Template) => {
    if (template.price === 0) return 'Use Template';
    if (currentUser?.ownedTemplates.includes(template.id)) return 'Use Template';
    return `Purchase $${template.price}`;
  };

  return (
    <div className="w3j-glass-morphism p-6 m-4" data-testid="template-marketplace">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <RectangleStackIcon className="w-7 h-7" />
          Template Marketplace
        </h2>
        
        <div className="flex items-center gap-2 text-w3j-gold">
          <CurrencyDollarIcon className="w-5 h-5" />
          <span className="text-sm">Earn revenue by sharing your templates</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates, tags, or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w3j-prompt-input pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w3j-model-selector"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w3j-model-selector"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w3j-icon-button"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="w3j-glass-morphism p-4 mb-6">
          <h3 className="text-white font-medium mb-3">Filters</h3>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Price</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w3j-model-selector"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Featured Templates */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          Featured Templates
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.filter(t => t.featured).map(template => (
            <div key={template.id} className="w3j-glass-morphism p-4 hover:bg-opacity-20 transition-all">
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-w3j-orange to-w3j-purple rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-medium">Preview</span>
                </div>
                {template.premium && (
                  <div className="absolute top-2 right-2 bg-w3j-gold text-w3j-dark px-2 py-1 rounded text-xs font-medium">
                    Premium
                  </div>
                )}
              </div>
              
              <h4 className="text-white font-semibold mb-2">{template.name}</h4>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{template.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{template.author.name}</span>
                {template.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  {renderStars(template.rating)}
                  <span className="text-sm text-gray-300 ml-1">
                    {template.rating} ({template.reviewCount})
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {template.downloads.toLocaleString()} downloads
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.map(tag => (
                  <span key={tag} className="bg-w3j-blue bg-opacity-20 text-w3j-blue px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-w3j-gold font-bold">
                  {template.price === 0 ? 'Free' : `$${template.price}`}
                </div>
                <button
                  onClick={() => handleTemplateAction(template)}
                  className="w3j-button text-sm"
                >
                  {getActionButtonText(template)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Templates */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          All Templates ({filteredTemplates.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="w3j-glass-morphism p-3 hover:bg-opacity-20 transition-all">
              <div className="w-full h-32 bg-gradient-to-br from-w3j-blue to-w3j-purple rounded mb-3 flex items-center justify-center">
                <span className="text-white text-sm">Preview</span>
              </div>
              
              <h5 className="text-white font-medium mb-1 truncate">{template.name}</h5>
              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{template.description}</p>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(template.rating)}
                  <span className="text-xs text-gray-400">({template.reviewCount})</span>
                </div>
                <div className="text-w3j-gold font-bold text-sm">
                  {template.price === 0 ? 'Free' : `$${template.price}`}
                </div>
              </div>
              
              <button
                onClick={() => handleTemplateAction(template)}
                className="w-full w3j-button text-xs py-2"
              >
                {getActionButtonText(template)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Revenue Section */}
      <div className="mt-8 w3j-glass-morphism p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="w-6 h-6 text-w3j-gold" />
          Become a Template Creator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-w3j-gold">70%</div>
            <div className="text-sm text-gray-300">Revenue Share</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-w3j-blue">$1M+</div>
            <div className="text-sm text-gray-300">Paid to Creators</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-w3j-purple">5K+</div>
            <div className="text-sm text-gray-300">Active Templates</div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="w3j-button">
            Submit Template
          </button>
          <button className="w3j-icon-button px-4">
            Creator Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};