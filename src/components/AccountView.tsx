import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Heart, Package, XCircle, Edit2, Trash2, Plus, Save, Phone, Mail, Check, X 
} from 'lucide-react';
import { Order, User as UserType, Product } from '../types';
import { OrderProgress } from './OrderProgress';
import { ProductCard } from './ProductCard';

interface AccountProps {
  user: UserType | null;
  orders: Order[];
  onLogout: () => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCancelOrder?: (orderId: string) => void;
  onClickProduct?: (product: Product) => void;
  selectedCompareProducts?: Product[];
  onToggleCompare?: (product: Product) => void;
  onUpdateProfile?: (updated: { name: string; phone: string; addresses: any[] }) => void;
}

export const AccountView: React.FC<AccountProps> = ({ 
  user, 
  orders, 
  onLogout, 
  wishlist, 
  onToggleWishlist, 
  onAddToCart, 
  onCancelOrder,
  onClickProduct,
  selectedCompareProducts,
  onToggleCompare,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  // Personal profile editing state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState(false);

  // Addresses editing state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressDetails, setNewAddressDetails] = useState('');

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddressLabel, setEditAddressLabel] = useState('');
  const [editAddressDetails, setEditAddressDetails] = useState('');

  // Sync profile editing fields with user updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  if (!user) return null;

  // Handler to submit profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setIsSubmittingProfile(true);
    setProfileSuccessMessage(false);

    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          addresses: user.addresses || []
        });
      }
      setProfileSuccessMessage(true);
      setTimeout(() => setProfileSuccessMessage(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Handler to add a new shipping address
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel.trim() || !newAddressDetails.trim()) return;

    const newAddr = {
      id: "A-" + Date.now(),
      label: newAddressLabel.trim(),
      details: newAddressDetails.trim()
    };

    const updatedAddresses = [...(user.addresses || []), newAddr];

    if (onUpdateProfile) {
      onUpdateProfile({
        name: user.name,
        phone: user.phone || '',
        addresses: updatedAddresses
      });
    }

    setNewAddressLabel('');
    setNewAddressDetails('');
    setIsAddingAddress(false);
  };

  // Handler to start editing an address
  const startEditingAddress = (id: string, currentLabel: string, currentDetails: string) => {
    setEditingAddressId(id);
    setEditAddressLabel(currentLabel);
    setEditAddressDetails(currentDetails);
  };

  // Handler to submit an updated address
  const handleSaveEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddressLabel.trim() || !editAddressDetails.trim() || !editingAddressId) return;

    const updatedAddresses = (user.addresses || []).map(addr => 
      addr.id === editingAddressId 
        ? { ...addr, label: editAddressLabel.trim(), details: editAddressDetails.trim() } 
        : addr
    );

    if (onUpdateProfile) {
      onUpdateProfile({
        name: user.name,
        phone: user.phone || '',
        addresses: updatedAddresses
      });
    }

    setEditingAddressId(null);
    setEditAddressLabel('');
    setEditAddressDetails('');
  };

  // Handler to delete a shipping address
  const handleDeleteAddress = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنوان من حسابك؟')) {
      const updatedAddresses = (user.addresses || []).filter(addr => addr.id !== id);
      
      if (onUpdateProfile) {
        onUpdateProfile({
          name: user.name,
          phone: user.phone || '',
          addresses: updatedAddresses
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 text-right font-sans" dir="rtl">
      
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50/50 rounded-3xl border border-red-100 p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#CE1126] text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md border-4 border-white">
            {user.name ? user.name.charAt(0) : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-950">{user.name}</h3>
              <span className="bg-[#CE1126]/10 text-[#CE1126] text-[10px] px-2.5 py-0.5 rounded-full font-black border border-red-100/30">عميل مميز 💎</span>
            </div>
            <p className="text-gray-500 text-xs mt-1 font-semibold flex items-center justify-end md:justify-start gap-1">
              <span>{user.phone || 'لم يتم تسجيل رقم هاتف'}</span>
              <span>•</span>
              <span>عضو منذ ٢٠٢٦</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="text-white bg-[#CE1126] hover:bg-red-700 px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-md shadow-red-600/10 cursor-pointer"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden mb-8 p-1">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'orders' ? 'bg-[#CE1126] text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'}`}
        >
          <Package size={16} /> طلباتي ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'wishlist' ? 'bg-[#CE1126] text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'}`}
        >
          <Heart size={16} /> المفضلة ({wishlist.length})
        </button>
        <button 
          onClick={() => setActiveTab('addresses')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'addresses' ? 'bg-[#CE1126] text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'}`}
        >
          <MapPin size={16} /> العناوين ({user.addresses?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'profile' ? 'bg-[#CE1126] text-white shadow-md' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'}`}
        >
          <User size={16} /> تعديل الحساب
        </button>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-150">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Package size={30} />
                </div>
                <h3 className="text-gray-950 font-black text-sm mb-1">لا توجد طلبات سابقة بعد</h3>
                <p className="text-gray-400 text-xs">قم بتصفح الصيدلية وإضافة المستلزمات الطبية والبدء في الشحن والتوصيل.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden transition hover:shadow-md">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-950 text-base">رقم طلبك: #{order.id}</span>
                        <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tight">رقمي المرجعي</span>
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-1.5 flex items-center gap-1.5 justify-end sm:justify-start">
                        <span>بتاريخ:</span>
                        <span>
                          {new Date(order.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Interactive Secure payment indicators */}
                      <div className="flex flex-wrap gap-2 mt-3.5">
                        {order.paymentMethod && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-red-50 text-[#CE1126] border border-red-100">
                            🛡️ {order.paymentMethod === 'Card' ? 'بطاقة ائتمانية (بوابة آمنة)' : 
                                order.paymentMethod === 'PayPal' ? 'PayPal بوابة' :
                                order.paymentMethod === 'Wallet' ? 'محفظة إلكترونية كاش' : 'الدفع نقدًا عند الاستلام'}
                          </span>
                        )}
                        {order.paymentStatus && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                            order.paymentStatus === 'Paid' 
                              ? 'bg-green-50 text-green-705 border-green-200' 
                              : 'bg-amber-50 text-amber-705 border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                            {order.paymentStatus === 'Paid' ? 'مدفوع ومؤكد' : 'الدفع عند التوصيل'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left flex flex-col items-end gap-2 shrink-0">
                      <span className="text-lg font-black text-[#CE1126]">
                        {order.total.toFixed(2)} <span className="text-xs">ج.م</span>
                      </span>
                      {(order.status === 'Pending' || order.status === 'Confirmed') && onCancelOrder && (
                        <button 
                          onClick={() => onCancelOrder(order.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition border border-red-200 hover:border-red-500 bg-red-50/20 px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          <XCircle size={13} /> إلغاء الطلب بالكامل
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress tracker */}
                  <div className="mb-6">
                    <OrderProgress status={order.status} />
                  </div>

                  {/* Order items lists */}
                  <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4">
                    <h4 className="font-extrabold text-xs text-gray-901 mb-3">تفاصيل ومحتويات هذا اللوت الشحني:</h4>
                    <ul className="space-y-2.5">
                      {order.items.map(item => (
                        <li key={item.product.id} className="flex justify-between items-center text-xs">
                          <span className="text-gray-700 font-extrabold">{item.quantity}x {item.product.name}</span>
                          <span className="text-gray-900 font-black">{(item.product.price * item.quantity).toFixed(2)} ج.م</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-150">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Heart size={30} />
                </div>
                <h3 className="text-gray-950 font-black text-sm mb-1">المفضلة لديك فارغة</h3>
                <p className="text-gray-400 text-xs mb-3">يمكنك تصفح المنتجات في المتجر وحفظ منتجاتك المفضلة هنا لسهولة الشراء لاحقاً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart}
                    isWishlisted={true}
                    onToggleWishlist={onToggleWishlist}
                    onClick={onClickProduct}
                    isInCompare={selectedCompareProducts ? selectedCompareProducts.some(p => p.id === product.id) : false}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHIPPING ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
              <div>
                <h3 className="font-black text-gray-950 text-sm">عناوين الشحن المحفوظة</h3>
                <p className="text-gray-405 text-xs font-semibold mt-1">قم بإعداد وتحديث العناوين لتسريع إتمام الطلبات تلقائياً.</p>
              </div>
              <button 
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-4 shadow text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                {isAddingAddress ? <X size={15} /> : <Plus size={15} />}
                {isAddingAddress ? 'إلغاء' : 'إضافة عنوان'}
              </button>
            </div>

            {/* Inline Address Creation Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="bg-emerald-50/20 border border-emerald-200 p-5 rounded-3xl space-y-4 shadow-sm">
                <h4 className="font-black text-emerald-950 text-xs pb-2 border-b border-emerald-100/50">إضافة عنوان شحن جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-gray-700">تسمية العنوان (مثال: المنزل، العمل)</label>
                    <input 
                      type="text" 
                      required
                      value={newAddressLabel}
                      onChange={e => setNewAddressLabel(e.target.value)}
                      placeholder="امكتب مسمى مريح لتمييزه"
                      className="w-full bg-white px-3 py-2.5 border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#CE1126] focus:border-[#CE1126] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-extrabold text-gray-700">العنوان بالتفصيل (الشارع، الطابق، رقم الشقة)</label>
                    <input 
                      type="text" 
                      required
                      value={newAddressDetails}
                      onChange={e => setNewAddressDetails(e.target.value)}
                      placeholder="اكتب المحافظة، المدينة، الشارع ورقم المربع السكني بدقة"
                      className="w-full bg-white px-3 py-2.5 border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#CE1126] focus:border-[#CE1126] outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-5 text-xs font-black shadow transition cursor-pointer"
                  >
                    حفظ العنوان الجديد ✓
                  </button>
                </div>
              </form>
            )}

            {/* Edit Mode Overlay Forms & List of Addresses */}
            <div className="space-y-4">
              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-150">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <MapPin size={30} />
                  </div>
                  <h3 className="text-gray-950 font-black text-sm mb-1">لا توجد عناوين شحن مضافة أمثولة</h3>
                  <p className="text-gray-400 text-xs">يرجى إضافة عنوان شحن واحد على الأقل ليتم التوصيل من خلاله.</p>
                </div>
              ) : (
                user.addresses.map(address => (
                  <div key={address.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm">
                    {editingAddressId === address.id ? (
                      /* Address editing mode form */
                      <form onSubmit={handleSaveEditAddress} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">تسمية العنوان:</label>
                            <input 
                              type="text" 
                              required
                              value={editAddressLabel}
                              onChange={e => setEditAddressLabel(e.target.value)}
                              className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-xl font-bold text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700">العنوان بالتفصيل:</label>
                            <input 
                              type="text" 
                              required
                              value={editAddressDetails}
                              onChange={e => setEditAddressDetails(e.target.value)}
                              className="w-full bg-gray-50 px-3 py-2 border border-gray-200 rounded-xl font-bold text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow cursor-pointer"
                          >
                            حفظ التعديل
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setEditingAddressId(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Standard view of address block */
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-50 text-[#CE1126] p-3 rounded-2xl border border-red-100">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <span className="font-black text-gray-950 text-sm">{address.label}</span>
                            <p className="text-gray-500 font-semibold text-xs mt-1.5 leading-relaxed">{address.details}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditingAddress(address.id, address.label, address.details)}
                            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-50 transition cursor-pointer"
                            title="تعديل العنوان"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-2 border border-gray-200 rounded-xl text-red-500 hover:text-white hover:bg-[#CE1126] transition cursor-pointer"
                            title="حذف العنوان"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 4: PERSONAL PROFILE EDITING */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <span className="text-xl">🛠️</span>
              <div>
                <h3 className="font-extrabold text-gray-950 text-sm">تحديث بيانات الحساب والملف الشخصي</h3>
                <p className="text-gray-400 text-[10px] font-bold mt-1">قم بتعديل وتحديث معلوماتك الأساسية لتصلك عروض البنداري الحصرية والتواصل الدقيق.</p>
              </div>
            </div>

            {profileSuccessMessage && (
               <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-black mb-6 flex items-center gap-2">
                 <Check size={16} /> تم تعديل البيانات بنظام صيدليات البنداري بنجاح!
               </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full name field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-700">الاسم بالكامل:</label>
                  <input 
                    type="text" 
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl font-extrabold text-xs focus:ring-2 focus:ring-[#CE1126] focus:border-[#CE1126] outline-none"
                    placeholder="امثال: محمد المرابع"
                  />
                </div>

                {/* Phone field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-700">رقم الهاتف الجوال :</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 pr-10 rounded-2xl font-extrabold text-xs focus:ring-2 focus:ring-[#CE1126] focus:border-[#CE1126] outline-none text-left"
                      placeholder="01200400094"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400/80">
                      <Phone size={14} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Login Identifier Details Note */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                <div className="bg-gray-200/50 p-2 text-gray-600 rounded-lg shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-950">معرّف حسابك الرئيسي غير قابل للتعديل:</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed mt-1">
                    يعتبر البريد الإلكتروني <span className="font-mono text-gray-900 bg-gray-200/50 px-1 py-0.5 rounded text-[10px]">{user.id === 'U-default-admin' ? 'm.elmourabea@gmail.com' : 'حساب تأمين آمن'}</span> هو المعرّف الخاص بحسابك لإثبات ملكيتك للمستلزمات والشحنات، ولهذا لا يسمح بتسليمها لمعرّف مجهول.
                  </p>
                </div>
              </div>

              {/* Submit triggers saving */}
              <div className="flex justify-start">
                <button 
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="bg-[#CE1126] hover:bg-red-700 text-white font-black text-xs px-6 py-4.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-red-600/10 cursor-pointer disabled:bg-gray-400"
                >
                  <Save size={15} />
                  {isSubmittingProfile ? 'جاري حفظ التغييرات...' : 'حفظ التغييرات وتحديث الحساب'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
};
