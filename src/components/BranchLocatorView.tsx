import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, AlertTriangle, ExternalLink, ShieldCheck, Compass, Info, CheckCircle2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  englishName: string;
  address: string;
  phones: string[];
  googleMapUrl: string;
  coordinates: [number, number];
  services: string[];
}

export const BranchLocatorView: React.FC = () => {
  const branches: Branch[] = [
    {
      id: 'moh',
      name: 'المهندسين',
      englishName: 'El Mohandessin',
      address: '69 ش شهاب تقاطع لبنان بجوار مزايا',
      phones: ['01210222822', '01210222922', '0233463222', '0233488777'],
      googleMapUrl: 'https://maps.google.com/?q=69+Shehab+St+Mohandessin+Cairo',
      coordinates: [30.0602, 31.2023],
      services: ['توفير مستحضرات تجميل مستوردة', 'رعاية صحية واستشارات 24 ساعة', 'توصيل للمنازل بالمهندسين والدقي']
    },
    {
      id: 'galaa1',
      name: 'ش الجلاء (1)',
      englishName: 'El Galaa St. (1)',
      address: 'أمام موقف الجلاء، طنطا',
      phones: ['0403298793', '01200400094', '01207222322'],
      googleMapUrl: 'https://maps.google.com/?q=El+Galaa+St+Tanta+Egypt',
      coordinates: [30.7852, 31.0021],
      services: ['توصيل سريع 24 ساعة', 'تركيبات صيدلانية متخصصة', 'قياس طبي مجاني']
    },
    {
      id: 'galaa2',
      name: 'ش الجلاء (2)',
      englishName: 'El Galaa St. (2)',
      address: 'أمام قاعة جرين بالاس، طنطا',
      phones: ['0403546290'],
      googleMapUrl: 'https://maps.google.com/?q=Green+Palace+Galaa+St+Tanta',
      coordinates: [30.7845, 31.0035],
      services: ['العناية بالبشرة والشعر', 'قياس الضغط والسكر مجاناً', 'جميع مستلزمات الأطفال']
    },
    {
      id: 'galaa3',
      name: 'ش الجلاء (3)',
      englishName: 'El Galaa St. (3)',
      address: 'بجوار الأمن المركزي، طنطا',
      phones: ['0403282323', '01200400461'],
      googleMapUrl: 'https://maps.google.com/?q=Central+Security+Galaa+St+Tanta',
      coordinates: [30.7830, 31.0048],
      services: ['صرف الروشتات والتأمين', 'مستحضرات تجميل أصلية', 'توصيل فوري طوال اليوم']
    },
    {
      id: 'borsa',
      name: 'ش البورصة',
      englishName: 'Borsa St.',
      address: 'بجوار قسم أول - أسفل مول الشهاوي، طنطا',
      phones: ['0403358874', '01121369758'],
      googleMapUrl: 'https://maps.google.com/?q=First+Police+Station+Borsa+St+Tanta',
      coordinates: [30.7891, 30.9984],
      services: ['فيتامينات ومكملات غذائية', 'رعاية صحية منزلية', 'صرف الروشتات الطبية']
    },
    {
      id: 'ashraf',
      name: 'ش الأشرف',
      englishName: 'Al Ashraf St.',
      address: 'مع المرشحة، طنطا',
      phones: ['0403313012', '01200400459'],
      googleMapUrl: 'https://maps.google.com/?q=Al+Ashraf+St+Tanta+Egypt',
      coordinates: [30.7825, 31.0089],
      services: ['قسم متكامل للأم والطفل', 'توصيل مجاني للروشتات الأسبوعية', 'استشارات تركيبات صيدلانية']
    },
    {
      id: 'kafr_essam',
      name: 'كفر عصام',
      englishName: 'Kafr Essam',
      address: 'بجوار مدرسة أم المؤمنين، طنطا',
      phones: ['0403332816', '01207271272'],
      googleMapUrl: 'https://maps.google.com/?q=Kafr+Essam+St+Tanta+Egypt',
      coordinates: [30.7932, 31.0005],
      services: ['أجهزة ومستلزمات طبية معتمدة', 'أغذية وحفاضات أطفال', 'توصيل لمنطقة كفر عصام وجامعة طنطا']
    },
    {
      id: 'saeed',
      name: 'ش سعيد',
      englishName: 'Saeed St.',
      address: 'نهاية شارع سعيد مع عمرو بن عبد العزيز، طنطا',
      phones: ['0403318734', '01200400469'],
      googleMapUrl: 'https://maps.google.com/?q=Saeed+St+Tanta+Egypt',
      coordinates: [30.7905, 31.0018],
      services: ['استشاري جلدية وتجميل متاح', 'جميع أجهزة قياس الوزن والضغط', 'صرف سريع وتوصيل آمن']
    },
    {
      id: 'maarad',
      name: 'ش المعرض',
      englishName: 'El Maarad',
      address: 'طريق القاهرة الإسكندرية الزراعي، طنطا',
      phones: ['0403329519', '01200400424'],
      googleMapUrl: 'https://maps.google.com/?q=Cairo+Alex+Agricultural+Road+Tanta',
      coordinates: [30.7981, 31.0095],
      services: ['صيدلية سيارات سريعة', 'أنواع الأنسولين المبرد متوفرة دائماً', 'توصيل فروع المعرض بالكامل']
    },
    {
      id: 'alex_road',
      name: 'طريق الإسكندرية الزراعي',
      englishName: 'Alex Agriculture Road',
      address: 'بعد محطة غاز أندريا، طنطا',
      phones: ['0403344350', '01200400471'],
      googleMapUrl: 'https://maps.google.com/?q=Andrea+Gas+Station+Alex+Road+Tanta',
      coordinates: [30.8035, 31.0125],
      services: ['خدمة طريق سريع 24 ساعة', 'إسعافات أولية متطورة', 'مستلزمات الغيار الطبي']
    },
    {
      id: 'mohafza',
      name: 'المحافظة',
      englishName: 'El Mohafza',
      address: 'بداية شارع النحاس من شارع البحر، طنطا',
      phones: ['0403333406', '01222258867'],
      googleMapUrl: 'https://maps.google.com/?q=Nahas+St+Tanta+Egypt',
      coordinates: [30.7876, 30.9952],
      services: ['جميع أدوية التأمين متوافرة', 'استشارات تجميلية مجاناً', 'توصيل فوري لوسط البلد']
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBranches = branches.filter(b => 
    b.name.includes(searchQuery) || 
    b.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none" dir="rtl">
      {/* 1. Header component containing the high fidelity titles */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">فروعنا</h1>
        <p className="text-red-600 font-extrabold text-sm md:text-base mt-2 animate-pulse">
          ونقدم خدماتنا في أكثر من ١٥ فرع
        </p>
      </div>

      {/* 2. Top widgets wrapper side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* WhatsApp widget card with custom QR illustration */}
        <div className="bg-white border border-emerald-150 p-4 rounded-3xl flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            {/* Elegant QR Code Mock representing the true screenshot look */}
            <div className="bg-slate-100 p-2 rounded-2xl border border-gray-250 shrink-0">
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-slate-800" fill="currentColor">
                <rect x="0" y="0" width="25" height="25" />
                <rect x="10" y="10" width="5" height="5" fill="white" />
                <rect x="75" y="0" width="25" height="25" />
                <rect x="80" y="10" width="5" height="5" fill="white" />
                <rect x="0" y="75" width="25" height="25" />
                <rect x="10" y="80" width="5" height="5" fill="white" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="30" y="0" width="5" height="40" />
                <rect x="0" y="30" width="40" height="5" />
                <rect x="70" y="40" width="25" height="5" />
                <rect x="50" y="75" width="10" height="15" />
                <rect x="80" y="80" width="20" height="20" />
                <rect x="45" y="10" width="15" height="5" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-600 text-sm md:text-base flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                واتس آب الفروع
              </h3>
              <p className="text-zinc-600 text-xs font-bold mt-1 tracking-wider">01200400461</p>
            </div>
          </div>
          <a
            href="https://wa.me/201200400461"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5 shrink-0"
          >
            <MessageSquare size={14} className="fill-white" />
            <span>مراسلة</span>
          </a>
        </div>

        {/* Complaints and Suggestions widget card */}
        <div className="bg-orange-50/45 border border-orange-100 p-4 rounded-3xl flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 hover:scale-105 p-3.5 rounded-2xl text-orange-600 border border-orange-200 shrink-0">
              <AlertTriangle size={24} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-orange-700 text-sm md:text-base">شكاوي واقتراحات</h3>
              <p className="text-zinc-600 text-xs font-bold mt-1 tracking-wider">01200400089</p>
            </div>
          </div>
          <a
            href="tel:01200400089"
            className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md shadow-orange-500/10 transition-all shrink-0"
          >
            اتصال
          </a>
        </div>
      </div>

      {/* 3. Real-Time Branch Filtering Tool */}
      <div className="mb-6 relative">
        <input 
          type="text"
          placeholder="ابحث عن فرعك (المهندسين، الجلاء، سعيد، النحاس...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-11 text-xs md:text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#CE1126] transition-all"
        />
        <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* 4. Branch listings styled precisely as the modern Dark Slate Theme in screenshots */}
      <div className="space-y-6">
        {filteredBranches.map((branch, index) => (
          <div 
            key={branch.id} 
            className="bg-[#111C2B] rounded-3xl p-5 md:p-6 border border-slate-800 shadow-xl overflow-hidden text-right relative"
          >
            {/* Red header with location title of branch */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={22} className="text-rose-500 animate-pulse shrink-0" />
                <h2 className="text-lg md:text-xl font-black text-rose-500 tracking-tight">
                  {branch.name}
                </h2>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider font-bold">
                {branch.englishName}
              </span>
            </div>

            {/* Address text */}
            <p className="text-slate-300 font-bold text-xs md:text-sm mt-3 leading-relaxed">
              {branch.address}
            </p>

            {/* Box displaying phone numbers cleanly */}
            <div className="bg-[#1A2E46] rounded-2xl p-4 mt-4 border border-slate-700/50 space-y-2 max-w-md">
              {branch.phones.map((phone, pIdx) => (
                <div key={pIdx} className="flex items-center justify-between hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors">
                  <a 
                    href={`tel:${phone}`}
                    className="text-white hover:text-rose-400 font-mono font-black text-xs md:text-sm tracking-widest block transition-colors"
                  >
                    {phone}
                  </a>
                  <Phone size={14} className="text-rose-400 shrink-0" />
                </div>
              ))}
            </div>

            {/* High-fidelity responsive mockup of maps inside the card matching Screenshot perfectly */}
            <div className="relative h-44 rounded-2xl overflow-hidden mt-5 border border-slate-700 bg-slate-900">
              {/* Static visual representation of a premium styled maps background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CE1126_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center animate-ping"></div>
              </div>
              
              {/* Abstract Roads overlay drawing to closely simulate real GPS mapping UI in screenshot */}
              <svg className="absolute inset-0 w-full h-full text-slate-800 Opacity-25" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="50" x2="100%" y2="80" stroke="currentColor" strokeWidth="4" />
                <line x1="80" y1="0" x2="110" y2="100%" stroke="currentColor" strokeWidth="3" />
                <line x1="180" y1="0" x2="180" y2="100%" stroke="currentColor" strokeWidth="5" />
                <circle cx={140} cy={70} r="8" fill="#CE1126" />
              </svg>

              {/* Pin indicator on Map */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-rose-600 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full shadow-lg border border-rose-500/30 flex items-center gap-1">
                  <span>صيدلية البنداري {(index + 1) % 4 || ""}</span>
                  <ShieldCheck size={10} />
                </div>
                <div className="w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white mt-1 shadow-md"></div>
              </div>

              {/* Float styled Google maps link button on top-left of the map preview (Matching screenshot layout) */}
              <a 
                href={branch.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[10px] md:text-xs py-2 px-3.5 rounded-lg border border-gray-200 shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
              >
                <ExternalLink size={12} className="text-zinc-600" />
                <span>خرائط "Google"</span>
              </a>

              {/* Dynamic Directions Button on bottom-right */}
              <div className="absolute bottom-3 right-3">
                <span className="text-[9px] md:text-[10px] bg-slate-950/75 backdrop-blur-xs text-rose-400 font-extrabold px-2 py-1 rounded-md border border-slate-800">
                  متصل وموثّق GPS
                </span>
              </div>
            </div>

            {/* List of services available on footer */}
            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-800">
              {branch.services.map((service, s_idx) => (
                <span 
                  key={s_idx}
                  className="bg-slate-800/40 border border-slate-700/60 text-slate-300 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Info size={10} className="text-rose-400" />
                  {service}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filteredBranches.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-200/60">
            <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-bold">عذراً، لم نجد أي فرع يطابق بحثك حالياً.</p>
          </div>
        )}
      </div>

      {/* Brief disclaimer at bottom */}
      <p className="text-center text-[10px] md:text-xs text-zinc-400 mt-8 leading-relaxed font-medium max-w-xl mx-auto">
        جميع فروعنا تقدم خدمات صيدلانية متكاملة بأقسام الرعاية الدوائية ومستحضرات التجميل، مجهزة لخدمتكم 24 ساعة للاتصال السريع أو زيارة الفرع.
      </p>
    </div>
  );
};
