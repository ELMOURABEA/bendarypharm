import React, { useState } from 'react';
import { Mail, Server, CheckCircle, RefreshCw, Play, Send, Terminal, ArrowRight, Lock, Code, UserCheck, AlertCircle } from 'lucide-react';

interface CloudflareAgentHubProps {
  onBack: () => void;
}

export const CloudflareAgentHub: React.FC<CloudflareAgentHubProps> = ({ onBack }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{
    success: boolean;
    status: number;
    active: boolean;
    id?: string;
    error?: string;
  } | null>(null);

  // Simulation state
  const [emailFrom, setEmailFrom] = useState('patient.amal@gmail.com');
  const [emailSubject, setEmailSubject] = useState('طلب عاجل لقطرة جفاف العين ومسكن');
  const [emailBody, setEmailBody] = useState('أهلاً صيدلية البنداري، أعاني من جفاف شديد واحمرار في العينين بسبب الغبار. هل يتوفر لديكم قطرة مرطبة مثل "ثيوتير" أو "هاي فريش"؟ وهل يمكن شحنها وتوصيلها لعنواني بالإسكندرية اليوم؟ أمل كمال.');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    category: string;
    extractedMedicines: string[];
    pharmacistAlert: string;
    patientReply: string;
    forwardedTo: string;
  } | null>(null);

  const testTokenVerification = async () => {
    setIsVerifying(true);
    setTokenStatus(null);
    try {
      const res = await fetch('/api/cloudflare/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTokenStatus({
          success: true,
          status: data.status,
          active: data.data?.success || false,
          id: data.data?.result?.id || 'cf_token_active'
        });
      } else {
        setTokenStatus({
          success: false,
          status: res.status,
          active: false,
          error: data.error || data.data?.errors?.[0]?.message || 'مرفوض من خوادم Cloudflare'
        });
      }
    } catch (err: any) {
      setTokenStatus({
        success: false,
        status: 500,
        active: false,
        error: err.message || 'فشل الاتصال بخادم البوابة'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFrom.trim() || !emailBody.trim()) return;

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/cloudflare/simulate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          subject: emailSubject,
          body: emailBody,
          to: 'prescriptions@bendaryph.com'
        })
      });

      if (!res.ok) {
        throw new Error('حدث خطأ في استجابة محاكاة البريد الذكي.');
      }

      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء تشغيل محاكاة العميل الصيدلاني الذكي لـ Cloudflare Email.');
    } finally {
      setIsSimulating(false);
    }
  };

  // User's provided Cloudflare Email Worker Script
  const cloudflareWorkerCode = `export default {
  async email(message, env, ctx) {
    // Forward the incoming email to a destination address
    await message.forward("destination@example.com");

    // Or send a new email using the send_email binding
    await env.SEND_EMAIL.send({
      from: message.to,
      to: "recipient@example.com",
      subject: "New email received",
      text: \`New email from \${message.from}\`,
    });
  }
};`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-right dir-rtl font-sans animate-fade-in pb-24">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-150">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100/60 text-[#CE1126] rounded-2xl flex items-center justify-center border border-red-200">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-950">وكيل أتمتة البريد والذكاء الاصطناعي (Cloudflare AI Agent)</h1>
            <p className="text-xs text-gray-500 font-bold mt-1">مركز إدارة تحويل وتدوير الاستشارات والطلبات الواردة لبريد صيدلية البنداري تلقائياً</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition duration-250 cursor-pointer"
        >
          <ArrowRight size={16} />
          العودة للبوابة
        </button>
      </div>

      {/* CLOUDFLARE API TOKEN DIAGNOSTIC GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Token check panel */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-4 h-4 text-[#CE1126]" />
              التحقق من تصريح Cloudflare API
            </h3>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              يقوم هذا الفحص باختبار توكن الوصول المعتمد لـ Cloudflare الخاص بك على عناوين التوجيه للتأكد من تفويض حساب المطور والبريد بمرونة.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 font-mono text-[10px] text-gray-500">
              <div className="flex justify-between">
                <span>API Status:</span>
                <span className="font-bold text-gray-800">Secure Vault</span>
              </div>
              <div className="flex justify-between items-center">
                <span>System Token:</span>
                <span className="text-gray-700 bg-white/60 px-1.5 py-0.5 rounded font-black">cfut_8PwDYV...7lo24b</span>
              </div>
            </div>

            {/* Verification Response Display */}
            {tokenStatus && (
              <div className={`p-4 rounded-2xl text-xs font-bold border flex items-start gap-3 transition duration-300 animate-in fade-in ${
                tokenStatus.success 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {tokenStatus.success ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <span>{tokenStatus.success ? 'تم تأكيد وتفعيل التوكن بنجاح!' : 'فشل التحقق من التوكن'}</span>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {tokenStatus.success 
                      ? `رقم المعرف: ${tokenStatus.id} - حالة النظام: نشط ومتصل بـ Cloudflare Mail routing.` 
                      : tokenStatus.error}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              onClick={testTokenVerification}
              disabled={isVerifying}
              className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition duration-250 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري اختبار المصادقة...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  تشغيل فحص مصادقة التوكن (cURL)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cloudflare script repository display */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl text-left dir-ltr relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute top-2.5 right-4 bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono">
            <Code className="w-3.5 h-3.5" />
            cloudflare_worker.js
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-[11px] font-mono font-bold text-slate-500 ml-2">Cloudflare Email Routing Worker script</span>
            </div>

            <pre className="text-xs text-emerald-400 font-mono overflow-x-auto p-4 bg-black/40 rounded-2xl leading-relaxed whitespace-pre select-all border border-slate-900 shadow-inner">
              {cloudflareWorkerCode}
            </pre>
          </div>

          <p className="mt-4 text-[10px] text-slate-500 font-bold leading-relaxed pr-2 text-right dir-rtl">
            💡 يقوم هذا الـ Worker المثيل بالتقاط وتدوير رسائل البريد الإلكتروني الواردة إلى البريد الرسمي وتحويلها تلقائيًا إلى الصيادلة المختصين لمتابعة الأدوية المطلوبة مع العميل.
          </p>
        </div>
      </div>

      {/* INTERACTIVE IMMERSIVE SANDBOX TESTING */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#CE1126]" />
            تجربة محاكاة وكيل البريد الصيدلي الذكي
          </h3>
          <p className="text-xs text-gray-400 font-bold mt-1">اكتب بريداً تجريبياً من مريض أو طبيب وشاهد كيف يعالجه وكيل الذكاء الاصطناعي ويمرر التوصية الطبية والرد</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Email input simulator */}
          <form onSubmit={handleSimulateEmail} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-extrabold block">بريد المرسل (العميل):</label>
                <input 
                  type="email" 
                  required
                  disabled={isSimulating}
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-left dir-ltr focus:outline-none focus:border-[#CE1126]"
                  placeholder="patient@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-extrabold block">عنوان الموضوع:</label>
                <input 
                  type="text" 
                  required
                  disabled={isSimulating}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[#CE1126]"
                  placeholder="موضوع الرسالة"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-extrabold block">محتوى البريد الوارد (الاستشارة أو طلب الدواء):</label>
              <textarea 
                rows={5}
                required
                disabled={isSimulating}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-bold focus:outline-none focus:border-[#CE1126] leading-relaxed"
                placeholder="اكتب تفاصيل الشكوى المرضية، أو الروشتة المطلوبة، أو أسماء الأدوية..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSimulating}
                className="w-full bg-[#CE1126] hover:bg-black text-white text-xs font-black py-4 rounded-xl flex items-center justify-center gap-2 transition duration-250 cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري تدوير الإيميل وتدريب وكيل الأتمتة الذكي...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    معالجة البريد وتشغيل وكيل الخدمة (Simulate Email)
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Output Terminal result */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-lg min-h-[320.5px] border border-slate-800 flex flex-col justify-between">
            {simulationResult ? (
              <div className="space-y-5 text-right font-sans animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">مخرجات وكيل الأتمتة للبريد الإلكتروني</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {simulationResult.category}
                  </span>
                </div>

                {/* Extracted medicines list */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold block">الأدوية المحددة في النظام:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {simulationResult.extractedMedicines && simulationResult.extractedMedicines.length > 0 ? (
                      simulationResult.extractedMedicines.map((med, idx) => (
                        <span key={idx} className="bg-blue-500/10 text-blue-300 text-[11px] font-black px-2 py-0.5 rounded-lg border border-blue-500/10">
                          {med}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs font-bold leading-none">لم يتم تحديد أدوية صريحة.</span>
                    )}
                  </div>
                </div>

                {/* Forwarded email view */}
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                  <h4 className="text-[10.5px] text-[#CE1126] font-black flex items-center gap-1.5">
                    <Send size={12} className="text-red-500" />
                    تحويل إلى الصيادلة المناوبين ({simulationResult.forwardedTo})
                  </h4>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed font-sans">{simulationResult.pharmacistAlert}</p>
                </div>

                {/* Instant Patient auto-reply */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                  <h4 className="text-[10.5px] text-emerald-400 font-black flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    رد تلقائي فوري للمريض ({simulationResult.from})
                  </h4>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed font-sans">{simulationResult.patientReply}</p>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-slate-500 shadow-inner">
                  <Terminal className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-300">محاكي مخرجات الذكاء الاصطناعي</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs">
                  قم بملء تفاصيل البريد الإلكتروني في جانب المحاكاة واضغط "معالجة البريد" لمطالعة نتائج التحليل والفرز والتحويل التلقائي.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
