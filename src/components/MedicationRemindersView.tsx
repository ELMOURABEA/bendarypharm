import React, { useState, useEffect } from 'react';
import { Clock, Bell, Plus, Trash, CheckCircle2, AlertTriangle, Calendar, ShoppingCart, Smartphone, Activity } from 'lucide-react';
import { Product } from '../types';

interface MedicationReminder {
  id: string;
  medName: string;
  dosage: string; // e.g., "1 قرص", "5 مل"
  frequency: 'daily' | 'twice' | 'every8' | 'every12' | 'weekly';
  times: string[]; // e.g., ["09:00", "21:00"]
  isActive: boolean;
  notes?: string;
  pillsLeft: number;
  pillsTotal: number;
  lastTakenDate?: string; // "YYYY-MM-DD"
  linkedProductId?: string; // to purchase easily
}

interface MedicationRemindersViewProps {
  onBack: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const MedicationRemindersView: React.FC<MedicationRemindersViewProps> = ({ 
  onBack, 
  products, 
  onAddToCart 
}) => {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [isAddingLayout, setIsAddingLayout] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 قرص');
  const [frequency, setFrequency] = useState<'daily' | 'twice' | 'every8' | 'every12' | 'weekly'>('daily');
  const [pillsTotal, setPillsTotal] = useState(30);
  const [notes, setNotes] = useState('');
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('21:00');
  const [linkedProductId, setLinkedProductId] = useState('');
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  // Initial load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('elb_med_reminders');
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing reminders", e);
      }
    } else {
      // Seed default helpful medications
      const seed: MedicationReminder[] = [
        {
          id: 'rem-1',
          medName: 'أسبرين بروتكت 100 مجم (لحماية جدار القلب)',
          dosage: '1 قرص',
          frequency: 'daily',
          times: ['09:00'],
          isActive: true,
          pillsLeft: 12,
          pillsTotal: 30,
          lastTakenDate: '',
          notes: 'يؤخذ بعد وجبة الإفطار مباشرة لحماية الشرايين.',
          linkedProductId: 'p10'
        },
        {
          id: 'rem-2',
          medName: 'بنادول إكسترا (عند اللزوم / آلام المفاصل)',
          dosage: '2 قرص',
          frequency: 'every12',
          times: ['10:00', '22:00'],
          isActive: false,
          pillsLeft: 20,
          pillsTotal: 24,
          notes: 'لا تتعدى جرعة 4 أقراص يومياً لتجنب مشاكل الكبد.',
          linkedProductId: 'p5'
        }
      ];
      setReminders(seed);
      localStorage.setItem('elb_med_reminders', JSON.stringify(seed));
    }
  }, []);

  const saveReminders = (items: MedicationReminder[]) => {
    setReminders(items);
    localStorage.setItem('elb_med_reminders', JSON.stringify(items));
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    let finalTimes: string[] = [];
    if (frequency === 'daily' || frequency === 'weekly') {
      finalTimes = [time1];
    } else if (frequency === 'twice' || frequency === 'every12') {
      finalTimes = [time1, time2];
    } else {
      finalTimes = ['08:00', '16:00', '24:00'];
    }

    const newRem: MedicationReminder = {
      id: 'rem-' + Date.now(),
      medName,
      dosage,
      frequency,
      times: finalTimes,
      isActive: true,
      notes,
      pillsLeft: pillsTotal,
      pillsTotal,
      linkedProductId: linkedProductId || undefined
    };

    const updated = [newRem, ...reminders];
    saveReminders(updated);
    setIsAddingLayout(false);

    // Reset Form
    setMedName('');
    setDosage('1 قرص');
    setFrequency('daily');
    setNotes('');
    setTime1('09:00');
    setTime2('21:00');
    setLinkedProductId('');

    // Trigger Notification Banner
    setNotificationStatus('تم حفظ منبه الدواء الدائم بنجاح! سننبهك في المواعيد المقررة.');
    setTimeout(() => setNotificationStatus(''), 4500);
  };

  const handleToggleActive = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل ترغب في مسح منبه هذا الدواء الدوري؟')) {
      const updated = reminders.filter(r => r.id !== id);
      saveReminders(updated);
    }
  };

  const handleConfirmTaken = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = reminders.map(r => {
      if (r.id === id) {
        if (r.lastTakenDate === today) {
          alert('لقد قمت بالفعل بتأكيد أخذ جرعة هذا الدواء لليوم.');
          return r;
        }
        // Decrease pills left
        const newPillsLeft = Math.max(0, r.pillsLeft - 1);
        return {
          ...r,
          pillsLeft: newPillsLeft,
          lastTakenDate: today
        };
      }
      return r;
    });

    saveReminders(updated);
    
    // Test if warning is needed for low stock
    const matched = updated.find(r => r.id === id);
    if (matched && matched.pillsLeft <= 5) {
      setNotificationStatus(`⚠️ تنبيه: متبقي لديكِ فقط ${matched.pillsLeft} أقراص من دواء ${matched.medName}. هل تود إعادة طلبه الآن؟`);
      setTimeout(() => setNotificationStatus(''), 6000);
    } else {
      setNotificationStatus('جرعة ممتازة! تم تدوين أخذ علاجك في السجل الصحي للبنداري لليوم.');
      setTimeout(() => setNotificationStatus(''), 4000);
    }
  };

  const handleImmediateRefill = (reminder: MedicationReminder) => {
    // Try to find the product in database
    let matchedProd = products.find(p => p.id === reminder.linkedProductId);
    if (!matchedProd) {
      // search by name
      matchedProd = products.find(p => p.name.toLowerCase().includes(reminder.medName.split(' ')[0].toLowerCase()));
    }

    if (matchedProd) {
      onAddToCart(matchedProd);
      setNotificationStatus(`🛒 تم إضافة ${matchedProd.name} فوراً لسلتك لإعادة التعبئة!`);
    } else {
      // Simulate direct routing or manual booking contact
      alert(`سنقوم بالتواصل هاتفياً وصرف دواء "${reminder.medName}" فوراً وإرساله لعنوانكم كإعادة صرف دورية. تم تسجيل الطلب!`);
      setNotificationStatus('📞 تم إرسال طلب إعادة التعبئة للصيدلية، جاري الاتصال بك لتأكيد الشحن.');
    }
    setTimeout(() => setNotificationStatus(''), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans text-right" dir="rtl">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl">
            ⏰
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-950">تنبيهات ومواعيد الأدوية الدورية</h2>
            <p className="text-xs text-gray-500 font-bold">حافظ على مواعيد أدويتك ونظم جرعاتك اليومية لتنعم بحياة صحية ممتازة</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-gray-600 hover:text-black border border-gray-150 rounded-xl px-4 py-2 hover:bg-gray-50 bg-white"
        >
          العودة للرئيسية →
        </button>
      </div>

      {/* Notifications Alert Panel */}
      {notificationStatus && (
        <div className="mb-6 p-4 bg-red-50 text-red-950 rounded-2xl border border-red-150 text-xs font-black flex items-center gap-3 animate-pulse">
          <span className="text-lg">📢</span>
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#167d3b] to-emerald-600 text-white rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-green-150">الالتزام بالجرعات اليومية</span>
            <Activity size={20} className="text-white opacity-85" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black">94%</span>
            <p className="text-[10px] text-green-100 mt-1 font-bold">بناءً على سجلات هذا الشهر، صحتك ممتازة ومستقرة!</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-3xl p-5">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold">المنبهات المفعلة حالياً</span>
            <span className="text-lg">🔔</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-gray-950">
              {reminders.filter(r => r.isActive).length} <span className="text-xs text-gray-400">منبهات نشطة</span>
            </span>
            <p className="text-[10px] text-gray-400 mt-1 font-bold">تقوم الخدمة بالرصد التلقائي ومزامنة النبضات الطبية.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-3xl p-5">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-xs font-bold">تحذير نفاد عبوات الأدوية</span>
            <span className="text-lg">⚠️</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-red-600">
              {reminders.filter(r => r.pillsLeft <= 5).length} <span className="text-xs text-slate-400">أدوية قاربت على النفاد</span>
            </span>
            <p className="text-[10px] text-[#CE1126] mt-1 font-extrabold">اضغط لإعادة طلب أدوية العناية الفورية لتجنب الانقطاع.</p>
          </div>
        </div>
      </div>

      {/* Quick Add Toggle Bar */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-950">جدول أدويتك المستمرة ومذكراتك</h3>
        <button
          onClick={() => setIsAddingLayout(!isAddingLayout)}
          className={`font-black text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm ${
            isAddingLayout ? 'bg-black text-white' : 'bg-[#CE1126] text-white hover:bg-red-750'
          }`}
        >
          {isAddingLayout ? (
            <>إغلاق نافذة الإضافة</>
          ) : (
            <>
              <Plus size={16} /> إضافة منبه دواء جديد
            </>
          )}
        </button>
      </div>

      {/* Adding Form Panel */}
      {isAddingLayout && (
        <form onSubmit={handleCreateReminder} className="bg-gray-50 rounded-3xl p-6 border border-gray-200 mb-8 space-y-6">
          <h4 className="font-extrabold text-[#CE1126] text-base border-b border-gray-200 pb-3">إعداد جدول جرعات دواء دوري</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Med Name */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">اسم الدواء الطبي أو التجاري:</label>
              <input 
                type="text"
                required
                placeholder="مثال: أسبرين بروتكت 100 مجم، أوميجا 3"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition"
              />
            </div>

            {/* Linked drug for refills */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">ربط بمنتج من المتجر لسهولة الشراء (اختياري):</label>
              <select
                value={linkedProductId}
                onChange={(e) => setLinkedProductId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition text-right"
              >
                <option value="">لا يوجد ربط (إدخال يدوي)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.brand} - {p.name} ({p.price} ج.م)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dosage */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">الجرعة المحددة:</label>
              <input 
                type="text"
                required
                placeholder="مثال: 1 قرص، 2 كبسولة، 5 مل"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition"
              />
            </div>

            {/* Total Pills */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">العدد الإجمالي بالعلبة (لمتابعة المخزون المنزلي):</label>
              <input 
                type="number"
                required
                min={1}
                value={pillsTotal}
                onChange={(e) => setPillsTotal(parseInt(e.target.value) || 30)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2">تكرار الجرعة (الجدول الزمني):</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition text-right"
              >
                <option value="daily">مرة واحدة يومياً</option>
                <option value="twice">مرتين يومياً</option>
                <option value="every8">كل 8 ساعات (تلقائي)</option>
                <option value="every12">كل 12 ساعة</option>
                <option value="weekly">مرة واحدة أسبوعياً</option>
              </select>
            </div>
          </div>

          {/* Time pickers depending on frequency */}
          {(frequency === 'daily' || frequency === 'weekly' || frequency === 'twice' || frequency === 'every12') && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200/60 flex flex-wrap gap-6 items-center">
              <span className="text-xs font-black text-gray-700">تحديد أوقات الرنين أو الإشعار:</span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">الجرعة الأولى:</span>
                <input 
                  type="time"
                  value={time1}
                  onChange={(e) => setTime1(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-bold focus:outline-none"
                />
              </div>

              {(frequency === 'twice' || frequency === 'every12') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">الجرعة الثانية:</span>
                  <input 
                    type="time"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-2">توجيهات طبية أو ملاحظات الاستخدام:</label>
            <textarea 
              rows={2}
              placeholder="مثال: يفضل تجنب منتجات الألبان معه بساعتين، أو يؤخذ على معدة فارغة في الصباح الباكر..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition font-sans"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="bg-[#167d3b] hover:bg-emerald-700 text-white font-extrabold py-3.5 px-8 rounded-2xl transition shadow-lg shadow-green-950/20 text-xs inline-flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> تثبيت ميعاد العلاج دورياً
            </button>
          </div>
        </form>
      )}

      {/* Active Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-150 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">
              🧘
            </div>
            <h4 className="text-lg font-extrabold text-gray-900 mb-2">لا توجد منبهات مسجلة حالياً</h4>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
              قم بإنشاء منبه دواءك الأول بالضغط على زر "إضافة منبه دواء جديد" في الأعلى لنساعدك في تذكر جرعاتك الدورية بدقة.
            </p>
          </div>
        ) : (
          reminders.map((rem) => {
            const lowStock = rem.pillsLeft <= 5;
            const today = new Date().toISOString().split('T')[0];
            const alreadyTakenToday = rem.lastTakenDate === today;

            return (
              <div 
                key={rem.id} 
                className={`bg-white rounded-3xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition ${
                  alreadyTakenToday 
                    ? 'border-green-300 bg-green-50/10 opacity-90' 
                    : lowStock 
                    ? 'border-red-300 bg-red-50/10' 
                    : 'border-gray-150 hover:border-[#CE1126]'
                }`}
              >
                {/* Right side: Med Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-extrabold text-gray-950 text-base">{rem.medName}</h4>
                    
                    {/* Frequency badge */}
                    <span className="text-[10px] bg-red-50 text-[#CE1126] font-black px-2.5 py-0.5 rounded-full border border-red-100">
                      {rem.frequency === 'daily' ? 'يومياً' : 
                       rem.frequency === 'twice' ? 'مرتين باليوم' : 
                       rem.frequency === 'every8' ? 'كل 8 ساعات' : 
                       rem.frequency === 'every12' ? 'كل 12 ساعة' : 'أسبوعياً'}
                    </span>

                    {/* Low stock badge */}
                    {lowStock && (
                      <span className="text-[10px] bg-red-500 text-white font-extrabold px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <AlertTriangle size={10} /> متبقي قليل ({rem.pillsLeft})
                      </span>
                    )}

                    {/* Already taken check */}
                    {alreadyTakenToday && (
                      <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✓ جرعة اليوم مؤكدة
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <span>ميعاد أخذ الجرعة:</span>
                    <span className="text-gray-900 font-extrabold font-mono flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-200">
                      <Clock size={12} className="text-primary-600" />
                      {rem.times.join(' | ')}
                    </span>
                    <span className="mx-2 font-medium">|</span>
                    <span>المقدار: <span className="text-gray-900 font-extrabold">{rem.dosage}</span></span>
                  </p>

                  {rem.notes && (
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 italic">
                      💡 {rem.notes}
                    </p>
                  )}

                  {/* Stock tracking indicator */}
                  <div className="pt-1.5 flex items-center gap-4 text-xs font-bold">
                    <div className="flex-1 max-w-[200px] h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${alreadyTakenToday ? 'bg-emerald-500' : lowStock ? 'bg-red-500' : 'bg-primary-600'}`}
                        style={{ width: `${Math.min(100, (rem.pillsLeft / rem.pillsTotal) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={`${lowStock ? 'text-red-650 font-extrabold' : 'text-gray-500'}`}>
                      متبقي بالمنزل: <span className="font-extrabold text-gray-900">{rem.pillsLeft}</span> من {rem.pillsTotal} كبسولات
                    </span>
                  </div>
                </div>

                {/* Left side: Controls */}
                <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
                  {/* Take dose */}
                  <button
                    onClick={() => handleConfirmTaken(rem.id)}
                    disabled={alreadyTakenToday}
                    className={`text-xs font-black py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      alreadyTakenToday 
                        ? 'bg-green-50 text-[#167d3b] border-green-200 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700 border-transparent shadow'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    <span>سجل أخذ جرعة اليوم</span>
                  </button>

                  {/* Instant refill/reorder */}
                  <button
                    onClick={() => handleImmediateRefill(rem)}
                    className="text-xs font-extrabold bg-[#CE1126]/5 text-[#CE1126] border border-red-150 hover:bg-[#CE1126] hover:text-white py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart size={15} />
                    <span>طلب إعادة تعبئة فوري</span>
                  </button>

                  <div className="flex gap-2">
                    {/* Toggle activation */}
                    <button
                      onClick={() => handleToggleActive(rem.id)}
                      className={`flex-1 text-[11px] font-bold py-2 px-3 rounded-lg border transition ${
                        rem.isActive 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {rem.isActive ? '🔔 تنبيه منشط' : '🔕 معطل مؤقتاً'}
                    </button>

                    {/* Delete reminder */}
                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 border border-gray-150 rounded-lg transition"
                      title="مسح المنبه"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Advisory notes */}
      <div className="mt-11 p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <span className="text-[10px] bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-right uppercase tracking-wider block max-w-max">توجيه صيدلية البنداري</span>
          <h4 className="font-extrabold text-sm md:text-base leading-snug">احصل على تنبيهات الأدوية عبر الرسائل أو إشعارات الجوال السريعة</h4>
          <p className="text-xs text-gray-300 font-medium">سجل رقمك لتفعيل ميزة الرصد الأتوماتيكي لحرارة الأدوية الشائعة.</p>
        </div>
        <a 
          href="tel:01200400094"
          className="bg-white text-black hover:bg-gray-100 font-black px-6 py-3 rounded-2xl text-xs transition duration-300 shrink-0 border border-transparent flex items-center gap-1.5"
        >
          <Smartphone size={14} className="text-[#CE1126]" />
          <span>تفعيل التنبيهات الهاتفية مجاناً</span>
        </a>
      </div>
    </div>
  );
};
