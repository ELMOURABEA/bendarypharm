import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Wallet, Truck, AlertCircle, CheckCircle, Receipt, Download, RefreshCw, Landmark } from 'lucide-react';
import { CartItem, Product, Order } from '../types';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onPaymentSuccess: (paymentDetails: {
    paymentMethod: 'Card' | 'Wallet' | 'Cash' | 'PayPal';
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
    transactionId: string;
  }) => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  total,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'PayPal' | 'Wallet' | 'Cash'>('Card');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Wallet states
  const [walletPhone, setWalletPhone] = useState('');
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    id: string;
    transactionId: string;
    gateway: string;
    paymentMethod: string;
    paymentStatus: string;
    date: string;
  } | null>(null);

  if (!isOpen) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Format Card Expiry Month/Year (adds slash)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(value);
  };

  const executePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    // Prepare Request Payload
    const tempOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`;
    const payload: any = {
      amount: total,
      orderId: tempOrderId,
      paymentMethod: paymentMethod,
    };

    if (paymentMethod === 'Card') {
      payload.cardDetails = {
        number: cardNumber,
        expiry: cardExpiry,
        cvc: cardCvc,
        name: cardName
      };
    } else if (paymentMethod === 'Wallet') {
      payload.walletDetails = {
        phone: walletPhone
      };
    }

    try {
      const response = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'عذراً، فشلت عملية تفويض الدفع لدى بوابة البنك.');
      }

      // Successful receipt setup
      const receipt = {
        id: tempOrderId,
        transactionId: data.transactionId,
        gateway: data.gateway || 'PCI-DSS Securitas',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        date: new Date().toISOString()
      };

      setSuccessReceipt(receipt);

      // Trigger actual order placement in main state
      // (Using a brief timeout for animation feeling)
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          transactionId: data.transactionId
        });
      }, 500);

    } catch (err: any) {
      console.error('Payment failure:', err);
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء معالجة الدفع. يرجى تجربة بطاقة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!successReceipt) return;
    alert('تم حفظ نسخة رقمية من الفاتورة بنجاح على جهازك.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden text-right dir-rtl max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-[#CE1126] rounded-xl flex items-center justify-center border border-red-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-950">بوابة الدفع الآمنة للبنداري</h3>
              <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                تشفير آمن SSL 256-Bit متوافق مع معايير PCI-DSS Global
              </p>
            </div>
          </div>
          {!successReceipt && !isProcessing && (
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SUCCESS RECEIPT VIEW */}
          {successReceipt ? (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-900">تمت المغادرة وإكمال الدفع بنجاح!</h4>
                <p className="text-xs text-gray-500 font-medium">سعداء لخدمتكِ، تم تسجيل طلبك وتعميده في صيدليات البنداري الطبية.</p>
              </div>

              {/* Secure printable receipt details */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-right space-y-4 max-w-sm mx-auto shadow-inner relative">
                <div className="absolute top-0 left-0 bg-green-600 text-white text-[9px] font-black px-3 py-1 rounded-br-2xl">
                  مدفوع بالكامل
                </div>
                
                <h5 className="font-extrabold text-sm border-b border-gray-200 pb-2 text-zinc-800 flex items-center gap-2">
                  <Receipt size={16} className="text-[#CE1126]" />
                  تفاصيل إيصال الدفع الإلكتروني
                </h5>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <span className="text-gray-400 font-bold">رقم الطلب:</span>
                  <span className="text-gray-900 font-black text-left">{successReceipt.id}</span>

                  <span className="text-gray-400 font-bold">المرجع البنكي للدفع:</span>
                  <span className="text-gray-900 font-black text-left font-mono truncate">{successReceipt.transactionId}</span>

                  <span className="text-gray-400 font-bold">بوابة الدفع الوسيطة:</span>
                  <span className="text-gray-900 font-black text-left">{successReceipt.gateway}</span>

                  <span className="text-gray-400 font-bold">طريقة الدفع المستخدمة:</span>
                  <span className="text-[#CE1126] font-black text-left">{successReceipt.paymentMethod === 'Card' ? 'بطاقة ائتمان (Stripe)' : successReceipt.paymentMethod}</span>

                  <span className="text-gray-400 font-bold">حالة الفاتورة:</span>
                  <span className="text-green-700 font-black text-left">مقبولة ومؤكدة حظياً</span>

                  <span className="text-gray-400 font-bold">تاريخ المعاملة:</span>
                  <span className="text-gray-900 font-bold text-left text-[11px]">
                    {new Date(successReceipt.date).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-gray-900">المبلغ الإجمالي المدفوع:</span>
                  <span className="font-black text-green-700 font-mono text-base">{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* Receipt Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-4">
                <button 
                  onClick={handleDownloadReceipt}
                  className="flex-1 bg-zinc-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                >
                  <Download size={14} />
                  تحميل الفاتورة PDF
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 rounded-xl transition duration-200 cursor-pointer"
                >
                  العودة للبوابة وحسابي
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ORDER SUMMARY BANNER */}
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs text-gray-500 font-bold">سلتك الحالية تتضمن:</h4>
                  <p className="font-black text-[#CE1126] text-sm mt-1">{items.length} منتجات في انتظار الشحن الآمن</p>
                </div>
                <div className="text-left">
                  <h4 className="text-xs text-gray-400 font-extrabold pb-0.5">القيمة الإجمالية:</h4>
                  <span className="text-lg font-black text-gray-900">{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* PAYMENT SELECTOR */}
              <div className="space-y-3">
                <label className="text-xs text-gray-400 font-extrabold block">اختر وسيلة الدفع المعتمدة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Stripe Credit Card */}
                  <button 
                    type="button"
                    onClick={() => { setPaymentMethod('Card'); setErrorMsg(null); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                      paymentMethod === 'Card' 
                        ? 'border-[#CE1126] bg-red-50/40 shadow-sm text-[#CE1126] font-extrabold' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 font-bold'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] leading-none">بطاقة ائتمان</span>
                  </button>

                  {/* PayPal */}
                  <button 
                    type="button"
                    onClick={() => { setPaymentMethod('PayPal'); setErrorMsg(null); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                      paymentMethod === 'PayPal' 
                        ? 'border-[#CE1126] bg-red-50/40 shadow-sm text-[#CE1126] font-extrabold' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 font-bold'
                    }`}
                  >
                    <Landmark className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] leading-none">حساب PayPal</span>
                  </button>

                  {/* Wallet */}
                  <button 
                    type="button"
                    onClick={() => { setPaymentMethod('Wallet'); setErrorMsg(null); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                      paymentMethod === 'Wallet' 
                        ? 'border-[#CE1126] bg-red-50/40 shadow-sm text-[#CE1126] font-extrabold' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 font-bold'
                    }`}
                  >
                    <Wallet className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] leading-none">محافظ ذكية</span>
                  </button>

                  {/* Cash */}
                  <button 
                    type="button"
                    onClick={() => { setPaymentMethod('Cash'); setErrorMsg(null); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                      paymentMethod === 'Cash' 
                        ? 'border-[#CE1126] bg-red-50/40 shadow-sm text-[#CE1126] font-extrabold' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 font-bold'
                    }`}
                  >
                    <Truck className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] leading-none">عند الاستلام</span>
                  </button>

                </div>
              </div>

              {/* ERROR DISPLAY */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200/50 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-xs font-bold animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* PAYMENT FORMS */}
              <form onSubmit={executePayment} className="space-y-4">
                
                {/* 1. CREDIT CARD FORM */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4 bg-gray-50 border border-gray-150 rounded-2xl p-5">
                    <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3 mb-2">
                      <CreditCard size={14} className="text-[#CE1126]" />
                      تفاصيل البطاقة البنكية الآمنة
                    </h4>

                    {/* Cardholder name */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 font-bold">اسم صاحب البطاقة (اسم الحامل)</label>
                      <input 
                        type="text"
                        required
                        disabled={isProcessing}
                        placeholder="AL-BENDARY CUSTOMER"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 text-xs font-extrabold placeholder-gray-300 tracking-wide dir-ltr text-left focus:outline-none focus:border-[#CE1126]"
                      />
                    </div>

                    {/* Card number */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 font-bold">رقم بطاقة الائتمان</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          disabled={isProcessing}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-xs font-extrabold placeholder-gray-300 tracking-wider dir-ltr text-left focus:outline-none focus:border-[#CE1126]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                      </div>
                    </div>

                    {/* Expiry and CVC Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500 font-bold">تاريخ الانتهاء</label>
                        <input 
                          type="text"
                          required
                          disabled={isProcessing}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 text-xs font-extrabold placeholder-gray-300 tracking-widest text-center dir-ltr focus:outline-none focus:border-[#CE1126]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500 font-bold">رمز التحقق الأمني (CVV)</label>
                        <input 
                          type="password"
                          required
                          disabled={isProcessing}
                          placeholder="***"
                          value={cardCvc}
                          onChange={handleCvcChange}
                          className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 text-xs font-bold placeholder-gray-300 tracking-widest text-center dir-ltr focus:outline-none focus:border-[#CE1126]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PAYPAL FORM */}
                {paymentMethod === 'PayPal' && (
                  <div className="space-y-4 bg-gray-50 border border-gray-150 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-900">الاتصال بـ PayPal الخارجي</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-sm mx-auto">
                      سيتم فتح نافذة آمنة تماماً للموافقة على الدفع من رصيد PayPal الخاص بك لإكمال عملية الشراء في لحظات.
                    </p>
                  </div>
                )}

                {/* 3. MOBILE WALLET FORM */}
                {paymentMethod === 'Wallet' && (
                  <div className="space-y-4 bg-gray-50 border border-gray-150 rounded-2xl p-5">
                    <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3 mb-2">
                      <Wallet size={14} className="text-[#CE1126]" />
                      محافظ كاش الإلكترونية (Vodafone/Etisalat/Orange)
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 font-bold">رقم الهاتف المصاحب للمحفظة</label>
                      <input 
                        type="text"
                        required
                        disabled={isProcessing}
                        placeholder="01200400094"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3 text-xs font-extrabold placeholder-gray-300 tracking-wider dir-ltr text-left focus:outline-none focus:border-[#CE1126]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                      * يرجى إدخال رقم هاتف المحفظة المتنقلة بشكل صحيح. سيتم إرسال رسالة USSD من شبكة الاتصالات لتأكيد المعاملة بمرور ثوانٍ.
                    </p>
                  </div>
                )}

                {/* 4. CASH FORM */}
                {paymentMethod === 'Cash' && (
                  <div className="space-y-4 bg-gray-50 border border-gray-150 rounded-2xl p-5 text-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-900">الدفع عند الاستلام (COD)</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-sm mx-auto">
                      يمكنك الدفع نقدًا بمجرد تسلّم المنتجات الطبية من مندوب التوصيل لصيدليات البنداري. تنطبق رسوم التوصيل المعتادة.
                    </p>
                  </div>
                )}

                {/* PAY ACTION FOOTER */}
                <div className="pt-4 shrink-0 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold block">قيمة السداد:</span>
                    <span className="text-xl font-black text-gray-900 font-mono">{total.toFixed(2)} <span className="text-xs text-gray-500 font-bold font-sans">ج.م</span></span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="bg-[#CE1126] hover:bg-black text-white text-xs font-black px-8 py-3.5 rounded-xl flex items-center gap-2 transition duration-250 shrink-0 disabled:opacity-55 cursor-pointer shadow-md shadow-[#CE1126]/10"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        تأمين وتفويض المعاملة...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {paymentMethod === 'Card' ? 'تفويض البطاقة والدفع' : 
                         paymentMethod === 'PayPal' ? 'الدفع بواسطة PayPal' : 
                         paymentMethod === 'Wallet' ? 'تأكيد ودفع بالمحفظة' : 
                         'تأكيد طلب الدفع عند الاستلام'}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
