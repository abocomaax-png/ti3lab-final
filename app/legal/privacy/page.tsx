'use client';

import { Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-16 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة</span>
        </button>

        <div className="bg-dark-light border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <Lock className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>
              <p className="text-gray-400 mt-2">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. المقدمة</h2>
              <p className="text-gray-300 leading-relaxed">
                في Ti3Lab، نحن ملتزمون بحماية خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام وحماية 
                معلوماتك الشخصية عند استخدام منصتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. المعلومات التي نجمعها</h2>
              
              <h3 className="text-xl font-bold text-white mb-3 mt-6">2.1 معلومات الحساب</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>الاسم الكامل</li>
                <li>البريد الإلكتروني</li>
                <li>كلمة المرور (مشفرة)</li>
                <li>تاريخ الإنشاء</li>
              </ul>

              <h3 className="text-xl font-bold text-white mb-3 mt-6">2.2 معلومات الاستخدام</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>المعامل التي تم حلها</li>
                <li>النقاط المكتسبة</li>
                <li>الوقت المستغرق في المعامل</li>
                <li>الـ Flags المرسلة</li>
              </ul>

              <h3 className="text-xl font-bold text-white mb-3 mt-6">2.3 المعلومات التقنية</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>عنوان IP</li>
                <li>نوع المتصفح والجهاز</li>
                <li>نظام التشغيل</li>
                <li>موقعك الجغرافي التقريبي</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. كيف نستخدم معلوماتك</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>توفير وتحسين خدماتنا</li>
                <li>إدارة حسابك واشتراكك</li>
                <li>معالجة المدفوعات</li>
                <li>إرسال إشعارات مهمة</li>
                <li>منع الاحتيال وضمان الأمان</li>
                <li>تحليل الاستخدام لتحسين المنصة</li>
                <li>الرد على استفساراتك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. مشاركة المعلومات</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                نحن لا نبيع معلوماتك الشخصية أبداً. قد نشارك معلوماتك فقط مع:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>مقدمي الخدمات:</strong> مثل بوابات الدفع (فواتيرك) لمعالجة المدفوعات</li>
                <li><strong>المتطلبات القانونية:</strong> إذا طُلب منا ذلك بموجب القانون</li>
                <li><strong>حماية الحقوق:</strong> لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. أمان البيانات</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                نتخذ إجراءات أمنية صارمة لحماية معلوماتك:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>تشفير البيانات باستخدام SSL/TLS</li>
                <li>تشفير كلمات المرور بتقنيات قوية</li>
                <li>خوادم آمنة محمية بجدران نارية</li>
                <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                <li>نسخ احتياطية منتظمة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                نستخدم Cookies لتحسين تجربتك على المنصة. الـ Cookies هي ملفات صغيرة تُخزن على جهازك 
                وتساعدنا في:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>تذكر معلومات تسجيل الدخول</li>
                <li>تحليل استخدام الموقع</li>
                <li>تخصيص المحتوى حسب تفضيلاتك</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                يمكنك تعطيل Cookies من متصفحك، لكن قد يؤثر ذلك على بعض وظائف المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. حقوقك</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                <li><strong>التصحيح:</strong> تحديث أو تصحيح معلوماتك</li>
                <li><strong>الحذف:</strong> طلب حذف حسابك وبياناتك</li>
                <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك</li>
                <li><strong>نقل البيانات:</strong> الحصول على بياناتك بصيغة قابلة للنقل</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                لممارسة أي من هذه الحقوق، تواصل معنا على: support@ti3lab.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. الأطفال</h2>
              <p className="text-gray-300 leading-relaxed">
                منصتنا غير موجهة للأطفال أقل من 16 عاماً. إذا علمنا أننا جمعنا معلومات من طفل دون موافقة 
                الوالدين، سنحذفها فوراً.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. التعديلات</h2>
              <p className="text-gray-300 leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني 
                أو إشعار على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. الاتصال</h2>
              <p className="text-gray-300 leading-relaxed">
                لأي أسئلة حول سياسة الخصوصية:
              </p>
              <div className="bg-dark rounded-lg p-4 mt-4">
                <p className="text-gray-300">
                  📧 البريد: <a href="mailto:privacy@ti3lab.com" className="text-primary hover:underline">privacy@ti3lab.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
