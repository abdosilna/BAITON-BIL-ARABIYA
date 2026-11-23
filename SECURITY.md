# سياسة وضوابط الأمان — بايتون بالعربية (BAITON BIL ARABIYA)

## 1. حدود النسخة الحالية (Local Demo Mode)
- هذه النسخة تعمل بالكامل في **وضع التجربة المحلي (Local Demo Mode)**.
- نظام الدخول (`LocalAuthAdapter`) لا يعتمد كلمات مرور حقيقية ولا يصلح كمصادقة إنتاجية متعددة المستخدمين؛ هو مخصص للتجربة المحلية فقط.
- صلاحيات الإدارة في لوحة الإدارة (`/admin`) هي محاكاة محلية ولا تمثل تحكم وصول إنتاجي.

## 2. حماية الأسرار وبيئة التشغيل
- لا توجد أي مفاتيح API حقيقية أو وهمية داخل ملفات الواجهة الأمامية (`src/`).
- مفاتيح الخدمات المستقبلية (`GEMINI_API_KEY` وغيرها) تُحفظ في متغيرات البيئة على الخادم فقط ولا تُضمّن في حزمة المتصفح.
- لا يتم تخزين أي كلمات مرور كنص صريح في `localStorage` أو `IndexedDB`.

## 3. عزل بيئة تنفيذ Python (Pyodide Web Worker)
- يتم تنفيذ كود المتعلم بالكامل داخل المتصفح عبر **Pyodide Web Worker** (`src/services/python/PythonWorker.ts`).
- لا يُنفذ كود المستخدم على خادم التطبيق الرئيسي إطلاقًا.
- يتمتع Web Worker بعزل معماري عن `window` و `document` و `localStorage`.
- يتم حذف وحدة `js` من `sys.modules` قبل التنفيذ لمنع الوصول إلى جسور JavaScript.
- يفرض `PythonRuntime.ts` مهلة زمنية صارمة (Timeout) مع إمكانية إيقاف التنفيذ وإنهاء الـ Worker فورًا (`worker.terminate()`) لمنع تجمد الواجهة عند الحلقات اللانهائية.

## 4. التحقق من المدخلات وتأمين العرض
- جميع النماذج والمدخلات تُتحقق عبر **Zod** (`src/types/schemas.ts`).
- تعتمد الواجهة على ربط نصوص React الآمن دون استخدام `dangerouslySetInnerHTML` أو `innerHTML`.

## 5. متطلبات الأمان قبل النشر الإنتاجي العام
1. ربط **Supabase Auth** واستبدال `LocalAuthAdapter` بـ `SupabaseAuthAdapter`.
2. تطبيق الجداول وسياسات **Row-Level Security (RLS)** الموثقة في `docs/sql/rls_policies.sql`.
3. إنشاء Proxy خادمي (`/api/*`) للتواصل مع Gemini / OpenAI مع Rate Limiting.
4. مراجعة سياسات CSP (Content Security Policy) وتقييد CORS للنطاق الرسمي فقط.
