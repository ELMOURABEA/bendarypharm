import React, { useState, useEffect, useMemo } from 'react';
import { X, Star, ShoppingCart, Plus, Check, ShieldAlert, GitCompare, MessageSquare } from 'lucide-react';
import { Product } from '../types';

interface PatientReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  isInCompare: boolean;
  onUpdateProductRating: (productId: string, newReviewsCount: number, averageRating: number) => void;
  allProducts: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleCompare,
  isInCompare,
  onUpdateProductRating,
  allProducts,
  onSelectProduct
}) => {
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [patientName, setPatientName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Compute related products of the same category
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, allProducts]);

  if (!isOpen || !product) return null;

  // Initial load of reviews specific to the product ID from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`elb_reviews_${product.id}`);
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Error parsing product reviews", e);
      }
    } else {
      // Seed default helpful reviews
      const seedReviews: PatientReview[] = [
        {
          id: 'rev-1',
          userName: 'أحمد محمود (مستشار طبي)',
          rating: 5,
          date: '2026-06-10',
          comment: 'منتج ممتاز وفعال للغاية وحاز على إعجاب أخصائيي العناية بالبشرة بفروع البنداري. أنصح به كروتين يومي.',
          isVerified: true,
        },
        {
          id: 'rev-2',
          userName: 'مها الشربيني',
          rating: 4,
          date: '2026-06-08',
          comment: 'أشتريه دائماً من صيدليات البنداري لسرعة توصيله وضمان النخبة الطبية. المفعول يظهر بعد بضعة أيام استخدام.',
          isVerified: true,
        }
      ];
      setReviews(seedReviews);
      localStorage.setItem(`elb_reviews_${product.id}`, JSON.stringify(seedReviews));
    }
    
    // Reset Form on modal change
    setNewRating(5);
    setNewComment('');
    setPatientName('');
    setSubmitSuccess(false);
  }, [product.id]);

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !patientName.trim()) return;

    const newRev: PatientReview = {
      id: 'rev-' + Date.now(),
      userName: patientName,
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      comment: newComment,
      isVerified: true
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`elb_reviews_${product.id}`, JSON.stringify(updatedReviews));

    // Calculate new average rating & reviews quantity
    const totalReviews = updatedReviews.length;
    const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1));
    
    // Call back to update main product catalog ratings
    onUpdateProductRating(product.id, totalReviews, avgRating);

    setNewComment('');
    setPatientName('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all w-full max-w-4xl border border-gray-150 flex flex-col md:flex-row max-h-[92vh]">
          
          {/* Close trigger absolute */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>

          {/* Left panel: Product visual presentation & core pricing */}
          <div className="w-full md:w-5/12 bg-gray-50/50 p-6 flex flex-col justify-between border-l border-gray-150">
            <div className="flex-1 flex items-center justify-center min-h-[220px] max-h-[300px]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply p-4"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <span className="text-[10px] bg-red-50 text-primary-600 font-extrabold px-3 py-1 rounded-full uppercase">
                  {product.brand}
                </span>
                <h3 className="text-lg font-extrabold text-gray-950 mt-2 leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1">القسم الداخلي: {product.category}</p>
              </div>

              <div className="flex items-center gap-1.5 py-1.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'} 
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-gray-900">{product.rating} من 5</span>
                <span className="text-[10px] text-gray-400 font-bold">({reviews.length} مراجعة مريض)</span>
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-[#CE1126]">
                    {product.price.toFixed(2)} <span className="text-xs">ج.م</span>
                  </span>
                  {product.originalPrice && (
                    <span className="block text-xs font-medium text-gray-400 line-through">
                      {product.originalPrice.toFixed(2)} ج.م
                    </span>
                  )}
                </div>

                <div className="text-xs">
                  {product.inStock ? (
                    <span className="text-green-700 font-extrabold bg-green-50 px-2.5 py-1 rounded-full">
                      ✓ متوفر {product.stockQuantity !== undefined ? `(${product.stockQuantity} وحدة بمخازننا)` : 'للشحن الفوري'}
                    </span>
                  ) : (
                    <span className="text-red-500 font-extrabold bg-red-50 px-2.5 py-1 rounded-full">غير متوفر حالياً ⚠️</span>
                  )}
                </div>
              </div>

              {product.prescriptionRequired && (
                <div className="p-3 bg-orange-50 text-orange-800 rounded-xl text-xs font-bold leading-relaxed border border-orange-100 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-orange-600 shrink-0 mt-0.5" />
                  <span>تنبيه: هذا دواء يخضع للرقابة الصحية ويشترط تحميل روشتة طبية سارية المفعول لتوصيله.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Detail Specifications, Comparison Toggles, and Patient Reviews System */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
            <div className="space-y-6">
              
              {/* Core Description */}
              <div>
                <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 mb-2 flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-red-650 block rounded"></span>
                  نظرة طبية عامة
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {product.description}
                </p>

                {/* Dynamic Google Images Helper to fetch real product photos as requested */}
                <div className="bg-gradient-to-l from-red-50/20 via-gray-50/80 to-red-50/20 border border-red-100/65 rounded-2xl p-4 mt-4 text-right">
                  <h5 className="text-[11px] font-black text-gray-900 flex items-center gap-1.5 justify-start">
                    <span className="text-[#CE1126]">🌐 بوابة البحث والتحقق من صور المنتجات الحية</span>
                  </h5>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-semibold">
                    هل ترغب في مطابقة العلبة الخارجية والمواصفات البصرية للمستحضر من قاعدة بيانات صور Google الطبية؟ قمنا ببرمجة رابط ديناميكي للبحث الفوري والتحقق الآمن.
                  </p>
                  <button
                    onClick={() => {
                      window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(product.name + ' ' + product.brand)}`, '_blank');
                    }}
                    className="mt-3 w-full bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-bold py-2.5 px-3 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>عرض صور {product.brand} ومستحضراته الحية في Google Images ↗</span>
                  </button>
                </div>
              </div>

              {/* Layout Actions: Comparer Toggle & Addition */}
              <div className="flex gap-4">
                <button
                  onClick={() => onToggleCompare(product)}
                  className={`flex-1 text-xs font-black py-3 px-4 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                    isInCompare 
                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                      : 'bg-white text-gray-700 hover:text-black border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <GitCompare size={15} />
                  <span>{isInCompare ? "✓ مضاف للمقارنة الطبية" : "قارن مع منتجات بديلة"}</span>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.inStock}
                  className="flex-1 bg-[#CE1126] hover:bg-black text-white font-black text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={15} />
                  <span>إضافة لسلة الشراء</span>
                </button>
              </div>

              {/* Reviews & Ratings Segment */}
              <div>
                <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#CE1126]" />
                  آراء المراجعين والمرضى ({reviews.length})
                </h4>

                {/* Submitting form */}
                <form onSubmit={handleCreateReview} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-4 mb-6">
                  <p className="text-xs font-extrabold text-gray-950">أضف مراجعتك الشخصية أو نصيحتك للمرضى الآخرين:</p>
                  
                  {submitSuccess && (
                    <div className="bg-green-50 text-green-800 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-green-100">
                      ✓ تم تسجيل تقييمك الطبي بنجاح ومزامنته بذكاء في منصة البنداري!
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Stars Selector */}
                    <div className="shrink-0">
                      <span className="block text-[10px] font-black text-gray-500 mb-1">التقييم بالنجوم:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewRating(idx + 1)}
                            className="text-amber-400 text-lg hover:scale-110 transition duration-150"
                          >
                            {idx < newRating ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Patient Name */}
                    <div className="flex-1">
                      <span className="block text-[10px] font-black text-gray-500 mb-1">الاسم بالكامل:</span>
                      <input 
                        type="text"
                        required
                        placeholder="مثال: د. صفاء كامل، زائر..."
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold leading-none focus:outline-none focus:border-[#CE1126] transition"
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <span className="block text-[10px] font-black text-gray-500 mb-1">ملاحظاتك ومراجعتك:</span>
                    <input 
                      type="text"
                      required
                      placeholder="كيف كانت فعاليتك مع العلاج أو استخدامه؟"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-[#CE1126] transition"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg transition"
                    >
                      إرسال التقييم
                    </button>
                  </div>
                </form>

                {/* Reviews list render */}
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-gray-400 italic font-bold">لا توجد مراجعات مسجلة لهذا الدواء بعد. كن أول من يضيف تقييمه!</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col justify-between gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-950 text-right">{r.userName}</span>
                            {r.isVerified && (
                              <span className="bg-green-50 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full border border-green-100 font-bold">مريض معتمد ✓</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">{r.date}</span>
                        </div>

                        {/* rating display */}
                        <div className="flex text-amber-400 text-[10px]">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>

                        <p className="text-gray-600 font-semibold leading-relaxed leading-snug">
                          {r.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Related Products: منتجات قد تهمك */}
              {relatedProducts.length > 0 && (
                <div className="pt-6 border-t border-gray-150 text-right">
                  <h4 className="text-sm font-black text-gray-900 mb-3.5 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#CE1126] block rounded"></span>
                    منتجات قد تهمك (من نفس الفئة)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedProducts.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => onSelectProduct?.(p)}
                        className="bg-gray-50/70 hover:bg-red-50/20 border border-gray-150 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:border-red-300 group"
                      >
                        <div className="w-14 h-14 mx-auto mb-2 bg-white rounded-xl p-1 flex items-center justify-center border border-gray-100 shrink-0">
                          <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition" />
                        </div>
                        <div className="text-[9px] text-[#CE1126] font-black block mb-0.5">{p.brand}</div>
                        <div className="text-[10px] text-gray-900 font-extrabold line-clamp-2 h-7 leading-normal mb-2" title={p.name}>{p.name}</div>
                        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-gray-150">
                          <span className="text-xs font-black text-[#CE1126]">
                            {p.price.toFixed(2)} <span className="text-[9px]">ج.م</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(p);
                            }}
                            className="bg-[#CE1126]/10 text-[#CE1126] hover:bg-[#CE1126] hover:text-white p-1 rounded-lg transition shrink-0 cursor-pointer"
                            title="أضف للسلة"
                          >
                            <ShoppingCart size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
