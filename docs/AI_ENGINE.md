# محرك المعلم الذكي (AI Engine Architecture)

## الحالة الحالية
- **AI Provider Status**: `Not Connected`
- **AI Mode**: `Mock / Demo`
- المزود النشط افتراضيًا هو `MockAIProvider` (`src/services/ai/MockAIProvider.ts`).

## واجهة المزود (`AIProvider`)
كل مزود ذكاء اصطناعي ينفذ الواجهة الموحدة `src/services/ai/AIProvider.ts`:
- `getStatus()`
- `generateReply(context: AIRequestContext)`

## الأوضاع الأربعة المدعومة
1. `teacher`: شرح المفاهيم وتبسيط الدروس حسب مستوى المتعلم.
2. `debugging`: تحليل رسائل الخطأ مثل `ZeroDivisionError` و `SyntaxError` و `IndentationError`.
3. `practice`: توليد تحديات وتمارين برمجية متناسبة مع مستوى المتعلم.
4. `explain`: شرح أي مقطع كود Python سطرًا بسطر.

## خطة ربط Gemini / OpenAI في المرحلة الثانية
- يتم استبدال الاستدعاء داخل `GeminiProviderPlaceholder` أو `OpenAIProviderPlaceholder` ليتصل بمسار Proxy خلفي (`/api/ai/gemini` أو `/api/ai/openai`).
- يُمنع وضع أي مفاتيح API داخل ملفات Frontend.
