export interface PlaygroundExample {
  id: string;
  titleAr: string;
  categoryAr: string;
  code: string;
}

export const PLAYGROUND_EXAMPLES: PlaygroundExample[] = [
  {
    id: 'ex-hello',
    titleAr: 'الترحيب بالعربية والحساب',
    categoryAr: 'أساسيات',
    code: `print("مرحبا بالعالم")\nx = 10\ny = 20\nprint(x + y)\nfor i in range(5):\n    print(i)`,
  },
  {
    id: 'ex-fibonacci',
    titleAr: 'متتالية فيبوناتشي',
    categoryAr: 'حلقات ودوال',
    code: `def fibonacci(n):\n    seq = [0, 1]\n    while len(seq) < n:\n        seq.append(seq[-1] + seq[-2])\n    return seq[:n]\n\nprint("أول 10 أعداد:", fibonacci(10))`,
  },
  {
    id: 'ex-oop-inventory',
    titleAr: 'إدارة مخزون بـ OOP',
    categoryAr: 'كائنية التوجه',
    code: `class Product:\n    def __init__(self, name, price, qty):\n        self.name = name\n        self.price = price\n        self.qty = qty\n\n    def total_value(self):\n        return self.price * self.qty\n\nitems = [\n    Product("لوحة مفاتيح", 120, 4),\n    Product("شاشة برمجة", 850, 2),\n]\nfor item in items:\n    print(f"{item.name}: {item.total_value()} ر.س")`,
  },
  {
    id: 'ex-json-parse',
    titleAr: 'تحليل بيانات JSON',
    categoryAr: 'APIs و JSON',
    code: `import json\n\nraw = '{"platform": "بايتون بالعربية", "levels": 13, "topics": ["Python", "OOP", "Testing"]}'\ndata = json.loads(raw)\nprint("المنصة:", data["platform"])\nfor idx, topic in enumerate(data["topics"], start=1):\n    print(f"{idx}. {topic}")`,
  },
  {
    id: 'ex-error-demo',
    titleAr: 'تجربة اصطياد الأخطاء',
    categoryAr: 'معالجة الأخطاء',
    code: `# جرّب إزالة try/except لمشاهدة ZeroDivisionError\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError as err:\n    print("تم التقاط الخطأ بأمان:", err)`,
  },
];
