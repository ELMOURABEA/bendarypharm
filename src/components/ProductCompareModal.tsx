import React from 'react';
import { X, Check, ShoppingCart, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onRemoveFromCompare,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all w-full max-w-5xl border border-gray-150 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                ⚖️
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-950">مقارنة المنتجات والمواصفات الطبية</h3>
                <p className="text-xs text-gray-500 font-bold">مقارنة سريعة لتسهيل اختيار العلاج المناسب لحالتك</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-x-auto p-6">
            {selectedProducts.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">
                  🔍
                </div>
                <h4 className="text-lg font-extrabold text-gray-900 mb-2">لم تقم باختيار منتجات للمقارنة بعد</h4>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  قم بإضافة منتجات من الصفحة الرئيسية أو صفحة البحث لمقارنة الأسعار والمواصفات الطبية مباشرة في هذا الجدول.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-6 bg-[#CE1126] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-transform hover:scale-[1.02]"
                >
                  العودة للتصفح
                </button>
              </div>
            ) : selectedProducts.length === 1 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-red-50 text-primary-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                  ⚖️
                </div>
                <h4 className="text-lg font-extrabold text-gray-900 mb-2">اختر منتجاً آخر للمقارنة</h4>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  لقد قمت بتحديد منتج واحد فقط ({selectedProducts[0].name}). اختر منتجاً إضافياً من المتجر لتفعيل المقارنة الثنائية.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-6 bg-[#CE1126] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-transform hover:scale-[1.02]"
                >
                  إضافة المزيد من المنتجات
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[700px] border-collapse text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <td className="w-48 py-4 font-black text-gray-900 bg-gray-50/50 px-4 rounded-rt-xl">المواصفات</td>
                    {selectedProducts.map((p) => (
                      <th key={p.id} className="py-4 px-4 font-extrabold text-right relative group min-w-[180px]">
                        <button 
                          onClick={() => onRemoveFromCompare(p.id)}
                          className="absolute -top-1 left-2 p-1.5 rounded-full bg-red-50 text-red-600 opacity-60 hover:opacity-100 transition-opacity"
                          title="إزالة من المقارنة"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="w-24 h-24 mx-auto mb-3 bg-gray-50 rounded-xl p-2 flex items-center justify-center">
                          <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="text-[10px] text-primary-600 font-extrabold tracking-wide uppercase mb-1">{p.brand}</div>
                        <div className="text-xs text-gray-900 leading-snug line-clamp-2" title={p.name}>{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {/* Price */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">السعر الحالي</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 font-black text-primary-600 text-base">
                        {p.price.toFixed(2)} ج.م
                        {p.originalPrice && (
                          <span className="block text-xs font-medium text-gray-400 line-through mt-0.5">
                            {p.originalPrice.toFixed(2)} ج.م
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Brand & Category */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">البراند / القسم</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 font-semibold text-gray-800">
                        <span className="bg-gray-150 px-2 py-1 rounded text-xs font-bold block mb-1 max-w-max text-slate-800">{p.brand}</span>
                        <span className="text-xs text-gray-500 font-bold block">{p.category}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Prescription requirement */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">روشتة طبية مطلوبة؟</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 font-bold">
                        {p.prescriptionRequired ? (
                          <span className="inline-flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg text-xs">
                            <AlertCircle size={14} /> نعم، تتطلب روشتة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-lg text-xs">
                            <ShieldCheck size={14} /> لا تتطلب
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Rating / reviews qty */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">التقييم وآراء المرضى</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 font-semibold">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-amber-500">⭐</span>
                          <span className="text-sm font-extrabold text-gray-900">{p.rating} / 5</span>
                        </div>
                        <span className="text-xs text-gray-400 font-bold">({p.reviews} تقييم مسجل)</span>
                      </td>
                    ))}
                  </tr>

                  {/* Stock Status */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">حالة التوفر</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 font-bold">
                        {p.inStock ? (
                          <span className="text-green-600 text-xs flex items-center gap-1">
                            <Check size={14} /> متوفر بكافة الفروع
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs flex items-center gap-1">
                            <X size={14} /> غير متوفر حالياً
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30">الوصف والمواصفات الطبية</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4 text-xs text-gray-600 leading-relaxed font-semibold min-w-[200px]">
                        <p className="line-clamp-4 hover:line-clamp-none transition-all duration-300 pointer-events-auto" title="انقر لتوسيع الوصف">
                          {p.description}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Quick Action Add to Cart */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500 bg-gray-50/30 rounded-rb-xl">أفعال سريعة</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="py-4 px-4">
                        <button
                          onClick={() => {
                            onAddToCart(p);
                            onClose();
                          }}
                          disabled={!p.inStock}
                          className="w-full bg-[#CE1126] text-white hover:bg-black font-extrabold py-2 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <ShoppingCart size={14} />
                          <span>شراء المنتج</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Note */}
          {selectedProducts.length >= 2 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-bold">
              <span>جميع الأسعار شاملة ضريبة القيمة المضافة ومطابقة للتسعيرة الإجبارية لوزارة الصحة.</span>
              <button 
                onClick={onClose}
                className="text-[#CE1126] hover:underline"
              >
                متابعة تصفح المنتجات الأخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
