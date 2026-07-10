import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, User, Bell, Phone, MapPin, Sparkles, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { products, categories, brands } from '../data';
import { Product } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onSearchClick: () => void;
  onAccountClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userName?: string;
  // Optional extra callbacks for the premium experience
  onChangeTab?: (tab: string) => void;
  wishlistCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onCartClick, 
  onMenuClick,
  onSearchClick,
  onAccountClick,
  searchQuery,
  setSearchQuery,
  userName,
  onChangeTab,
  wishlistCount = 0
}) => {
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const popularSearches = [
    { label: 'سيرافي مرطب', term: 'سيرافي' },
    { label: 'لاروش رغوي', term: 'لاروش' },
    { label: 'فيتامينات', term: 'فيتامينات' },
    { label: 'بنادول إكسترا', term: 'بنادول' },
    { label: 'بيوديرما', term: 'بيوديرما' }
  ];

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    onSearchClick();
    setShowSearchSuggestions(false);
  };

  // Real-time typeahead dynamic results
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return { products: [], categories: [], brands: [] };
    const query = searchQuery.toLowerCase().trim();
    
    // Suggest up to 5 matching products
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    ).slice(0, 5);

    // Suggest up to 3 matching categories
    const matchedCategories = categories.filter(c => 
      c.name.toLowerCase().includes(query)
    ).slice(0, 3);

    // Suggest up to 3 matching brands
    const matchedBrands = brands.filter(b => 
      b.toLowerCase().includes(query)
    ).slice(0, 3);

    return {
      products: matchedProducts,
      categories: matchedCategories,
      brands: matchedBrands
    };
  }, [searchQuery]);

  const renderTypeaheadDropdown = () => {
    if (!showSearchSuggestions || !searchQuery.trim()) return null;
    
    const { products: matchedProds, categories: matchedCats, brands: matchedBrands } = filteredSuggestions;
    const hasAnyResults = matchedProds.length > 0 || matchedCats.length > 0 || matchedBrands.length > 0;
    
    return (
      <div 
        className="absolute right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-150 divide-y divide-gray-100 z-50 text-right overflow-hidden max-h-[420px] overflow-y-auto"
        onMouseDown={(e) => e.preventDefault()} // Prevents input blur from closing dropdown before click completes
      >
        {hasAnyResults ? (
          <>
            {/* Products Group */}
            {matchedProds.length > 0 && (
              <div className="p-3">
                <div className="text-[11px] font-extrabold text-[#CE1126] mb-2 px-2 flex items-center justify-between">
                  <span>المنتجات المطابقة لروتينك العلاجي</span>
                  <span className="text-[9px] bg-red-50 text-[#CE1126] px-1.5 py-0.5 rounded font-black">سرعة ودقة فائقة</span>
                </div>
                <div className="space-y-1">
                  {matchedProds.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleSuggestionClick(p.name)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold truncate mt-0.5">{p.category} ● {p.brand}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-xs font-black text-gray-900">{p.price} ج.م</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brands Group */}
            {matchedBrands.length > 0 && (
              <div className="p-3 bg-[#FAFAFA]">
                <div className="text-[11px] font-extrabold text-gray-400 mb-2 px-2">العلامات التجارية المطابقة</div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {matchedBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => handleSuggestionClick(b)}
                      className="text-xs font-black bg-white hover:bg-red-50 hover:text-[#CE1126] border border-gray-200/65 rounded-lg px-2.5 py-1 transition-all cursor-pointer"
                    >
                      ✨ {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Group */}
            {matchedCats.length > 0 && (
              <div className="p-3">
                <div className="text-[11px] font-extrabold text-gray-400 mb-2 px-2">الأقسام والفئات الطبية</div>
                <div className="space-y-0.5">
                  {matchedCats.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSuggestionClick(c.name)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-xs font-bold text-gray-700 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <span>📁</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="text-[10px] text-red-500 font-extrabold">تصفح الفئة ←</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-400 text-xs font-bold">
            🔍 عذراً، لا توجد نتائج مطابقة لـ "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-45 bg-white shadow-md border-b border-gray-100">
      {/* Top Multi-Info Announcement Bar (Crimson Red / Pure White / Black Accent) */}
      <div className="bg-black text-white text-[11px] md:text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Right side: Promo banner */}
          <div className="flex items-center gap-2 font-bold text-gray-100">
            <Sparkles size={14} className="text-[#E11D48] animate-pulse" />
            <span>شحن مجاني للطلبات أكبر من 300 ج.م وسرعة فائقة في التوصيل لجميع المحافظات!</span>
          </div>

          {/* Left side: Quick actions links linked directly to bendaryph services */}
          <div className="flex items-center gap-4 text-gray-300 font-bold">
            <button 
              onClick={() => onChangeTab?.('ordertracking')}
              className="hover:text-[#E11D48] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>تتبع طلبك</span>
            </button>
            <span className="opacity-30">|</span>
            <button 
              onClick={() => onChangeTab?.('branches')}
              className="hover:text-[#E11D48] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <MapPin size={13} className="text-[#E11D48]" />
              <span>فروعنا</span>
            </button>
            <span className="opacity-30">|</span>
            <a href="https://www.bendaryph.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E11D48] transition-colors">
              <span>موقعنا: www.bendaryph.com</span>
            </a>
            <span className="opacity-30">|</span>
            <a href="tel:01200400094" className="hover:text-[#E11D48] transition-colors flex items-center gap-1">
              <Phone size={13} />
              <span>اتصل بنا: 01200400094</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 bg-white">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Presentation (RTL Right side) */}
          <div 
            onClick={() => {
              if (onChangeTab) {
                onChangeTab('home');
              } else {
                window.location.href = "https://www.bendaryph.com";
              }
            }} 
            className="cursor-pointer shrink-0"
          >
            <Logo variant="header" />
          </div>

          {/* Luxury Search Engine with Suggested Prompt keywords (Desktop) */}
          <div className="flex-1 max-w-2xl mx-2 lg:mx-8 hidden md:block">
            <div className="relative z-30">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#CE1126]" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl leading-5 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition-all duration-300 text-sm"
                placeholder="ابحث عن أدوية، فيتامينات، مستحضرات تجميل..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) onSearchClick();
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onClick={onSearchClick}
              />
              
              {renderTypeaheadDropdown()}
              
              {/* Popular tags below the header */}
              <div className="absolute right-1 top-12 left-1 bg-white/40 flex items-center gap-2 py-1 overflow-x-auto scrollbar-none z-10 select-none">
                <span className="text-[10px] text-gray-400 font-bold shrink-0">أكثر بحثاً:</span>
                {popularSearches.map((ps, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSuggestionClick(ps.term)}
                    className="text-[11px] bg-white border border-gray-150 hover:bg-red-500/5 hover:text-[#CE1126] text-gray-600 px-2.5 py-0.5 rounded-full font-bold transition-all shrink-0 cursor-pointer"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Deck (Left Side in RTL) */}
          <div className="flex items-center gap-1 md:gap-3">
            
            {/* Locator Button */}
            <button 
              onClick={() => onChangeTab?.('branches')}
              className="p-2 text-gray-500 hover:text-[#CE1126] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-1 group font-bold text-sm"
              title="تحديد الفروع"
            >
              <MapPin size={22} className="group-hover:scale-105 transition-transform text-[#CE1126]" />
              <span className="hidden lg:inline text-gray-900">الفروع</span>
            </button>

            {/* AI Advisor Button */}
            <button 
              onClick={() => onChangeTab?.('aichat')}
              className="p-2 text-[#CE1126] bg-red-50 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1 font-bold text-sm border border-red-100 animate-pulse"
              title="مستشارك الطبي الذكي"
            >
              <svg className="w-5 h-5 text-[#CE1126]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 0110 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" />
                <path d="M12 6v6M12 16h.01" />
              </svg>
              <span className="hidden sm:inline text-xs">الصيدلي الذكي</span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* Account Tab */}
            <button 
              onClick={onAccountClick}
              className="p-2 text-gray-500 hover:text-[#CE1126] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-1.5 font-bold text-sm"
            >
              <User size={22} className="text-gray-700" />
              <span className="hidden sm:inline max-w-[100px] truncate text-gray-900">{userName ? userName.split(' ')[0] : 'تسجيل'}</span>
            </button>

            {/* Wishlist Button */}
            <button 
              onClick={() => onChangeTab?.('account')}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-xl transition-all relative flex items-center"
              title="المفضلة"
            >
              <Heart size={22} className="text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white bg-[#CE1126] rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onCartClick}
              className="relative p-2.5 bg-[#CE1126] text-white hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-950/10 flex items-center gap-2 group ml-1 font-bold text-sm"
            >
              <ShoppingCart size={20} className="group-hover:rotate-6 transition-transform" />
              <span className="hidden md:inline font-black text-white">السلة</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-black leading-none text-[#CE1126] bg-white rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
        </div>

        {/* Mobile Search - Bottom Bar */}
        <div className="mt-2 md:hidden">
          <div className="relative z-30 group">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition-all duration-300 text-sm shadow-inner"
              placeholder="ابحث عن أدوية أو منتجات العناية بالبشرة..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) onSearchClick();
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              onClick={onSearchClick}
            />
            {renderTypeaheadDropdown()}
          </div>
        </div>
      </div>

      {/* Category Dropdown Navigation Bar (Desktop Only) */}
      <div className="border-t border-gray-100 bg-[#FAFAFA] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between text-xs lg:text-sm font-bold text-gray-700 gap-6">
            <div className="flex items-center gap-1 text-[#CE1126] hover:opacity-85 cursor-pointer" onClick={() => onChangeTab?.('home')}>
              <Sparkles size={16} className="text-[#CE1126]" />
              <span className="font-extrabold text-[#CE1126]">الرئيسية</span>
            </div>
            
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">العناية بالبشرة</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">الفيتامينات والمكملات</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">مستحضرات تجميل</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">العناية بالشعر</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">الأدوية والوصفات</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">الأم والطفل</button>
            <button onClick={() => onChangeTab?.('search')} className="hover:text-[#CE1126] transition-colors shrink-0 text-gray-800">معدات ومستلزمات طبية</button>
            
            <div className="h-4 w-px bg-gray-200"></div>
            
            <button 
              onClick={() => onChangeTab?.('prescription')}
              className="text-[#CE1126] hover:text-red-700 flex items-center gap-1 font-extrabold shrink-0"
            >
              <span>صرف روشتة أونلاين</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
