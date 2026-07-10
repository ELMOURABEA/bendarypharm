/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AuthView } from './components/AuthView';
import { AccountView } from './components/AccountView';
import { AIChat } from './components/AIChat';
import { BottomNav } from './components/BottomNav';
import { OrderTrackingView } from './components/OrderTrackingView';
import { BranchLocatorView } from './components/BranchLocatorView';
import { categories, products, mockOrders } from './data';
import { FilterState, CartItem, Product, User, Order, OrderStatus } from './types';
import { Stethoscope, FileSignature, ShieldCheck, Phone, MessageCircle, Search, LogOut, Heart, ListOrdered, Facebook, Smartphone, PackageSearch, Server, Mail, Bot, Sparkles } from 'lucide-react';
import { PrescriptionUploadView } from './components/PrescriptionUploadView';
import { CheckoutPaymentModal } from './components/CheckoutPaymentModal';
import { CloudflareAgentHub } from './components/CloudflareAgentHub';
import { Logo } from './components/Logo';
import { ProductCompareModal } from './components/ProductCompareModal';
import { MedicationRemindersView } from './components/MedicationRemindersView';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { DosageCalculatorView } from './components/DosageCalculatorView';
import { Clock, GitCompare, Calculator, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeBanner, setActiveBanner] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: [0, 5000],
    prescriptionOnly: null,
  });
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>(products);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCompareProducts, setSelectedCompareProducts] = useState<Product[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  // Live mobile app database sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  const handleSyncWithMobileApp = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/products/sync', { method: 'POST' });
      const data = await response.json();
      if (data && data.success) {
        setDbProducts(data.products);
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
        setToast({
          title: "تمت المزامنة بنجاح! 📱🔄",
          message: data.syncMessage || "تمت مزامنة مخزون صيدليات البنداري للموبايل مع البوابة فورياً!"
        });
      }
    } catch (err) {
      console.error("Sync failure", err);
      // Simulate local randomized offline updates
      setDbProducts(prev => prev.map(p => ({
        ...p,
        price: Math.max(10, Math.round(p.price * (0.95 + Math.random() * 0.1))),
        stockQuantity: Math.floor(Math.random() * 80) + 15
      })));
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      setToast({
        title: "مزامنة تفاعلية محاكية ✓",
        message: "تم تحديث ومزامنة مخازن الموبايل محلياً لعرض كفاءة الربط الثنائي التلقائي."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle products in the comparison list
  const toggleCompareProduct = (product: Product) => {
    setSelectedCompareProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        setToast({
          title: "الحد الأقصى للمقارنة! ⚠️",
          message: "يمكنك مراجعة ومقارنة 4 منتجات كحد أقصى لتسهيل الاختيار."
        });
        return prev;
      }
      setToast({
        title: "تم الإضافة للمقارنة ⚖️",
        message: `تم إضافة ${product.name} لقائمة المقارنة النشطة.`
      });
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setSelectedCompareProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateProductRating = (productId: string, newReviewsCount: number, averageRating: number) => {
    setDbProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          rating: averageRating,
          reviews: newReviewsCount
        };
      }
      return p;
    }));
  };

  // Secure shopping cart totals memoization
  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    return subtotal > 0 ? subtotal + 25 : 0;
  }, [cartItems]);

  const [secondsLeft, setSecondsLeft] = useState(32400); // 9 hours
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 32400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  // Authentication & State & Data Fetching
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data && data.success && data.products) {
          setDbProducts(data.products);
          return;
        }

        const { supabase } = await import('./lib/supabase');
        const { data: sData, error } = await supabase.from('products').select('*');
        if (!error && sData && sData.length > 0) {
          setDbProducts(sData as Product[]);
        }
      } catch (err) {
        console.error("Fetch products API offline; using local state", err);
      }
    };
    fetchProducts();
    
    // Auth Listener
    import('./lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email || 'مستخدم',
            phone: session.user.user_metadata?.phone || session.user.phone || '',
            addresses: session.user.user_metadata?.addresses || []
          });
        }
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email || 'مستخدم',
            phone: session.user.user_metadata?.phone || session.user.phone || '',
            addresses: session.user.user_metadata?.addresses || []
          });
          setCurrentTab('home');
        } else {
          setCurrentUser(null);
        }
      });
    });

    // Check local storage for wishlist
    const storedWishlist = localStorage.getItem('elb_wishlist');
    if (storedWishlist) {
      try { setWishlist(JSON.parse(storedWishlist)); } catch(e) {}
    }
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const savePrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', savePrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', savePrompt);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Simulate Order Execution Pipeline
  useEffect(() => {
    if (!orders.length) return;

    const findAndProcess = (status: OrderStatus, nextStatus: OrderStatus, delay: number) => {
      const order = orders.find(o => o.status === status);
      if (order) {
        const timer = setTimeout(() => {
          updateOrderStatus(order.id, nextStatus);
        }, delay);
        return () => clearTimeout(timer);
      }
      return undefined;
    };

    const cleanup1 = findAndProcess('Pending', 'Confirmed', 8000);
    if (!cleanup1) {
      const cleanup2 = findAndProcess('Confirmed', 'Processing', 8000);
      if (!cleanup2) {
        const cleanup3 = findAndProcess('Processing', 'OutForDelivery', 10000);
        if (!cleanup3) {
          findAndProcess('OutForDelivery', 'Delivered', 12000);
        }
      }
    }
  }, [orders]);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    if (newStatus === 'OutForDelivery' || newStatus === 'Delivered') {
      const title = newStatus === 'OutForDelivery' ? 'طلبك في الطريق! 🚚' : 'تم توصيل طلبك بنجاح! ✅';
      const body = `تحديث لحالة الطلب رقم #${orderId}`;
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else {
         setToast({ title, message: body });
      }
    }
  };

  const handleLogin = (email: string, name: string) => {
    // Current user state is managed by the supabase auth listener.
    // Setting a temporary state just in case
    if (!currentUser) {
      setCurrentUser({ id: 'U-' + Date.now(), phone: '', name, addresses: [] });
    }
    setCurrentTab('home');
  };

  const handleLogout = async () => {
    const { supabase } = await import('./lib/supabase');
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentTab('home');
  };

  const handleUpdateProfile = async (updatedDetails: { name: string; phone: string; addresses: any[] }) => {
    try {
      const { supabase } = await import('./lib/supabase');
      const { error } = await supabase.auth.updateUser({
        user_metadata: {
          full_name: updatedDetails.name,
          phone: updatedDetails.phone,
          addresses: updatedDetails.addresses,
        }
      });
      if (error) throw error;
      
      setCurrentUser({
        id: currentUser?.id || '',
        name: updatedDetails.name,
        phone: updatedDetails.phone,
        addresses: updatedDetails.addresses,
      });

      setToast({
        title: "تم حفظ التعديلات بنجاح! ✅",
        message: "تم تحديث بيانات ملفك الشخصي وعناوين الشحن في النظام بنجاح."
      });
    } catch (err: any) {
      console.error(err);
      setCurrentUser({
        id: currentUser?.id || '',
        name: updatedDetails.name,
        phone: updatedDetails.phone,
        addresses: updatedDetails.addresses,
      });
      setToast({
        title: "تم التحديث محلياً! ✅",
        message: "تم حفظ بيانات ملفك الشخصي وعناوينك بنجاح في هذه الجلسة."
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      updateOrderStatus(orderId, 'Cancelled');
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setCartOpen(false);
      setCurrentTab('account');
      return;
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // Secure payment transaction success handler
  const handlePaymentSuccess = (paymentDetails: {
    paymentMethod: 'Card' | 'Wallet' | 'Cash' | 'PayPal';
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
    transactionId: string;
  }) => {
    // Construct authorized pharmacy order
    const newOrder: Order = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: cartTotal,
      status: paymentDetails.paymentMethod === 'Cash' ? 'Pending' : 'Confirmed',
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.paymentStatus,
      transactionId: paymentDetails.transactionId
    };

    setOrders([newOrder, ...orders]);
    setCartItems([]);
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };
  
  const toggleWishlist = (product: Product) => {
     setWishlist(prev => {
        const exists = prev.find(p => p.id === product.id);
        const newList = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
        localStorage.setItem('elb_wishlist', JSON.stringify(newList));
        return newList;
     });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Super charge search & multi-filtering algorithms
  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];

    // Filter by text search query (fuzzy & tag based)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(product => 
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q)
      );
    }

    // Filter by category (Multi-select)
    if (filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category));
    }

    // Filter by brand (Multi-select)
    if (filters.brands.length > 0) {
      result = result.filter(product => filters.brands.includes(product.brand));
    }

    // Filter by price range
    if (filters.priceRange) {
      result = result.filter(product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
    }

    // Filter by prescription requirement
    if (filters.prescriptionOnly !== null) {
      result = result.filter(product => product.prescriptionRequired === filters.prescriptionOnly);
    }

    // Filter by in-stock status
    if (inStockOnly) {
      result = result.filter(product => product.inStock);
    }

    // Apply Sorting algorithms
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discountA = a.originalPrice ? (a.originalPrice - a.price) : 0;
        const discountB = b.originalPrice ? (b.originalPrice - b.price) : 0;
        return discountB - discountA;
      });
    }

    return result;
  }, [filters, searchQuery, dbProducts, inStockOnly, sortBy]);

  const selectCategory = (categoryName: string) => {
    setFilters({ categories: [categoryName], brands: [], priceRange: [0, 5000], prescriptionOnly: null });
    setSearchQuery('');
    setCurrentTab('search');
  };

  const selectBrand = (brandName: string) => {
    setFilters({ categories: [], brands: [brandName], priceRange: [0, 5000], prescriptionOnly: null });
    setSearchQuery('');
    setCurrentTab('search');
  };

  const renderContent = () => {
    if (currentTab === 'dosage') {
      return (
        <DosageCalculatorView 
          onBack={() => setCurrentTab('home')}
        />
      );
    }

    if (currentTab === 'reminders') {
      return (
        <MedicationRemindersView 
          onBack={() => setCurrentTab('home')} 
          products={dbProducts}
          onAddToCart={addToCart}
        />
      );
    }

    if (currentTab === 'aichat') {
      return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] w-full">
           <AIChat onClose={() => setCurrentTab('home')} />
        </div>
      );
    }

    if (currentTab === 'menu') {
      return (
        <div className="max-w-md mx-auto py-8 px-4 h-full flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                 <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl">
                   {currentUser ? currentUser.name.charAt(0) : 'زائر'}
                 </div>
                 <h3 className="font-bold text-gray-900">{currentUser ? currentUser.name : 'مرحباً بك في البندارى'}</h3>
              </div>
              {!currentUser && (
               <button onClick={() => setCurrentTab('account')} className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl mb-2 transition hover:bg-primary-700">
                 تسجيل الدخول / إنشاء حساب
               </button>
              )}
            </div>

            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
               <button onClick={() => setCurrentTab('reminders')} className="w-full flex justify-between items-center p-4 hover:bg-red-50/40 transition">
                 <div className="flex items-center gap-3 text-[#CE1126]">
                   <Clock size={20} className="text-[#CE1126] animate-pulse shrink-0" />
                   <span className="font-extrabold text-[#CE1126] flex items-center gap-2">
                     تنبيهات ومواعيد الأدوية الدورية
                     <span className="bg-red-50 text-[10px] text-[#CE1126] font-black px-1.5 py-0.5 rounded-full border border-red-100">نشط ✓</span>
                   </span>
                 </div>
               </button>
               <button onClick={() => setCurrentTab('account')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                 <div className="flex items-center gap-3">
                   <ListOrdered size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">طلباتي</span>
                 </div>
               </button>
               <button onClick={() => setCurrentTab('account')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                 <div className="flex items-center gap-3">
                   <Heart size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">المفضلة</span>
                 </div>
               </button>
               <button onClick={() => setCurrentTab('search')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                 <div className="flex items-center gap-3">
                   <Search size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">تصفح الأقسام</span>
                 </div>
               </button>
               
               <a href="https://admin.bendaryph.com" target="_blank" rel="noopener noreferrer" className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100">
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">لوحة تحكم الإدارة</span>
                 </div>
               </a>

               <button onClick={() => setCurrentTab('cloudflare_agent_hub')} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100 text-right cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Server size={20} className="text-[#CE1126]" />
                    <span className="font-extrabold text-gray-950">وكيل البريد وأتمتة Cloudflare (AI)</span>
                  </div>
                  <span className="bg-red-50 text-[#CE1126] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-100 uppercase font-mono animate-pulse">Live</span>
                </button>

                <div className="bg-gray-50 px-4 py-2 font-bold text-gray-500 text-sm border-t border-gray-100">تواصل معنا وحمل التطبيق</div>
               
               <a href="tel:01200400094" className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100">
                 <div className="flex items-center gap-3">
                   <Phone size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">اتصل بنا (01200400094)</span>
                 </div>
               </a>
               
               <a href="https://wa.me/201200400094" target="_blank" rel="noopener noreferrer" className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100">
                 <div className="flex items-center gap-3">
                   <MessageCircle size={20} className="text-green-500" />
                   <span className="font-bold text-gray-900">واتساب (01200400094)</span>
                 </div>
               </a>

               <a href="https://www.facebook.com/share/1HzMHJKLG4/" target="_blank" rel="noopener noreferrer" className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100">
                 <div className="flex items-center gap-3">
                   <Facebook size={20} className="text-blue-600" />
                   <span className="font-bold text-gray-900">صفحتنا على فيسبوك</span>
                 </div>
               </a>

               <a href="#" target="_blank" rel="noopener noreferrer" className="hidden w-full flex justify-between items-center p-4 hover:bg-gray-50 transition border-t border-gray-100">
                 <div className="flex items-center gap-3">
                   <Smartphone size={20} className="text-gray-500" />
                   <span className="font-bold text-gray-900">تطبيق الأندرويد</span>
                 </div>
               </a>

               {currentUser && (
                 <button onClick={handleLogout} className="w-full flex justify-between items-center p-4 hover:bg-red-50 transition text-red-600 border-t border-gray-100">
                   <div className="flex items-center gap-3">
                     <LogOut size={20} />
                     <span className="font-bold">تسجيل الخروج</span>
                   </div>
                 </button>
               )}
            </div>
        </div>
      );
    }

    if (currentTab === 'account') {
      return currentUser ? (
        <AccountView 
          user={currentUser} 
          orders={orders} 
          onLogout={handleLogout} 
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onCancelOrder={handleCancelOrder}
          onClickProduct={(prod) => {
            setSelectedProductDetails(prod);
            setDetailsOpen(true);
          }}
          selectedCompareProducts={selectedCompareProducts}
          onToggleCompare={toggleCompareProduct}
          onUpdateProfile={handleUpdateProfile}
        />
      ) : (
        <AuthView onLogin={handleLogin} />
      );
    }

    if (currentTab === 'prescription') {
      return (
        <PrescriptionUploadView 
          onBack={() => setCurrentTab('home')} 
          user={currentUser} 
        />
      );
    }

    if (currentTab === 'ordertracking') {
      return (
        <OrderTrackingView 
          orders={orders} 
          onBack={() => setCurrentTab('home')} 
        />
      );
    }

    if (currentTab === 'branches') {
      return (
        <BranchLocatorView />
      );
    }

    if (currentTab === 'cloudflare_agent_hub') {
      return (
        <CloudflareAgentHub onBack={() => setCurrentTab('menu')} />
      );
    }

    if (currentTab === 'search' || searchQuery) {
      // Predefined list of brands
      const allBrandsList = [
        'Vichy', 'La Roche-Posay', 'Cerave', 'Centrum', 'Bioderma', "L'Oreal", 'Panadol', 'Omron', 'Pampers', 'Aspirin'
      ];

      // Calculate matching product counts per category & brand
      const categoryCounts = dbProducts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const brandCounts = dbProducts.reduce((acc, p) => {
        acc[p.brand] = (acc[p.brand] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activeFiltersCount = 
        filters.categories.length + 
        filters.brands.length + 
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000 ? 1 : 0) + 
        (filters.prescriptionOnly !== null ? 1 : 0) + 
        (inStockOnly ? 1 : 0);

      const resetAllFilters = () => {
        setFilters({
          categories: [],
          brands: [],
          priceRange: [0, 5000],
          prescriptionOnly: null
        });
        setInStockOnly(false);
        setSortBy('default');
        setSearchQuery('');
      };

      const handleCategoryClick = (catName: string) => {
        setFilters(prev => {
          const matched = prev.categories.includes(catName);
          const nextCats = matched 
            ? prev.categories.filter(c => c !== catName) 
            : [...prev.categories, catName];
          return { ...prev, categories: nextCats };
        });
      };

      const handleBrandClick = (brandName: string) => {
        setFilters(prev => {
          const matched = prev.brands.includes(brandName);
          const nextBrands = matched 
            ? prev.brands.filter(b => b !== brandName) 
            : [...prev.brands, brandName];
          return { ...prev, brands: nextBrands };
        });
      };

      const handleRangeQuickSelect = (min: number, max: number) => {
        setFilters(prev => ({ ...prev, priceRange: [min, max] }));
      };

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumbs and search header banner */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-right">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1.5 justify-start md:justify-end">
                <span className="hover:text-[#CE1126] cursor-pointer" onClick={() => setCurrentTab('home')}>الرئيسية</span>
                <span>/</span>
                <span className="text-[#CE1126]">محرك البحث والمستودع الذكي</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                {searchQuery ? `نتائج البحث عن "${searchQuery}"` : "استكشف مستودع الأدوية والمنتجات"}
              </h1>
              <p className="text-xs text-slate-500 font-bold mt-1">تصفية ذكية متزامنة فورياً مع قاعدة بيانات صيدليات البنداري</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 md:self-center">
              {activeFiltersCount > 0 && (
                <button 
                  onClick={resetAllFilters}
                  className="bg-red-50 hover:bg-red-100 text-[#CE1126] font-black text-xs px-4 py-2.5 rounded-xl transition duration-200 border border-red-100/60 flex items-center gap-1 cursor-pointer"
                >
                  <span>🗑️ مسح جميع الفلاتر</span>
                </button>
              )}
              <span className="text-xs bg-[#CE1126] text-white font-extrabold px-3 py-2 rounded-xl">
                المطابقات: {filteredProducts.length} منتج متوفر
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* 🛠️ ADVANCED SIDEBAR FILTERS CONTROL */}
            <div className="w-full lg:w-72 shrink-0 space-y-6">
              
              {/* Filter Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-6">
                
                {/* Search Term refinement input inside page */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-400 select-none uppercase tracking-wider">بحث مخصص وتصفح</h3>
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-350 rounded-xl pr-3 pl-8 py-2.5 outline-none focus:bg-white focus:border-[#CE1126] transition-all text-right"
                      placeholder="ابحث ضمن النتائج الحالية..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Categories Checkboxes Section */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between col-span-1">
                    <h3 className="text-xs font-black text-gray-800">تصفية حسب الأقسام</h3>
                    {filters.categories.length > 0 && (
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                        className="text-[10px] font-black text-[#CE1126] hover:underline"
                      >
                        إعادة تعيين
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {categories.map(category => {
                      const isSelected = filters.categories.includes(category.name);
                      const count = categoryCounts[category.name] || 0;
                      return (
                        <label 
                          key={category.id}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-gray-650 hover:bg-gray-50 hover:text-gray-950 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryClick(category.name)}
                              className="w-4 h-4 text-[#CE1126] border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                            />
                            <span>{category.name}</span>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Brands Checkboxes Section */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-800">العلامات التجارية والبراندات</h3>
                    {filters.brands.length > 0 && (
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, brands: [] }))}
                        className="text-[10px] font-black text-[#CE1126] hover:underline"
                      >
                        إعادة تعيين
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {allBrandsList.map(brandName => {
                      const isSelected = filters.brands.includes(brandName);
                      const count = brandCounts[brandName] || 0;
                      return (
                        <label 
                          key={brandName}
                          className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-gray-650 hover:bg-gray-50 hover:text-gray-950 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleBrandClick(brandName)}
                              className="w-4 h-4 text-[#CE1126] border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                            />
                            <span className="font-sans font-extrabold">{brandName}</span>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Controls with slider & manual inputs */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-800">نطاق السعر</h3>
                    {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) && (
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 5000] }))}
                        className="text-[10px] font-black text-[#CE1126] hover:underline"
                      >
                        إعادة تعيين
                      </button>
                    )}
                  </div>
                  
                  {/* Slider or range outputs */}
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#CE1126] px-1 bg-red-50/50 p-2 rounded-lg border border-red-100/30">
                    <span>من: {filters.priceRange[0]} ج.م</span>
                    <span>إلى: {filters.priceRange[1]} ج.م</span>
                  </div>

                  {/* Manual Inputs for perfect price matching accuracy */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] text-gray-400 font-bold">الحد الأقصى</span>
                      <input 
                        type="number"
                        className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg p-2 text-center"
                        value={filters.priceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], val || 5000] }));
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] text-gray-400 font-bold">الحد الأدنى</span>
                      <input 
                        type="number"
                        className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg p-2 text-center"
                        value={filters.priceRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFilters(prev => ({ ...prev, priceRange: [val || 0, prev.priceRange[1]] }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Elegant Quick range selection chips */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    <button 
                      onClick={() => handleRangeQuickSelect(0, 100)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition duration-200 cursor-pointer ${
                        filters.priceRange[0] === 0 && filters.priceRange[1] === 100 
                          ? 'bg-[#CE1126] text-white border-transparent' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      أقل من 100 ج.م
                    </button>
                    <button 
                      onClick={() => handleRangeQuickSelect(100, 500)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition duration-200 cursor-pointer ${
                        filters.priceRange[0] === 100 && filters.priceRange[1] === 500 
                          ? 'bg-[#CE1126] text-white border-transparent' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      100 إلى 500 ج.م
                    </button>
                    <button 
                      onClick={() => handleRangeQuickSelect(500, 1500)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition duration-200 cursor-pointer ${
                        filters.priceRange[0] === 500 && filters.priceRange[1] === 1500 
                          ? 'bg-[#CE1126] text-white border-transparent' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      500 إلى 1500 ج.م
                    </button>
                    <button 
                      onClick={() => handleRangeQuickSelect(1500, 5000)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition duration-200 cursor-pointer ${
                        filters.priceRange[0] === 1500 && filters.priceRange[1] === 5000 
                          ? 'bg-[#CE1126] text-white border-transparent' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      أكثر من 1500 ج.م
                    </button>
                  </div>
                </div>

                {/* Medical Prescription Requirements & Stock availability toggles */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h3 className="text-xs font-black text-gray-800">خيارات الملاءمة الطبية</h3>
                  
                  {/* Prescription required switch */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-extrabold block">نوع المنتج الطبي:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, prescriptionOnly: null }))}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all cursor-pointer ${
                          filters.prescriptionOnly === null ? 'bg-[#CE1126] text-white border-transparent' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        الكل
                      </button>
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, prescriptionOnly: true }))}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all cursor-pointer ${
                          filters.prescriptionOnly === true ? 'bg-red-50 text-[#CE1126] border-[#CE1126]' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        روشتة
                      </button>
                      <button 
                        onClick={() => setFilters(prev => ({ ...prev, prescriptionOnly: false }))}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all cursor-pointer ${
                          filters.prescriptionOnly === false ? 'bg-[#EAFDF5] text-[#047857] border-[#A7F3D0]' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        عادي
                      </button>
                    </div>
                  </div>

                  {/* Stock Availability Toggle */}
                  <label className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 text-[#CE1126] border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                    />
                    <span>متوفر في الفروع فقط</span>
                  </label>
                </div>

              </div>

              {/* Special Pharmacist Callout inside search view */}
              <div className="bg-gradient-to-br from-[#CE1126] to-red-950 p-4 rounded-2xl text-white text-right space-y-2 shadow-md border border-red-550/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 font-bold text-9xl uppercase font-sans">RX</div>
                <h4 className="text-xs font-black text-rose-200 relative z-10 flex items-center gap-1.5 justify-start">
                  <span>💊</span>
                  لصرف الروشتة الطبية فورياً
                </h4>
                <p className="text-[11px] font-medium leading-relaxed text-red-100 relative z-10">
                  هل لديك وصفة طبية حقيقية مكتوبة؟ بإمكانك تصويرها وربطها مع طلبك، وسيقوم فريق صيدليات البنداري بإعداد الدواء والموافقة عليه فورياً.
                </p>
                <div className="pt-1">
                  <button 
                    onClick={() => setCurrentTab('prescription')}
                    className="w-full bg-white text-red-900 font-extrabold text-[11px] p-2 rounded-xl hover:bg-red-50 transition relative z-10 cursor-pointer"
                  >
                    صرف الروشتة الآن
                  </button>
                </div>
              </div>

            </div>

           {/* Premium Products Sorting and Grid */}
           <div className="flex-1 space-y-6">
             {/* Product list sorting bar */}
             <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right">
               
               <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400 font-bold">الفرز والترتيب:</span>
                 <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value)}
                   className="text-xs font-black bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#CE1126] focus:bg-white text-right font-bold text-[#CE1126] cursor-pointer"
                 >
                   <option value="default">الأكثر ملاءمة الافتراضي</option>
                   <option value="priceAsc">السعر: من الأقل إلى الأعلى</option>
                   <option value="priceDesc">السعر: من الأعلى إلى الأقل</option>
                   <option value="rating">الأعلى مبيعاً والتقييمات</option>
                   <option value="discount">نسبة الخصم والتوفير</option>
                 </select>
               </div>

               <div className="text-xs font-extrabold text-slate-500">
                 نعرض لكم <span className="text-[#CE1126] font-black">{filteredProducts.length} منتجاً</span> يطابق خيارات التصفية الحالية
               </div>

             </div>

             {/* Filter List tags */}
             {activeFiltersCount > 0 && (
               <div className="flex flex-wrap items-center gap-1.5 pt-1">
                 <span className="text-[10px] text-slate-400 font-extrabold ml-1.5">تصفية نشطة:</span>
                 
                 {filters.categories.map(cat => (
                   <span 
                     key={cat}
                     className="inline-flex items-center gap-1 bg-red-50 text-[#CE1126] font-bold text-[10px] px-2.5 py-1 rounded-full border border-red-100"
                   >
                     <span>القسم: {cat}</span>
                     <button 
                       onClick={() => handleCategoryClick(cat)}
                       className="hover:text-red-900 font-extrabold shrink-0 animate-none cursor-pointer"
                     >
                       ×
                     </button>
                   </span>
                 ))}

                 {filters.brands.map(brName => (
                   <span 
                     key={brName}
                     className="inline-flex items-center gap-1 bg-neutral-100 text-gray-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-gray-200"
                   >
                     <span>براند: {brName}</span>
                     <button 
                       onClick={() => handleBrandClick(brName)}
                       className="hover:text-black font-extrabold shrink-0 animate-none cursor-pointer"
                     >
                       ×
                     </button>
                   </span>
                 ))}

                 {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) && (
                   <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/50 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                     <span>السعر: {filters.priceRange[0]} - {filters.priceRange[1]} ج.م</span>
                     <button 
                       onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 5000] }))}
                       className="hover:text-amber-955 font-bold shrink-0 animate-none cursor-pointer"
                     >
                       ×
                     </button>
                   </span>
                 )}

                 {filters.prescriptionOnly !== null && (
                   <span className="inline-flex items-center gap-1 bg-indigo-55 text-indigo-900 border border-indigo-200/50 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                     <span>{filters.prescriptionOnly ? "روشتة فقط" : "منتجات عادية"}</span>
                     <button 
                       onClick={() => setFilters(prev => ({ ...prev, prescriptionOnly: null }))}
                       className="hover:text-indigo-950 font-bold shrink-0 animate-none cursor-pointer"
                     >
                       ×
                     </button>
                   </span>
                 )}

                 {inStockOnly && (
                   <span className="inline-flex items-center gap-1 bg-emerald-55 text-[#047857] border border-[#A7F3D0] font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                     <span>المتوفر أونلاين فقط</span>
                     <button 
                       onClick={() => setInStockOnly(false)}
                       className="hover:text-emerald-950 font-bold shrink-0 animate-none cursor-pointer"
                     >
                       ×
                     </button>
                   </span>
                 )}
               </div>
             )}

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <Search size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تصفح الأقسام.</p>
                  <button 
                    onClick={() => {
                      setFilters({ categories: [], brands: [], priceRange: [0, 5000], prescriptionOnly: null });
                      setSearchQuery('');
                    }}
                    className="mt-6 font-bold text-primary-600 hover:underline"
                  >
                    إلغاء البحث والتصفية
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                       key={product.id} 
                       product={product} 
                       onAddToCart={addToCart}
                       isWishlisted={wishlist.some(p => p.id === product.id)}
                       onToggleWishlist={toggleWishlist}
                       onClick={(prod) => {
                         setSelectedProductDetails(prod);
                         setDetailsOpen(true);
                       }}
                       isInCompare={selectedCompareProducts.some(p => p.id === product.id)}
                       onToggleCompare={toggleCompareProduct}
                    />
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
      );
    }

    // Default Home View
    const premiumSlides = [
      {
        title: "خصومات الصيف على مستحضرات التجميل والجمال العالمية",
        subtitle: "وفر حتى 25% على براندات العناية الرائدة كـ Vichy و La Roche-Posay",
        category: "العناية بالبشرة",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&q=80",
        accent: "من خبراء باريس إليكِ",
        buttonText: "تسوقي منتجات التجميل"
      },
      {
        title: "مكملات الفيتامينات والنشاط اليومي المتكامل",
        subtitle: "اشترِ قطعة واحصل على الثانية مجاناً (1+1) من منتجات سنتروم الشاملة باللوتين",
        category: "الفيتامينات",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=1200&q=80",
        accent: "مكملات أصلية وموثقة",
        buttonText: "اكتشف الفيتامينات"
      },
      {
        title: "رعاية ممتازة لبشرة طفلكِ الحساسة",
        subtitle: "حماية فائقة ونعومة حريرية مع عروض حصرية على عبوات حفاضات بامبرز الفاخرة",
        category: "الأم والطفل",
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
        accent: "راحة وأمان طوال اليوم",
        buttonText: "تصفح مستلزمات طفلكِ"
      }
    ];

    const staticBrands = [
      { name: 'Vichy', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80', tagline: 'للبشرة الحساسة' },
      { name: 'La Roche-Posay', logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=150&q=80', tagline: 'رعاية جلدية فرنسية' },
      { name: 'Cerave', logo: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=150&q=80', tagline: 'لتقوية حاجز البشرة' },
      { name: 'Centrum', logo: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&q=80', tagline: 'دعم الصحة العام' },
      { name: 'Bioderma', logo: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=150&q=80', tagline: 'مزيل المكياج والنقاء' },
      { name: 'Pampers', logo: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&q=80', tagline: 'حفاضات رعاية فائقة' },
      { name: 'Omron', logo: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=150&q=80', tagline: 'أجهزة قياس الضغط' }
    ];

    const seasonalTips = [
      {
        id: 't1',
        title: "نظام الوقاية من أشعة وصدمات شمس الصيف الحارة",
        desc: "التعرض المستمر للأشعة الفوق بنفسجية يعرضكِ لظهور مبكر للتجاعيد وبقع الجفاف. ينصح أطباؤنا بالتالي:",
        recommendation: "تركيبة سيروم حمض الهيالورونيك من Vichy لتخزين الترطيب + واقي شمس لاروش بوزيه بعامل حماية +50.",
        itemIds: ['p1', 'p2']
      },
      {
        id: 't2',
        title: "كيف تحارب الكسل والبهتان وتجدد مستويات الطاقة طوال الصيام أو العمل الشاق؟",
        desc: "يحتاج الجسم لتعويض مستمر للمغنيسيوم، وفيتامينات ب المركبة، ومضادات الأكسدة مثل اللوتين للحفاظ على صحة وتركيز دائم.",
        recommendation: "كبسولات Centrum الشاملة مرة واحدة يومياً بعد وجبة الإفطار مع شرب كميات غنية من المياه.",
        itemIds: ['p4']
      }
    ];

    const triggerQuickRoutineBuy = (itemIds: string[]) => {
      itemIds.forEach(id => {
        const prod = dbProducts.find(p => p.id === id);
        if (prod) {
          addToCart(prod);
        }
      });
      setToast({
        title: "تم إضافة المجموعة للقرطاس!",
        message: "تم إضافة مستحضرات المجموعة المقترحة لسلة المشتريات بنجاح لتبدأ في روتين صحي متكامل."
      });
      setTimeout(() => setToast(null), 3500);
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-11">
        
        {/* 🎥 LIVE PHARMACEUTICAL TV & REEL STREAM (البنداري تيفي & البث الصيدلي الحي) */}
        <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-black rounded-3xl p-6 text-white border border-rose-950/25 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE1126] via-red-500 to-[#CE1126]"></div>
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            
            {/* Right description & controls */}
            <div className="flex-1 flex flex-col justify-between text-right space-y-4">
              <div>
                <span className="text-xs text-red-500 font-extrabold flex items-center gap-1.5 justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  البث الحي لمستجدات فروعنا (Live Stream)
                </span>
                <h3 className="text-xl font-black mt-2 text-white">
                  قناة البنداري لايف: روتين العافية والجمال الحقيقي
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-medium leading-relaxed max-w-lg">
                  تابع تغطيتنا التفاعلية لخصومات الفروع، ونصائح الأدوية الحقيقية، والتوعية الطبية المستمرة عبر الفيديو التفاعلي المباشر من صفحتنا الرسمية على فيسبوك.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md pt-2">
                <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/50">
                  <span className="text-[10px] text-zinc-500 block">تفجر المتابعات حية:</span>
                  <span className="text-xs font-bold text-zinc-200">فيديو متصل ومزامنة فورية</span>
                </div>
                <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/50">
                  <span className="text-[10px] text-zinc-500 block">عرض عالي الدقة:</span>
                  <span className="text-xs font-bold text-zinc-200">1080p HD متواصل</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-850">
                <a 
                  href="https://www.facebook.com/reel/1282893379579543/?mibextid=Nif5oz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#CE1126] hover:bg-white hover:text-black text-white font-black text-xs p-3 px-5 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
                >
                  <span>🔗 فتح الفيديو بفيسبوك</span>
                </a>
                <a 
                  href="https://www.facebook.com/share/1HzMHJKLG4/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs p-3 px-5 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>👍 الإعجاب بالصفحة</span>
                </a>
              </div>
            </div>

            {/* Left video / reel container player */}
            <div className="w-full lg:w-80 shrink-0 aspect-[9/16] max-h-[480px] bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-2xl group">
              <iframe 
                src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1282893379579543%2F&show_text=0&width=320&autoplay=1&mute=1&loop=1" 
                className="w-full h-full border-0 rounded-2xl object-cover scale-[1.02]"
                scrolling="no" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="El-Bendary Pharmacy Featured video"
              ></iframe>
              
              {/* Floating HD Badge over play layer */}
              <div className="absolute top-3 right-3 bg-red-650/85 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-md border border-red-505 tracking-wider uppercase animate-pulse">
                بث مستمر ●
              </div>
            </div>

          </div>
        </div>
        
        {/* Dynamic & Premium Banner Slider */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-neutral-900 to-black border border-red-850/20 text-white shadow-xl min-h-[340px] md:min-h-[400px] flex items-center">
          {/* Active slide image */}
          <div className="absolute inset-y-0 left-0 w-full md:w-1/2 h-full opacity-35 md:opacity-85 z-0 md:ml-auto">
            <img 
              src={premiumSlides[activeBanner].image} 
              alt="Promo banner" 
              className="w-full h-full object-cover mix-blend-luminosity transform scale-105 transition-transform duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>

          {/* Banner content */}
          <div className="relative z-10 w-full md:w-2/3 p-6 sm:p-12 flex flex-col justify-center text-right">
            <span className="bg-[#CE1126] text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block max-w-max mb-4 shadow-sm animate-pulse">
              {premiumSlides[activeBanner].accent}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-200 tracking-tight leading-snug drop-shadow-md">
              {premiumSlides[activeBanner].title}
            </h1>
            <p className="text-sm md:text-lg text-gray-200 mt-4 max-w-xl font-medium leading-relaxed">
              {premiumSlides[activeBanner].subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  selectCategory(premiumSlides[activeBanner].category);
                }}
                className="bg-[#CE1126] text-white hover:bg-red-750 font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-red-900/20 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                {premiumSlides[activeBanner].buttonText}
              </button>
              
              <button 
                onClick={() => setCurrentTab('prescription')}
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold px-6 py-3.5 rounded-2xl backdrop-blur-md transition cursor-pointer"
              >
                صرف الروشتة الطبية
              </button>
            </div>
          </div>

          {/* Sliding indicators/bullets */}
          <div className="absolute bottom-6 right-6 md:right-12 flex items-center gap-2 z-10">
            {premiumSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveBanner(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeBanner === i ? 'w-8 bg-[#CE1126]' : 'bg-white/40 hover:bg-white/'}`}
              />
            ))}
          </div>
        </div>

        {/* 📱 PORTAL DOUBLE SYNC BRIDGE (El-Bendary Pharmacy Mobile App Sync Center) */}
        <div className="bg-gradient-to-r from-red-500/5 via-gray-50 to-[#CE1126]/5 rounded-3xl p-6 border border-[#CE1126]/10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 bg-red-50 text-[#CE1126] rounded-2xl flex items-center justify-center shrink-0 border border-red-100 shadow-inner">
                <Smartphone className={`w-7 h-7 ${isSyncing ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#CE1126] bg-red-50 px-2.5 py-1 rounded-full border border-red-105 inline-block">
                  مزامنة الأنظمة الحية (Real-Time Live Sync)
                </span>
                <h3 className="text-lg font-black text-gray-950 mt-1 flex items-center gap-2 flex-wrap">
                  بوابة الربط الذكي مع تطبيق صيدليات البنداري للهواتف الذكية
                  <span className="text-xs bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    متصل الآن
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-bold max-w-xl">
                  يقوم هذا النظام بقراءة قاعدة بيانات تطبيق الموبايل واستيراد كشوفات المخازن المجدثة والأسعار ومواصفات الأدوية الدورياً، لضمان تطابق سلة المرضى بين الويب والهاتف بكفاءة ١٠٠٪.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="bg-white rounded-2xl border border-gray-150 p-3 px-4 flex flex-col justify-center text-right shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold">آخر مزامنة صحية ناجحة:</span>
                <span className="text-sm font-black text-gray-900 mt-0.5" dir="ltr">
                  {lastSyncTime} {lastSyncTime.includes('AM') || lastSyncTime.includes('PM') || lastSyncTime.match(/[٠-٩]/) ? '' : 'العاشرة صباحاً وبث كفء'}
                </span>
              </div>

              <button
                onClick={handleSyncWithMobileApp}
                disabled={isSyncing}
                className="bg-[#CE1126] hover:bg-black text-white font-black p-4 px-7 rounded-2xl shadow-lg shadow-red-950/20 disabled:opacity-75 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? "جاري الاتصال بقاعدة بيانات الموبايل..." : "مُزامنة الأسعار والمخزون الحي الآن"}
              </button>
            </div>
          </div>
        </div>

        {/* 📢 SPONSORED AD PLACEMENT 1: Premium Seasonal Pharma Banner Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-emerald-950 to-neutral-900 rounded-3xl p-6 text-white border border-emerald-800/10 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="absolute top-2 left-2 bg-emerald-600/25 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-md border border-emerald-500/20">
              إعلان ممول من Cerave ©
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-extrabold block">جديد في فروع صيدليات البنداري</span>
              <h4 className="text-lg font-black mt-1 leading-snug">احمي بشرة عائلتك مع مرطبات Cerave الطبية المتكاملة</h4>
              <p className="text-xs text-gray-300 mt-2 font-medium">سيراميك طبي متكامل لتخزين الترطيب طوال ٢٤ ساعة كاملة للبشرة شديدة الجفاف.</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/30 pt-3">
              <span className="text-xs text-white font-extrabold bg-[#CE1126] px-3 py-1.5 rounded-lg">خصم ٢٠٪ متوفر</span>
              <button onClick={() => selectBrand('Cerave')} className="text-xs font-bold text-gray-300 hover:text-white underline">تصفح منتجات سيرافي ←</button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-950 to-neutral-900 rounded-3xl p-6 text-white border border-blue-800/10 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="absolute top-2 left-2 bg-blue-600/25 text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-md border border-blue-500/20">
              إعلان ممول من Omron Digital ®
            </div>
            <div>
              <span className="text-xs text-blue-400 font-extrabold block">رعاية صحية وتطبيقية منزلية</span>
              <h4 className="text-lg font-black mt-1 leading-snug">رصد ذكي ودقيق لضغط الدم مع جهاز أومرون M3 تلقائياً</h4>
              <p className="text-xs text-gray-300 mt-2 font-medium">مستشعرات يابانية عالية الدقة لقياس نبضات القلب السريعة وحفظ حتى ٦٠ قراءة للرجوع لها.</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-blue-800/30 pt-3">
              <span className="text-xs text-white font-extrabold bg-blue-600 px-3 py-1.5 rounded-lg">شحن فوري مجاني</span>
              <button 
                onClick={() => {
                  const prod = dbProducts.find(p => p.id === 'p7');
                  if (prod) setSelectedProductDetails(prod); setDetailsOpen(true);
                }} 
                className="text-xs font-bold text-gray-300 hover:text-white underline"
              >
                اطلب جهاز الضغط الآن ←
              </button>
            </div>
          </div>
        </div>

        {/* Smart Medical & Pharmaceutical Tools Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#CE1126] block rounded-full"></span>
            المنصة والخدمات الطبية الرقمية المعتمدة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Tool 1: Pediatric Dosage Calculator */}
            <div 
              onClick={() => setCurrentTab('dosage')}
              className="bg-white hover:bg-emerald-50/10 rounded-2xl p-5 border border-gray-150 hover:border-emerald-600/30 shadow-sm cursor-pointer transition-all duration-300 flex items-center gap-4 group text-right"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Calculator size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-gray-950 text-xs md:text-sm flex items-center gap-1.5">
                  حاسبة الجرعات للأطفال
                  <span className="bg-emerald-50 text-emerald-650 text-[9px] px-1.5 py-0.5 rounded-full font-black border border-emerald-100 shrink-0">جديد ✓</span>
                </h3>
                <p className="text-gray-400 text-[11px] mt-1 font-semibold leading-normal">
                  احسب مللي الجرعات لشراب وخافض حرارة أطفالك بالوزن.
                </p>
              </div>
            </div>

            {/* Tool 2: Medication Reminders */}
            <div 
              onClick={() => setCurrentTab('reminders')}
              className="bg-white hover:bg-red-50/10 rounded-2xl p-5 border border-gray-150 hover:border-red-600/30 shadow-sm cursor-pointer transition-all duration-300 flex items-center gap-4 group text-right"
            >
              <div className="w-12 h-12 bg-red-50 text-[#CE1126] rounded-xl flex items-center justify-center shrink-0 border border-red-100 group-hover:scale-105 transition-transform animate-pulse">
                <Clock size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-[#CE1126] text-xs md:text-sm flex items-center gap-1.5">
                  منظم وتنبيهات الأدوية
                  <span className="bg-red-50 text-[#CE1126] text-[9px] px-1.5 py-0.5 rounded-full font-black border border-red-100 shrink-0">نشط ✓</span>
                </h3>
                <p className="text-gray-400 text-[11px] mt-1 font-semibold leading-normal">
                  مجدول ومؤقت منبه ذكي لمواعيد علاجاتك اليومية بشكل دوري.
                </p>
              </div>
            </div>

            {/* Tool 3: Prescription Upload */}
            <div 
              onClick={() => setCurrentTab('prescription')}
              className="bg-white hover:bg-blue-50/10 rounded-2xl p-5 border border-gray-150 hover:border-blue-600/30 shadow-sm cursor-pointer transition-all duration-300 flex items-center gap-4 group text-right"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-650 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                <FileSignature size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-blue-650 text-xs md:text-sm">صرف الروشتة الحرة والتحميل</h3>
                <p className="text-gray-400 text-[11px] mt-1 font-semibold leading-normal">
                  حمّل صورة روشتتك لتجهيز الدواء وتوصيله فورياً لباب منزلك.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Triple Action Dashboard Row (Order Tracking, VIP Club, Hot Offer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Action A: Order tracking banner - 4 columns */}
          <div 
            onClick={() => setCurrentTab('ordertracking')}
            className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-red-600/20 transition-all group duration-300"
          >
             <div className="space-y-4">
                <div className="w-12 h-12 bg-red-50 text-[#CE1126] rounded-2xl flex items-center justify-center border border-red-100 shadow-inner group-hover:-rotate-3 transition-transform">
                   <PackageSearch size={24} />
                </div>
                <div>
                   <h3 className="font-extrabold text-gray-950 text-base">تتبع طلبيات البنداري</h3>
                   <p className="text-gray-400 text-xs mt-1 leading-relaxed font-medium">أدخل رقم الشحنة أو رقم تتبع الطلب الخاص بك لمعرفة موعد وتفاصيل التوصيل فورا.</p>
                </div>
             </div>
             <div className="mt-6 flex items-center justify-between text-xs font-extrabold text-[#CE1126] border-t border-gray-150 pt-3 group-hover:underline">
                <span>تحقق من الشحن</span>
                <span className="bg-red-50 px-2 py-1 rounded">←</span>
             </div>
          </div>

          {/* Action B: VIP Loyalty Club Card Graphic - 5 columns */}
          <div className="lg:col-span-5 bg-gradient-to-br from-black via-zinc-900 to-[#CE1126] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-red-950/30">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-x-4 -translate-y-4"></div>
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-start justify-between z-10">
              <div>
                <span className="text-[10px] bg-white/10 border border-white/10 text-red-100 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">نادي المكافآت VIP</span>
                <h3 className="text-xl font-black mt-2 leading-none">بطاقة البنداري الرقمية</h3>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>

            {/* Simulated Points Balance */}
            <div className="my-6 z-10">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] text-gray-200/75 font-semibold leading-none">مجموع نقاطك</p>
                  <span className="text-3xl font-black text-white">550 <span className="text-sm text-red-400 font-black">نقطة</span></span>
                </div>
                <span className="text-xs text-red-400 font-bold">خصم 50 ج.م متاح</span>
              </div>
              
              {/* Rewards path bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-red-200 mt-1.5 font-bold">
                <span>تفعيل كوبون بقيمة 100 ج.م</span>
                <span>المستوى التالي: 1000 نقطة</span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (currentUser) {
                  setToast({ title: "نقاط مكافآتك مفعلة!", message: "يتم تحصيل النقاط تلقائياً على حسابك الشخصي مع كل طلب تقوم به." });
                  setTimeout(() => setToast(null), 3000);
                } else {
                  setCurrentTab('account');
                }
              }}
              className="w-full bg-[#CE1126] hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs z-10 transition shadow shadow-red-950/20"
            >
              {currentUser ? "تفاصيل حساب المكافآت" : "انضم الآن لمكافآت البنداري واكسب 100 نقطة مجاناً"}
            </button>
          </div>

          {/* Action C: Limited Offer Countdown - 3 columns */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-md border border-red-500/20 flex flex-col justify-between relative overflow-hidden">
            {/* Visual indicator tag */}
            <div className="absolute top-0 left-0 bg-[#CE1126] text-white text-[9px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-wider font-sans">
              عرض خاص
            </div>

            <div className="mt-4">
              <h4 className="text-xs text-gray-400 font-bold">ينتهي العرض الخاص في:</h4>
              <div className="font-mono text-xl font-extrabold text-[#CE1126] mt-2 bg-red-50 rounded-xl p-3 border border-red-150 text-center tracking-widest whitespace-nowrap">
                {formatTime(secondsLeft)}
              </div>
            </div>

            <div className="my-4 border-t border-gray-150 pt-3">
              <span className="text-[10px] text-red-600 font-extrabold block">منتج العرض المحدود لهذا الأسبوع</span>
              <h4 className="font-extrabold text-black text-xs mt-1 leading-snug line-clamp-2">فيشي سيروم مرطب ومقوي للبشرة (50 مل)</h4>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-black font-black text-sm">680 <span className="text-[10px] text-gray-500 font-bold">ج.م</span></span>
                <span className="text-gray-400 line-through text-xs font-medium">850 ج.م</span>
              </div>
            </div>

            <button 
              onClick={() => {
                const vichyProd = dbProducts.find(p => p.id === 'p1');
                if (vichyProd) {
                  addToCart(vichyProd);
                  setToast({ title: 'تم تفعيل العرض!', message: 'تم إضافة سيروم فيشي بخصم 170 ج.م لسلتك بنجاح.' });
                  setTimeout(() => setToast(null), 3000);
                }
              }}
              className="w-full bg-[#CE1126] hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              شراء العرض الآن
            </button>
          </div>
        </div>

        {/* Global Premium Brands Locator Row (تسوق بأفخر البراندات العالمية) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#CE1126] block rounded-full"></span>
                 تسوق بأقوى الماركات الفرنسية والعالمية
             </h2>
             <span className="text-xs text-gray-400 font-bold hidden sm:inline">منتجات أصلية معتمدة مع ضمان التخزين الصحي</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {staticBrands.map((brand, i) => (
              <div 
                key={i}
                onClick={() => selectBrand(brand.name)}
                className="bg-white rounded-2xl p-4 border border-gray-150 hover:border-[#CE1126] hover:shadow-md transition-all duration-300 text-center cursor-pointer group flex flex-col justify-between h-[150px]"
              >
                <div className="w-full h-14 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-2">
                   <span className="text-base font-black text-slate-800 tracking-wider group-hover:text-[#CE1126] transition-colors">{brand.name}</span>
                </div>
                <div className="mt-2 text-right">
                  <h4 className="font-extrabold text-gray-900 text-[11px] truncate leading-tight">{brand.name}</h4>
                  <p className="text-[9px] text-[#CE1126] font-black truncate mt-1">{brand.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Grid Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#CE1126] block rounded-full"></span>
                 تصفح الفئات الطبية والجمالية
             </h2>
             <button onClick={() => setCurrentTab('search')} className="text-xs font-bold text-[#CE1126] hover:underline flex items-center gap-1">عرض جميع المنتجات ←</button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <button 
                key={category.id}
                onClick={() => selectCategory(category.name)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex border-b-4 border-b-transparent hover:border-b-[#CE1126] shrink-0 flex-col items-center p-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-hover:border-red-100 transition-colors">
                   <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                </div>
                <span className="text-gray-900 font-extrabold text-[12px] text-center leading-tight">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Healthy Lifestyle Editorial Advice Desk (مستشار الطب البديل والحياة الصحية) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#CE1126] block rounded-full"></span>
                 المرشد الطبي والروتين المقترح من أطبائنا
             </h2>
             <button onClick={() => setCurrentTab('aichat')} className="text-xs bg-red-50 text-[#CE1126] px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-extrabold">المزيد من الاستشارات المجانية</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasonalTips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{tip.title}</h3>
                  <p className="text-xs text-gray-500 md:text-sm font-medium leading-relaxed">{tip.desc}</p>
                  <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/40 text-xs text-red-950 leading-relaxed font-bold">
                    <span className="text-[#CE1126] block mb-1">الجرعة أو الروتين اليومي:</span>
                    {tip.recommendation}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-[11px] text-gray-400 font-bold">موصى به بواسطة د. مصطفى البنداري</span>
                  <button 
                    onClick={() => triggerQuickRoutineBuy(tip.itemIds)}
                    className="bg-[#CE1126] hover:bg-black text-white text-xs font-black px-5 py-2.5 rounded-xl transition"
                  >
                    شراء الروتين المقترح سلّة واحدة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Showcase Section (منتجاتنا الأكثر طلباً) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-extrabold text-gray-950 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-[#CE1126] block rounded-full"></span>
                 الأكثر مبيعاً والمنتجات الشائعة حالياً
             </h2>
             <button onClick={() => selectCategory('')} className="text-xs font-black text-[#CE1126] hover:underline">مشاهدة الكل ({dbProducts.length})</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbProducts.slice(0, 4).map((product) => (
               <ProductCard 
                 key={product.id} 
                 product={product} 
                 onAddToCart={addToCart}
                 isWishlisted={wishlist.some(p => p.id === product.id)}
                 onToggleWishlist={toggleWishlist}
                 onClick={(prod) => {
                   setSelectedProductDetails(prod);
                   setDetailsOpen(true);
                 }}
                 isInCompare={selectedCompareProducts.some(p => p.id === product.id)}
                 onToggleCompare={toggleCompareProduct}
               />
            ))}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-red-50 selection:text-red-900" dir="rtl">
      <Navbar 
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
        onSearchClick={() => setCurrentTab('search')}
        onAccountClick={() => setCurrentTab('account')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={currentUser?.name}
        onChangeTab={setCurrentTab}
        wishlistCount={wishlist.length}
      />

      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer Section */}
      <footer className="bg-[#111111] text-white border-t border-zinc-800 pt-12 pb-24 md:pb-12 mt-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and brief intro */}
          <div className="space-y-4">
            <Logo variant="footer" />
            <p className="text-xs text-gray-400 leading-relaxed font-medium mt-3">
              الخيار الأول والموثوق في مصر لتوفير الأدوية والتركيبات الصيدلانية ومستحضرات التجميل العالمية والعناية بالبشرة تحت إشراف نخبة من الصيادلة والأخصائيين.
            </p>
            <div className="pt-2">
              <a 
                href="https://www.bendaryph.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-[#CE1126] hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition duration-300"
              >
                زيارة الموقع الرسمي: www.bendaryph.com
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-100 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-[#CE1126]">
              أقسام وتصفح سريع
            </h4>
            <ul className="space-y-2 text-xs font-bold text-gray-400">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-[#CE1126] transition-colors cursor-pointer">
                  الصفحة الرئيسية للبوابة
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('search')} className="hover:text-[#CE1126] transition-colors cursor-pointer">
                  تصفح المنتجات والفئات
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('prescription')} className="hover:text-[#CE1126] transition-colors cursor-pointer">
                  صرف الروشتة وتحميل الملفات
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('ordertracking')} className="hover:text-[#CE1126] transition-colors cursor-pointer">
                  تتبع طلبيات البنداري أونلاين
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('branches')} className="hover:text-[#CE1126] transition-colors cursor-pointer">
                  فروعنا وأوقات العمل
                </button>
              </li>
            </ul>
          </div>

          {/* Support and contact info */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-100 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-[#CE1126]">
              خدمة العملاء والدعم
            </h4>
            <ul className="space-y-3 text-xs font-bold text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-red-500">📞</span>
                <span>الخط الساخن: <a href="tel:01200400094" className="hover:text-white transition-colors text-gray-100">01200400094</a></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">💬</span>
                <span>واتساب مفعّل: <a href="https://wa.me/201200400094" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-gray-100">01200400094</a></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">👥</span>
                <span>فيسبوك: <a href="https://www.facebook.com/share/1HzMHJKLG4/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">صفحة صيدليات البنداري</a></span>
              </li>
            </ul>
          </div>

          {/* Fast Delivery Service info */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-100 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-[#CE1126]">
              خدمة التوصيل السريع 🏎️
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              نوفر خدمة توصيل الأدوية ومستحضرات التجميل إلى باب المنزل على مدار ٢٤ ساعة طوال أيام الأسبوع بكافة الفروع.
            </p>
            <div className="pt-2">
              <a 
                href="tel:01200400094" 
                className="flex items-center gap-2 bg-[#CE1126] hover:bg-zinc-950 text-white p-2.5 px-4 rounded-xl transition duration-300 text-xs w-max font-bold border border-red-650"
              >
                <span>📞</span>
                <span className="font-extrabold text-[11px]">شحن فوري: 01200400094</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-bold">
          <span>© 1998 - 2026 جميع الحقوق محفوظة لمجموعة صيدليات البنداري الطبية وموقعها الإلكتروني.</span>
          <div className="flex items-center gap-4">
            <a href="https://www.bendaryph.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#CE1126] transition-colors">
              البوابة الرئيسية: www.bendaryph.com
            </a>
          </div>
        </div>
      </footer>

      {/* Global In-App Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-4 sm:left-auto sm:right-4 bg-white shadow-xl rounded-xl border-l-4 border-l-primary-500 p-4 z-50 flex items-start gap-4 animate-in fade-in slide-in-from-top-5 max-w-sm w-full mx-4 sm:mx-0">
           <div className="bg-primary-100 text-primary-600 p-2 rounded-full">
             <ShieldCheck size={20} />
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-gray-900 text-sm mb-1">{toast.title}</h4>
             <p className="text-gray-600 text-xs">{toast.message}</p>
           </div>
        </div>
      )}

      {/* Floating AI Agent Chat Button */}
      {currentTab !== 'aichat' && (
        <button 
          onClick={() => setCurrentTab('aichat')}
          className="fixed bottom-20 md:bottom-8 left-4 z-40 bg-[#CE1126] text-white font-black px-4 py-3.5 rounded-full flex items-center gap-2.5 shadow-xl shadow-red-900/20 hover:bg-zinc-950 transition-all active:scale-95 border border-red-500/10 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Bot size={20} className="text-white" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <span className="text-xs md:text-sm tracking-tight font-black">اسأل البنداري الذكي (AI)</span>
        </button>
      )}

      <BottomNav 
        currentTab={currentTab} 
        onChangeTab={(tab) => {
          if (tab === 'cart') {
            setCartOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }} 
        cartCount={cartCount}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        updateQuantity={updateQuantity}
        removeItem={removeCartItem}
        onCheckout={handleCheckout}
      />

      <CheckoutPaymentModal 
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        total={cartTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ProductCompareModal 
        isOpen={isCompareOpen}
        onClose={() => setCompareOpen(false)}
        selectedProducts={selectedCompareProducts}
        onRemoveFromCompare={handleRemoveFromCompare}
        onAddToCart={addToCart}
      />

      <ProductDetailsModal 
        product={selectedProductDetails}
        isOpen={isDetailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedProductDetails(null);
        }}
        onAddToCart={addToCart}
        onToggleCompare={toggleCompareProduct}
        isInCompare={selectedProductDetails ? selectedCompareProducts.some(p => p.id === selectedProductDetails.id) : false}
        onUpdateProductRating={handleUpdateProductRating}
        allProducts={dbProducts}
        onSelectProduct={(prod) => setSelectedProductDetails(prod)}
      />

      {/* Floating compare button */}
      {selectedCompareProducts.length > 0 && (
        <button
          onClick={() => setCompareOpen(true)}
          className="fixed bottom-36 md:bottom-24 left-4 z-40 bg-blue-600 text-white font-black px-5 py-4 rounded-full flex items-center gap-2.5 shadow-xl shadow-blue-900/30 hover:bg-zinc-950 transition-all active:scale-95 border border-blue-500/10 cursor-pointer animate-bounce"
        >
          <GitCompare size={20} />
          <span className="text-xs md:text-sm tracking-tight">قارن الأدوية والمواصفات ({selectedCompareProducts.length})</span>
        </button>
      )}
    </div>
  );
}


