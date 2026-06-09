'use client';

import { Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
            <Shield className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">الشروط والأحكام</h1>
              <p className="text-gray-400 mt-2">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. مقدمة</h2>
              <p className="text-gray-300 leading-relaxed">
                مرحباً بك في منصة Ti3Lab. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                الرجاء قراءتها بعناية قبل استخدام خدماتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. الاستخدام المقبول</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>يجب أن تكون عمرك 16 عاماً أو أكثر لاستخدام المنصة</li>
                <li>يجب استخدام المنصة لأغراض تعليمية فقط</li>
                <li>يُحظر استخدام المعامل لأي أنشطة غير قانونية</li>
                <li>يُحظر مشاركة حسابك مع الآخرين</li>
                <li>يُحظر محاولة اختراق المنصة أو تعطيل خدماتها</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. الحسابات والأمان</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                أنت مسؤول عن:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>الحفاظ على سرية معلومات حسابك</li>
                <li>جميع الأنشطة التي تتم من خلال حسابك</li>
                <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. الدفع والاشتراكات</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>جميع الأسعار مذكورة بالجنيه المصري</li>
                <li>الدفع يتم عبر بوابات دفع آمنة</li>
                <li>الاشتراكات تتجدد تلقائياً ما لم يتم إلغاؤها</li>
                <li>يمكن إلغاء الاشتراك في أي وقت</li>
                <li>لا نحتفظ ببيانات بطاقتك الائتمانية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. الملكية الفكرية</h2>
              <p className="text-gray-300 leading-relaxed">
                جميع المحتويات على المنصة (النصوص، الصور، الفيديوهات، المعامل) محمية بحقوق النشر 
                وهي ملك لـ Ti3Lab. يُحظر نسخ أو توزيع أو إعادة إنتاج المحتوى دون إذن كتابي.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. إخلاء المسؤولية</h2>
              <p className="text-gray-300 leading-relaxed">
                المنصة مخصصة للتعليم فقط. Ti3Lab غير مسؤولة عن أي استخدام خاطئ للمعلومات المقدمة. 
                استخدام أي تقنيات أو معلومات مكتسبة من المنصة على أنظمة دون إذن هو غير قانوني ومسؤوليتك الشخصية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. إنهاء الخدمة</h2>
              <p className="text-gray-300 leading-relaxed">
                نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت إذا:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>انتهكت هذه الشروط والأحكام</li>
                <li>استخدمت المنصة لأنشطة غير قانونية</li>
                <li>أساءت استخدام الخدمة بأي شكل</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. التعديلات</h2>
              <p className="text-gray-300 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني 
                أو عبر المنصة. استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك عليها.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. الاتصال</h2>
              <p className="text-gray-300 leading-relaxed">
                إذا كان لديك أي أسئلة حول هذه الشروط، يمكنك التواصل معنا عبر:
              </p>
              <div className="bg-dark rounded-lg p-4 mt-4">
                <p className="text-gray-300">
                  📧 البريد الإلكتروني: <a href="mailto:support@ti3lab.com" className="text-primary hover:underline">support@ti3lab.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
