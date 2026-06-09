'use client';

import { RefreshCw, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RefundPage() {
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
            <RefreshCw className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">سياسة الاسترجاع والإلغاء</h1>
              <p className="text-gray-400 mt-2">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. سياسة الاسترجاع</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                نحن نؤمن بجودة خدماتنا ونريد أن تكون راضياً تماماً. لذلك نقدم سياسة استرجاع عادلة وشفافة.
              </p>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mt-6">
                <h3 className="text-xl font-bold text-primary mb-3">ضمان استرجاع الأموال لمدة 7 أيام</h3>
                <p className="text-gray-300 leading-relaxed">
                  إذا لم تكن راضياً عن الخدمة خلال أول 7 أيام من الاشتراك، يمكنك طلب استرجاع كامل المبلغ 
                  دون أي أسئلة.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. شروط الاسترجاع</h2>
              
              <h3 className="text-xl font-bold text-white mb-3 mt-6">2.1 الحالات المؤهلة للاسترجاع الكامل:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>طلب الاسترجاع خلال أول 7 أيام من الاشتراك</li>
                <li>مشاكل تقنية كبيرة لم نتمكن من حلها</li>
                <li>عدم القدرة على الوصول للمحتوى المدفوع</li>
                <li>محتوى مختلف تماماً عما تم الإعلان عنه</li>
              </ul>

              <h3 className="text-xl font-bold text-white mb-3 mt-6">2.2 الحالات غير المؤهلة للاسترجاع:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>مرور أكثر من 7 أيام على الاشتراك</li>
                <li>استخدام أكثر من 70% من المحتوى</li>
                <li>انتهاك الشروط والأحكام</li>
                <li>إساءة استخدام سياسة الاسترجاع</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. الاسترجاع الجزئي</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                في بعض الحالات، قد نقدم استرجاع جزئي:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>إلغاء الاشتراك في منتصف الشهر: استرجاع نسبي حسب الأيام المتبقية</li>
                <li>مشاكل تقنية بسيطة: استرجاع جزئي بناءً على التأثير</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. كيفية طلب الاسترجاع</h2>
              
              <div className="bg-dark rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">أرسل بريد إلكتروني</h4>
                    <p className="text-gray-300">
                      أرسل طلب استرجاع إلى: <a href="mailto:refund@ti3lab.com" className="text-primary hover:underline">refund@ti3lab.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">أضف المعلومات المطلوبة</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• اسمك الكامل</li>
                      <li>• البريد الإلكتروني المسجل</li>
                      <li>• رقم الفاتورة</li>
                      <li>• سبب الاسترجاع</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">انتظر المراجعة</h4>
                    <p className="text-gray-300">
                      سنراجع طلبك خلال 3-5 أيام عمل ونخطرك بالقرار
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">استلام المبلغ</h4>
                    <p className="text-gray-300">
                      بعد الموافقة، سيتم إرجاع المبلغ خلال 7-14 يوم عمل
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. سياسة الإلغاء</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                يمكنك إلغاء اشتراكك في أي وقت من خلال:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>تسجيل الدخول لحسابك</li>
                <li>الانتقال إلى صفحة الإعدادات</li>
                <li>اختيار "إلغاء الاشتراك"</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                بعد الإلغاء، ستظل لديك إمكانية الوصول حتى نهاية فترة الفوترة الحالية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. استثناءات</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>العروض الترويجية الخاصة قد تحتوي على شروط استرجاع مختلفة</li>
                <li>الاشتراكات السنوية لها سياسة استرجاع مختلفة</li>
                <li>المحتوى المخصص أو الاستشارات الفردية غير قابلة للاسترجاع</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. الاتصال</h2>
              <p className="text-gray-300 leading-relaxed">
                لأي استفسارات حول سياسة الاسترجاع:
              </p>
              <div className="bg-dark rounded-lg p-4 mt-4 space-y-2">
                <p className="text-gray-300">
                  📧 البريد: <a href="mailto:refund@ti3lab.com" className="text-primary hover:underline">refund@ti3lab.com</a>
                </p>
                <p className="text-gray-300">
                  📞 الدعم: متاح من السبت إلى الخميس، 9 صباحاً - 5 مساءً
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
