import type {
  AIProvider,
  AIProviderStatus,
  AIRequestContext,
  AIResponse,
} from './AIProvider';

export class MockAIProvider implements AIProvider {
  readonly id = 'mock';
  readonly isConnected = false;
  readonly providerName = 'MockAIProvider (وضع العرض المحلي)';

  getStatus(): AIProviderStatus {
    return {
      connected: false,
      modeLabel: 'Mock / Demo',
      providerName: this.providerName,
      noticeAr:
        'تنبيه: مزود الذكاء الاصطناعي الحقيقي (Gemini / OpenAI) غير مربوط حاليًا. يتم توليد الردود محليًا عبر MockAIProvider للتجربة.',
    };
  }

  async generateReply(context: AIRequestContext): Promise<AIResponse> {
    if (context.simulateOffline) {
      throw new Error('تعذر الاتصال بخدمة المعلم الذكي (محاكاة انقطاع الخدمة).');
    }

    const prompt = context.prompt.trim();
    if (!prompt) {
      throw new Error('يرجى كتابة سؤال أو لصق كود Python قبل الإرسال.');
    }

    const lower = prompt.toLowerCase();
    const code = (context.codeContext ?? '').trim();
    const levelNote =
      context.learnerLevel <= 3
        ? 'بأسلوب مبسط للمبتدئين'
        : context.learnerLevel <= 7
          ? 'بأسلوب عملي للمستوى المتوسط'
          : 'بأسلوب هندسي متقدم';

    // Handle explicit debugging mode or Python tracebacks
    if (
      context.mode === 'debugging' ||
      lower.includes('error') ||
      lower.includes('خطأ') ||
      lower.includes('traceback')
    ) {
      if (lower.includes('zerodivision') || code.includes('/ 0') || code.includes('/0')) {
        return {
          content:
            `تحليل الخطأ (${levelNote}):\n` +
            `يحدث **ZeroDivisionError** عندما يحاول البرنامج القسمة على الصفر.\n\n` +
            `الحل المقترح:\n` +
            `1. تحقق من المقسوم عليه قبل القسمة: \`if b != 0:\`\n` +
            `2. أو التقط الخطأ بأمان عبر \`try / except ZeroDivisionError:\`.\n\n` +
            `مثال عملي:\n` +
            `\`\`\`python\ntry:\n    result = a / b\nexcept ZeroDivisionError:\n    print("لا يمكن القسمة على صفر")\n\`\`\``,
          isMock: true,
          providerName: this.providerName,
          suggestedFollowUps: ['كيف أستخدم finally مع try/except؟', 'أعطني تمرينًا على معالجة الأخطاء'],
        };
      }

      if (lower.includes('syntax') || lower.includes('indentation')) {
        return {
          content:
            `فحص الصياغة (Debugging Mode):\n` +
            `أكثر أسباب **SyntaxError** و **IndentationError** شيوعًا في Python:\n` +
            `• نسيان النقطتين الرأسيتين \`:\` في نهاية \`if\` أو \`for\` أو \`def\`.\n` +
            `• عدم توحيد المسافات البادئة (4 مسافات لكل كتلة).\n` +
            `• نسيان إغلاق علامة تنصيص أو قوس \`)\`.\n\n` +
            `تلميح: انظر دائمًا إلى السطر الذي يسبق السطر المذكور في رسالة الخطأ.`,
          isMock: true,
          providerName: this.providerName,
          suggestedFollowUps: ['اشرح لي قواعد Indentation', 'لماذا يظهر NameError؟'],
        };
      }

      return {
        content:
          `تشخيص الكود (${levelNote}):\n` +
          (code
            ? `قمت بمراجعة الكود المرفق (${code.split('\n').length} أسطر). تأكد من:\n`
            : `لتحليل أدق، أرفق رسالة الخطأ أو الكود في حقل الكود.\n`) +
          `1. تطابق أنواع البيانات قبل العمليات (مثل \`int\` مع \`str\`).\n` +
          `2. تهيئة جميع المتغيرات قبل قراءتها.\n` +
          `3. إضافة \`print()\` مؤقتة لتتبع قيمة المتغير قبل السطر المتعطل.`,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['حلل خطأ TypeError', 'أعطني مثالًا على تصحيح حلقة for'],
      };
    }

    // Explain Code Mode
    if (context.mode === 'explain') {
      const targetCode = code || prompt;
      const lines = targetCode.split('\n').filter((l) => l.trim().length > 0);
      const breakdown = lines
        .slice(0, 6)
        .map((line, i) => {
          const t = line.trim();
          if (t.startsWith('def ')) return `السطر ${i + 1}: يعرّف دالة جديدة (${t}).`;
          if (t.startsWith('for ')) return `السطر ${i + 1}: يبدأ حلقة تكرارية للمرور على العناصر.`;
          if (t.startsWith('if ') || t.startsWith('elif ')) return `السطر ${i + 1}: يفحص شرطًا منطقيًا لتحديد مسار التنفيذ.`;
          if (t.startsWith('print(')) return `السطر ${i + 1}: يطبع النتيجة في شاشة الإخراج.`;
          if (t.includes('=')) return `السطر ${i + 1}: يخزن قيمة داخل متغير في الذاكرة.`;
          return `السطر ${i + 1}: ينفّذ تعليمة Python (${t.slice(0, 40)}).`;
        })
        .join('\n');

      return {
        content:
          `شرح الكود خطوة بخطوة (${levelNote}):\n\n` +
          (breakdown || 'أرفق سطور Python في خانة الكود وسأفصل لك عمل كل سطر.') +
          `\n\nالخلاصة: يتبع Python التنفيذ من الأعلى للأسفل مع احترام الكتل المزاحة.`,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['بسّط الشرح أكثر', 'كيف أحسّن هذا الكود؟'],
      };
    }

    // Practice Mode
    if (context.mode === 'practice') {
      return {
        content:
          `تحدٍ تدريبي مخصص لمستواك (المستوى ${context.learnerLevel}):\n\n` +
          `المطلوب: اكتب دالة Python باسم \`count_vowels(text)\` تحسب عدد أحرف العلة الإنجليزية (\`a, e, i, o, u\`) في أي نص مُدخل، بغض النظر عن حالة الأحرف.\n\n` +
          `تلميح:\n` +
          `• حوّل النص إلى أحرف صغيرة عبر \`text.lower()\`.\n` +
          `• مرّ بحلقة \`for\` على كل حرف وتحقق من وجوده في \`"aeiou"\`.\n\n` +
          `جرّب الحل في Python Playground ثم شاركني نتيجتك!`,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['أعطني تلميحًا إضافيًا', 'اشرح لي الحل النموذجي'],
      };
    }

    // Default Teacher Mode with topic detection
    if (lower.includes('loop') || lower.includes('for') || lower.includes('while') || prompt.includes('حلق')) {
      return {
        content:
          `شرح الحلقات التكرارية (${levelNote}):\n` +
          `الحلقة التكرارية توفر عليك إعادة كتابة نفس الأمر عشرات المرات:\n` +
          `• استخدم \`for i in range(5):\` عندما تعرف عدد التكرارات أو تمر على قائمة.\n` +
          `• استخدم \`while condition:\` عندما يعتمد التوقف على شرط متغير.\n\n` +
          `\`\`\`python\nfor step in range(1, 4):\n    print(f"التكرار رقم {step}")\n\`\`\``,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['ما الفرق بين break و continue؟', 'أعطني تمرينًا على الحلقات'],
      };
    }

    if (lower.includes('function') || lower.includes('def') || prompt.includes('دال')) {
      return {
        content:
          `شرح الدوال Functions (${levelNote}):\n` +
          `الدالة تجمع كودًا يؤدي مهمة محددة تحت اسم واضح يمكن استدعاؤه متى شئت:\n` +
          `• \`def\` لتعريف الدالة.\n` +
          `• المعاملات بين القوسين تستقبل المدخلات.\n` +
          `• \`return\` تعيد القيمة النهائية.\n\n` +
          `\`\`\`python\ndef add(a, b):\n    return a + b\n\nprint(add(4, 6))  # 10\n\`\`\``,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['ما الفرق بين print و return؟', 'اشرح المعاملات الافتراضية'],
      };
    }

    if (lower.includes('list') || lower.includes('dict') || prompt.includes('قائم') || prompt.includes('قاموس')) {
      return {
        content:
          `هياكل البيانات الأساسية (${levelNote}):\n` +
          `• **List** \`[1, 2, 3]\`: تحفظ عناصر مرتبة وقابلة للتعديل عبر \`append()\`.\n` +
          `• **Dictionary** \`{"name": "أحمد"}\`: يربط كل مفتاح بقيمة لسرعة البحث.\n\n` +
          `قاعدة سريعة: استخدم List للتسلسلات، و Dictionary عند الحاجة للوصول بالاسم أو المفتاح.`,
        isMock: true,
        providerName: this.providerName,
        suggestedFollowUps: ['كيف أدمج قائمتين؟', 'أعطني مثالًا على القاموس'],
      };
    }

    return {
      content:
        `أهلاً بك في وضع المعلم التجريبي (${levelNote}).\n` +
        `سؤالك حول: "${prompt}"\n\n` +
        `إليك خلاصة تعليمية مركزة:\n` +
        `1. قسّم الفكرة البرمجية إلى مدخلات (Inputs)، معالجة (Logic)، ومخرجات (Outputs).\n` +
        `2. اختبر كل جزء صغير داخل Python Playground قبل دمجه في برنامج كبير.\n` +
        `3. راجع الدروس التفاعلية المرتبطة بالمستوى ${context.learnerLevel} لتطبيق المفهوم عمليًا.`,
      isMock: true,
      providerName: this.providerName,
      suggestedFollowUps: ['اشرح لي المتغيرات وأنواعها', 'أعطني تمرينًا تطبيقيًا', 'كيف أكتشف أخطاء الكود؟'],
    };
  }
}
