# المعمارية الرئيسية — بايتون بالعربية (BAITON BIL ARABIYA)

## 1. النظرة العامة
تم تصميم منصة **بايتون بالعربية** كمنصة تعليمية تفاعلية عربية (RTL) لتعليم لغة Python من الصفر (Level 0) حتى بناء المشاريع الحقيقية (Level 12)، مع فصل تام بين واجهة المستخدم والخدمات الخارجية عبر طبقة Adapters.

## 2. الطبقات المعمارية
- **UI & Pages (`src/pages/`, `src/components/`, `src/layouts/`)**: مكونات React + TypeScript + Tailwind CSS بتصميم داكن متجاوب (Sidebar للحاسوب + Bottom Navigation للهاتف).
- **State Layer (`src/store/useAppStore.ts`)**: إدارة الحالة عبر Zustand مع التحقق عبر Zod (`src/types/schemas.ts`).
- **Pure Domain Logic (`src/utils/`)**: حساب XP والمستويات والسلاسل والأوسمة، وتقييم التمارين والمشاريع بدوال نقية قابلة للاختبار السريع.
- **Service Adapters (`src/services/`)**:
  - `DatabaseAdapter`: حاليًا `LocalDatabaseAdapter` (IndexedDB) + `SupabaseAdapter.placeholder.ts` للمرحلة التالية.
  - `AuthAdapter`: حاليًا `LocalAuthAdapter` (Demo بدون كلمة مرور) + `SupabaseAuthAdapter.placeholder.ts`.
  - `AIProvider` & `AIService`: حاليًا `MockAIProvider` + `GeminiProvider.placeholder.ts` و `OpenAIProvider.placeholder.ts`.
  - `PythonRuntime` & `PythonWorker`: تنفيذ Python محليًا عبر Pyodide داخل Web Worker معزول.
  - `SpeechService`: قراءة النصوص العربية عبر Web Speech Synthesis مع بديل نصي دائم.
  - `StorageAdapter`: `LocalStorageAdapter` للإعدادات البسيطة فقط.
