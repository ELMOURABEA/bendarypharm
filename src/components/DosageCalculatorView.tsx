import React, { useState, useMemo } from 'react';
import { Calculator, Info, Weight, Activity, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft, Heart, Smartphone } from 'lucide-react';

interface MedicineConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  standardDosePerKg: number; // mg per kg per single dose
  maxSingleDose: number; // max mg per single dose
  dailyMaxDose: number; // max mg per day
  frequencyText: string; // e.g. "كل 6 إلى 8 ساعات عند اللزوم"
  availableStrengths: {
    label: string;
    concentrationMg: number; // mg in active volume
    volumeMl: number; // ml volume containing the concentrationMg
  }[];
  notes: string;
}

const COMMON_MEDICINES: MedicineConfig[] = [
  {
    id: 'paracetamol',
    nameAr: 'باراسيتامول (شراب للأطفال / فيفادول / تمبرال)',
    nameEn: 'Paracetamol Syrup',
    category: 'خافض حرارة ومسكن للألم',
    standardDosePerKg: 15, // 15 mg/kg per dose
    maxSingleDose: 1000,
    dailyMaxDose: 4000,
    frequencyText: "كل 6 ساعات عند اللزوم (بحد أقصى 4 مرات يومياً)",
    availableStrengths: [
      { label: 'شراب بتركيز 120 مجم / 5 مل (الأكثر شيوعاً للرضع)', concentrationMg: 120, volumeMl: 5 },
      { label: 'شراب بتركيز 250 مجم / 5 مل (للأعمار الأكبر)', concentrationMg: 250, volumeMl: 5 },
      { label: 'قطارة بتركيز 100 مجم / 1 مل (للرضع من عمر يوم)', concentrationMg: 100, volumeMl: 1 }
    ],
    notes: 'يعد المسكن الأكثر أماناً للأطفال الرضع والحديثي الولادة. تجنب إعطاء جرعات متتالية بفارق يقل عن 4 ساعات.'
  },
  {
    id: 'ibuprofen',
    nameAr: 'إيبوبروفين (شراب بروفين للأطفال / كتافلاي)',
    nameEn: 'Ibuprofen Syrup',
    category: 'مضاد التهاب وخافض حرارة',
    standardDosePerKg: 10, // 10 mg/kg per dose
    maxSingleDose: 400,
    dailyMaxDose: 1200,
    frequencyText: "كل 6 إلى 8 ساعات بعد الأكل بحد أقصى 3 مرات يومياً",
    availableStrengths: [
      { label: 'شراب بتركيز 100 مجم / 5 مل (بروفين العادي)', concentrationMg: 100, volumeMl: 5 },
      { label: 'شراب بتركيز 200 مجم / 5 مل (بروفين فورت / مضاعف)', concentrationMg: 200, volumeMl: 5 }
    ],
    notes: 'لا يعطى للأطفال تحت عمر 6 أشهر أو الذين يعانون من طفح أو جفاف شديد. يفضل تناوله بعد الوجبات لحماية المعدة.'
  },
  {
    id: 'amoxicillin',
    nameAr: 'أموكسيسيلين (مضاد حيوي إيموكس / أوجمنتين معلق)',
    nameEn: 'Amoxicillin Suspension',
    category: 'مضاد حيوي واسع المجال',
    standardDosePerKg: 20, // base standard mg/kg per dose for general infections
    maxSingleDose: 875,
    dailyMaxDose: 2000,
    frequencyText: "كل 8 ساعات أو كل 12 ساعة (حسب تركيز الروشتة)",
    availableStrengths: [
      { label: 'بودرة معلقة بتركيز 156 مجم / 5 مل', concentrationMg: 156, volumeMl: 5 },
      { label: 'بودرة معلقة بتركيز 228 مجم / 5 مل (سرعة امتصاص)', concentrationMg: 228, volumeMl: 5 },
      { label: 'بودرة معلقة بتركيز 312 مجم / 5 مل (مضاعف التنشيط)', concentrationMg: 312, volumeMl: 5 },
      { label: 'بودرة معلقة بتركيز 457 مجم / 5 مل (جرعة ممتدة)', concentrationMg: 457, volumeMl: 5 }
    ],
    notes: 'يتطلب استشارة الصيدلي لتعبئة الزجاجة بالماء المقطر حتى العلامة الدقيقة. يجب استكمال كورس العلاج كاملاً طبقاً لإرشادات الطبيب.'
  },
  {
    id: 'domperidone',
    nameAr: 'دومبيريدون (موتيلوم شراب / موتينورم للمغص والقيء)',
    nameEn: 'Domperidone',
    category: 'مضاد للتقيؤ ومنظم لحركة الجهاز الهضمي',
    standardDosePerKg: 0.25, // 0.25 mg/kg per dose
    maxSingleDose: 10,
    dailyMaxDose: 30,
    frequencyText: "كل 8 ساعات قبل الرضاعة أو تناول وجبة الطعام بـ 15 دقيقة",
    availableStrengths: [
      { label: 'شراب بتركيز 5 مجم / 5 مل', concentrationMg: 5, volumeMl: 5 },
      { label: 'شراب بتركيز 1 مجم / 1 مل', concentrationMg: 1, volumeMl: 1 }
    ],
    notes: 'علاج فعال للوقاية من الارتجاع والغازات ومغص الرضاعة لدى الأطفال، يلتزم بتقديمه بوقت مناسب قبل الأكل لتجنب التقيؤ.'
  },
  {
    id: 'cetirizine',
    nameAr: 'سيتريزين (زيرتك شراب / فنستيل نقط للحساسية)',
    nameEn: 'Cetirizine / Fenistil',
    category: 'مضاد للهستامين ومقاوم للحساسية والرشح',
    standardDosePerKg: 0.25, // mg / kg once daily
    maxSingleDose: 5,
    dailyMaxDose: 10,
    frequencyText: "مرة واحدة يومياً (يفضل مساءً قبل النوم لتجنب النعاس)",
    availableStrengths: [
      { label: 'شراب زيرتك بتركيز 5 مجم / 5 مل', concentrationMg: 5, volumeMl: 5 },
      { label: 'نقط فنستيل الفموية بتركيز 1 مجم / 1 مل', concentrationMg: 1, volumeMl: 1 }
    ],
    notes: 'يساهم في تقليل الرشح، السعال التحسسي، وأعراض الاكزيما الجلدية لدى الأطفال. قد يسبب شعوراً خفيفاً بالخمول.'
  }
];

interface DosageCalculatorProps {
  onBack: () => void;
}

export const DosageCalculatorView: React.FC<DosageCalculatorProps> = ({ onBack }) => {
  const [selectedMedId, setSelectedMedId] = useState(COMMON_MEDICINES[0].id);
  const [patientWeight, setPatientWeight] = useState<number>(10);
  const [patientAgeMonths, setPatientAgeMonths] = useState<number>(24);
  const [selectedStrengthIndex, setSelectedStrengthIndex] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState(true);

  // Selected drug details
  const selectedMed = useMemo(() => {
    return COMMON_MEDICINES.find(m => m.id === selectedMedId) || COMMON_MEDICINES[0];
  }, [selectedMedId]);

  // Adjust strength index if out of limits on medicine swap
  const activeStrength = useMemo(() => {
    const strengths = selectedMed.availableStrengths;
    if (selectedStrengthIndex >= strengths.length) {
      return strengths[0];
    }
    return strengths[selectedStrengthIndex];
  }, [selectedMed, selectedStrengthIndex]);

  // Comprehensive dosage calculation formula
  const calculatedResults = useMemo(() => {
    if (!selectedMed || !activeStrength || patientWeight <= 0) return null;

    // 1. Core dose in Milligrams (mg) based on weight
    let calculatedMg = patientWeight * selectedMed.standardDosePerKg;
    
    // Safety crop to maximum single dose constraint
    if (calculatedMg > selectedMed.maxSingleDose) {
      calculatedMg = selectedMed.maxSingleDose;
    }

    // 2. Convert Milligrams directly to Milliliters (ml) based on the chosen concentration format
    // Formula: Volume(ml) = Required_Dose(mg) * Bottle_Unit_Volume(ml) / Bottle_Concentration(mg)
    const calculatedMl = (calculatedMg * activeStrength.volumeMl) / activeStrength.concentrationMg;

    // Safety check check total daily accumulation
    let totalDoseDailyMg = calculatedMg * 3; // default assumes 3x daily max
    if (selectedMed.frequencyText.includes("4 مرات")) {
      totalDoseDailyMg = calculatedMg * 4;
    }
    const isDailySafe = totalDoseDailyMg <= selectedMed.dailyMaxDose;

    return {
      mgPerDose: parseFloat(calculatedMg.toFixed(1)),
      mlPerDose: parseFloat(calculatedMl.toFixed(1.5)),
      noteId: selectedMed.id,
      isDailySafe,
      dailyLimitMg: selectedMed.dailyMaxDose
    };
  }, [selectedMed, activeStrength, patientWeight]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans text-right" dir="rtl">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
            🧮
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-950">حساب جرعات أدوية الأطفال والرضع</h2>
            <p className="text-xs text-gray-400 font-bold">حاسبة طبية سريعة ودقيقة لاحتساب مللي الجرعات وفقاً لوزن الطفل والتركيز</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-gray-600 hover:text-black border border-gray-150 rounded-xl px-4 py-2 hover:bg-gray-50 bg-white"
        >
          العودة للرئيسية →
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Right side: Input Parameters Panel (7 cols / 12) */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-extrabold text-gray-900 text-base">إدخال الفحوصات والبيانات الطبية</h3>
          </div>

          {/* 1. Medicine selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-700">المادة الفعالة أو صنف الدواء المقترح:</label>
            <div className="grid grid-cols-1 gap-2">
              {COMMON_MEDICINES.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => {
                    setSelectedMedId(med.id);
                    setSelectedStrengthIndex(0);
                  }}
                  className={`w-full text-right p-3.5 rounded-2xl border text-xs font-bold transition flex justify-between items-center ${
                    selectedMedId === med.id 
                      ? 'bg-red-50/50 border-[#CE1126] text-[#CE1126]' 
                      : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold">{med.nameAr}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{med.category} | {med.nameEn}</span>
                  </div>
                  {selectedMedId === med.id ? (
                    <span className="w-5 h-5 rounded-full bg-[#CE1126] text-white flex items-center justify-center text-[10px]">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-gray-200 block"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* 2. Weight input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-700 flex items-center justify-between">
                <span>وزن المريض (الطفل):</span>
                <span className="text-[#CE1126] font-black">{patientWeight} كجم</span>
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min={1}
                  max={120}
                  step={0.5}
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-11 text-sm font-extrabold text-left focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400">
                  <Weight size={18} />
                </div>
              </div>
              <input 
                type="range"
                min={2}
                max={50}
                step={0.5}
                value={patientWeight}
                onChange={(e) => setPatientWeight(parseFloat(e.target.value))}
                className="w-full accent-[#CE1126] mt-2"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-normal">تنبيه: تحسب جرعات معظم أدوية معلق السائل بالوزن بدقة بالغة أفضل من السن.</p>
            </div>

            {/* 3. Age Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-700 flex items-center justify-between">
                <span>عمر الطفل المقريبي:</span>
                <span className="text-gray-900 font-extrabold">
                  {patientAgeMonths >= 12 
                    ? `${Math.floor(patientAgeMonths / 12)} سنة و ${patientAgeMonths % 12} أشهر`
                    : `${patientAgeMonths} شهر`
                  }
                </span>
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min={1}
                  max={180}
                  value={patientAgeMonths}
                  onChange={(e) => setPatientAgeMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-11 text-sm font-extrabold text-left focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400">
                  <Activity size={18} />
                </div>
              </div>
              <input 
                type="range"
                min={1}
                max={120}
                value={patientAgeMonths}
                onChange={(e) => setPatientAgeMonths(parseInt(e.target.value))}
                className="w-full accent-slate-700 mt-2"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-normal">يساعد العمر في استبصار الملاءمة للرضيع أو الطفل الأكبر سناً.</p>
            </div>
          </div>

          {/* 4. Choose Concentration Strength */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-black text-gray-700">تركيز العلبة لديك بالمنزل (مكتوب على الزجاجة):</label>
            <select
              value={selectedStrengthIndex}
              onChange={(e) => setSelectedStrengthIndex(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-black focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#CE1126] transition text-right"
            >
              {selectedMed.availableStrengths.map((st, idx) => (
                <option key={idx} value={idx}>
                  {st.label} (محلول مائي {st.concentrationMg} مجم في كل {st.volumeMl} مل)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Left side: Results Output Panel (5 cols / 12) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main calculated dosage box */}
          {calculatedResults && (
            <div className="bg-gradient-to-br from-slate-900 via-gray-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]">
              
              {/* Background ambient light */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-600/15 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <span className="text-[10px] bg-[#CE1126] text-white font-black px-3 py-1 rounded-full uppercase inline-flex items-center gap-1">
                  <Sparkles size={11} /> جرعة طفلك الرياضية المحسوبة
                </span>

                <div className="mt-6 text-center space-y-1">
                  <span className="text-[10px] text-gray-400 font-black block">مقدار الجرعة السائلة الفردية بالتحديد</span>
                  <div className="text-4xl font-extrabold text-white tracking-tight py-2 flex items-center justify-center gap-2">
                    <span className="text-primary-500 text-5xl font-black">{calculatedResults.mlPerDose}</span>
                    <span className="text-lg text-gray-300 font-black">مللي لتر (mL)</span>
                  </div>
                  <span className="text-xs text-gray-450 font-bold block bg-white/5 p-2 rounded-xl border border-white/5 mx-auto max-w-xs unicode-bidi">
                    وتعادل تقريباً: <span className="text-amber-400 font-extrabold">{calculatedResults.mgPerDose} ملليجرام</span> من المادة الفعالة
                  </span>
                </div>

                {/* Frequency list */}
                <div className="mt-8 space-y-3 pt-3 border-t border-white/10 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">تكرار وعدد الجرعات:</span>
                    <span className="text-white font-extrabold">{selectedMed.frequencyText}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">ملائمة كورس التحصين:</span>
                    <span className="text-green-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={13} /> آمن ومطابق لمواصفات البنداري
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and Disclaimers */}
              <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={13} /> حظر طبي وإرشادات الأمان:
                </span>
                <p className="text-[10px] text-gray-300 leading-relaxed font-semibold">
                  {selectedMed.notes}
                </p>
              </div>

            </div>
          )}

          {/* Quick contact / Consult Pharmacist Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-1 flex gap-3 text-right">
              <div className="w-10 h-10 bg-red-100/50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldAlert className="text-[#CE1126]" size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-gray-950">إشلاء مسؤولية استشاري طبي هام:</h4>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                  هذه الحاسبة تعتمد على معدلات الجرعات الأكاديمية الاسترشادية للأوزان الشائعة، ولا تغني مطلقاً عن الكشف العيادي والروشتة الطبية وتوجيه الصيدلي بفروع البنداري.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href="https://wa.me/201200400094" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl text-center transition flex items-center justify-center gap-1.5"
              >
                <span>استشر صيدلي واتساب</span>
              </a>
              <a 
                href="tel:01200400094"
                className="bg-black hover:bg-zinc-900 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl text-center transition flex items-center justify-center gap-1.5"
              >
                <span>اتصل بنا هاتفياً</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
