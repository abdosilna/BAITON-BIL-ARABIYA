import type { Project } from '../types/database';

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-calculator',
    titleAr: 'مشروع 1: الآلة الحاسبة الآمنة',
    titleEn: 'Calculator',
    levelRequired: 3,
    difficulty: 'مبتدئ',
    goalAr: 'بناء دالة حاسبة تدعم العمليات الأربع الأساسية وتعالج القسمة على صفر والعمليات غير المعروفة بأمان.',
    requirementsAr: [
      'تعريف الدالة calculate(a, b, op)',
      'دعم العمليات: "+" و "-" و "*" و "/"',
      'إطلاق ValueError عند تمرير عملية غير مدعومة أو القسمة على صفر',
    ],
    hintsAr: [
      'استخدم سلسلة if / elif لفحص قيمة op.',
      'تأكد من فحص b == 0 قبل تنفيذ القسمة a / b.',
    ],
    starterCode: `def calculate(a, b, op):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        if b == 0:
            raise ValueError("لا يمكن القسمة على صفر")
        return a / b
    else:
        raise ValueError("عملية غير مدعومة")
`,
    testCases: [
      {
        id: 'calc-1',
        descriptionAr: 'اختبار الجمع والطرح والضرب',
        pythonTestCode: 'assert calculate(10, 5, "+") == 15\nassert calculate(10, 5, "-") == 5\nassert calculate(4, 3, "*") == 12',
      },
      {
        id: 'calc-2',
        descriptionAr: 'اختبار القسمة الصحيحة',
        pythonTestCode: 'assert calculate(20, 4, "/") == 5',
      },
      {
        id: 'calc-3',
        descriptionAr: 'رفض القسمة على صفر بإطلاق ValueError',
        pythonTestCode: 'raised = False\ntry:\n    calculate(5, 0, "/")\nexcept ValueError:\n    raised = True\nassert raised is True',
      },
    ],
    xpReward: 100,
  },
  {
    id: 'proj-guessing-game',
    titleAr: 'مشروع 2: محرك لعبة تخمين الأرقام',
    titleEn: 'Number Guessing Game',
    levelRequired: 4,
    difficulty: 'مبتدئ',
    goalAr: 'بناء منطق لعبة تخمين الأرقام الذي يقيّم محاولة اللاعب ويعطي تلميحًا دقيقًا.',
    requirementsAr: [
      'تعريف دالة evaluate_guess(secret, guess)',
      'إرجاع "صحيح" عند تطابق الرقمين',
      'إرجاع "أكبر" إذا كان التخمين أصغر من السر، و"أصغر" إذا كان التخمين أكبر من السر',
    ],
    hintsAr: [
      'قارن guess مع secret باستخدام الشروط الثلاثية.',
      'تأكد من تطابق النصوص العربية المرجعة تمامًا.',
    ],
    starterCode: `def evaluate_guess(secret, guess):
    if guess == secret:
        return "صحيح"
    elif guess < secret:
        return "أكبر"
    else:
        return "أصغر"
`,
    testCases: [
      {
        id: 'guess-1',
        descriptionAr: 'التحقق من التخمين المطابق',
        pythonTestCode: 'assert evaluate_guess(42, 42) == "صحيح"',
      },
      {
        id: 'guess-2',
        descriptionAr: 'توجيه اللاعب نحو رقم أكبر',
        pythonTestCode: 'assert evaluate_guess(50, 30) == "أكبر"',
      },
      {
        id: 'guess-3',
        descriptionAr: 'توجيه اللاعب نحو رقم أصغر',
        pythonTestCode: 'assert evaluate_guess(10, 25) == "أصغر"',
      },
    ],
    xpReward: 110,
  },
  {
    id: 'proj-todo-app',
    titleAr: 'مشروع 3: مدير المهام اليومية To-Do App',
    titleEn: 'To-Do App',
    levelRequired: 5,
    difficulty: 'متوسط',
    goalAr: 'بناء صنف أو دوال لإدارة المهام: إضافة مهمة، إكمال مهمة، وحساب المهام المعلقة.',
    requirementsAr: [
      'إنشاء صنف TodoManager بقائمة مهام tasks',
      'إضافة مهمة عبر add_task(title) مع رفض العناوين الفارغة',
      'وسم مهمة كمكتملة عبر complete_task(index) وإرجاع عدد المهام غير المكتملة عبر pending_count()',
    ],
    hintsAr: [
      'خزّن كل مهمة كقاموس {"title": clean_title, "done": False}.',
      'استخدم title.strip() للتحقق من عدم فراغ العنوان.',
    ],
    starterCode: `class TodoManager:
    def __init__(self):
        self.tasks = []

    def add_task(self, title):
        clean = title.strip()
        if not clean:
            raise ValueError("العنوان فارغ")
        self.tasks.append({"title": clean, "done": False})

    def complete_task(self, index):
        if 0 <= index < len(self.tasks):
            self.tasks[index]["done"] = True

    def pending_count(self):
        return sum(1 for t in self.tasks if not t["done"])
`,
    testCases: [
      {
        id: 'todo-1',
        descriptionAr: 'إضافة مهام جديدة وحساب المهام المعلقة',
        pythonTestCode: 'tm = TodoManager()\ntm.add_task("مراجعة الدروس")\ntm.add_task("حل التمارين")\nassert tm.pending_count() == 2',
      },
      {
        id: 'todo-2',
        descriptionAr: 'إكمال مهمة وتحديث العداد',
        pythonTestCode: 'tm = TodoManager()\ntm.add_task("كتابة كود")\ntm.complete_task(0)\nassert tm.pending_count() == 0',
      },
      {
        id: 'todo-3',
        descriptionAr: 'رفض المهام ذات العنوان الفارغ',
        pythonTestCode: 'tm = TodoManager()\nfailed = False\ntry:\n    tm.add_task("   ")\nexcept ValueError:\n    failed = True\nassert failed is True',
      },
    ],
    xpReward: 130,
  },
  {
    id: 'proj-contact-manager',
    titleAr: 'مشروع 4: مدير جهات الاتصال',
    titleEn: 'Contact Manager',
    levelRequired: 6,
    difficulty: 'متوسط',
    goalAr: 'تطوير نظام لحفظ جهات الاتصال والبحث السريع عنها بالاسم أو الجزء الأول منه.',
    requirementsAr: [
      'إنشاء صنف ContactBook',
      'إضافة جهة اتصال عبر add(name, phone)',
      'البحث عبر search(query) لإرجاع قائمة الأسماء المطابقة دون حساسية لحالة الأحرف',
    ],
    hintsAr: [
      'استخدم .lower() عند مقارنة query مع أسماء جهات الاتصال.',
    ],
    starterCode: `class ContactBook:
    def __init__(self):
        self.contacts = {}

    def add(self, name, phone):
        self.contacts[name.strip()] = phone.strip()

    def search(self, query):
        q = query.strip().lower()
        return [
            {"name": name, "phone": phone}
            for name, phone in self.contacts.items()
            if q in name.lower()
        ]
`,
    testCases: [
      {
        id: 'contact-1',
        descriptionAr: 'إضافة جهات اتصال والبحث الجزئي',
        pythonTestCode: 'cb = ContactBook()\ncb.add("Ahmad Ali", "050111")\ncb.add("Sara Noor", "050222")\nres = cb.search("ahmad")\nassert len(res) == 1 and res[0]["phone"] == "050111"',
      },
      {
        id: 'contact-2',
        descriptionAr: 'البحث عن اسم غير موجود يعيد قائمة فارغة',
        pythonTestCode: 'cb = ContactBook()\ncb.add("Omar", "055")\nassert cb.search("Zaid") == []',
      },
    ],
    xpReward: 140,
  },
  {
    id: 'proj-library',
    titleAr: 'مشروع 5: نظام إدارة المكتبة',
    titleEn: 'Library Management',
    levelRequired: 8,
    difficulty: 'متقدم',
    goalAr: 'نمذجة مكتبة رقمية تدعم إضافة الكتب واستعارتها وإرجاعها مع تتبع التوفر.',
    requirementsAr: [
      'إنشاء صنف Library يدير الكتب وحالة استعارتها',
      'دالة add_book(title)',
      'دالة borrow(title) تعيد True إذا تم الاستعارة بنجاح و False إذا كان مستعارًا مسبقًا',
      'دالة return_book(title) تعيد الكتاب لمتاح',
    ],
    hintsAr: [
      'خزّن كل كتاب في قاموس يربط العنوان بحالة available المنطقية.',
    ],
    starterCode: `class Library:
    def __init__(self):
        self.books = {}

    def add_book(self, title):
        self.books[title] = True

    def borrow(self, title):
        if self.books.get(title) is True:
            self.books[title] = False
            return True
        return False

    def return_book(self, title):
        if title in self.books:
            self.books[title] = True
            return True
        return False
`,
    testCases: [
      {
        id: 'lib-1',
        descriptionAr: 'استعارة كتاب متاح ومنع استعارته مرتين',
        pythonTestCode: 'lib = Library()\nlib.add_book("Clean Python")\nassert lib.borrow("Clean Python") is True\nassert lib.borrow("Clean Python") is False',
      },
      {
        id: 'lib-2',
        descriptionAr: 'إرجاع الكتاب ثم إعادة استعارته',
        pythonTestCode: 'lib = Library()\nlib.add_book("Algorithms")\nlib.borrow("Algorithms")\nassert lib.return_book("Algorithms") is True\nassert lib.borrow("Algorithms") is True',
      },
    ],
    xpReward: 160,
  },
  {
    id: 'proj-api-client',
    titleAr: 'مشروع 6: محلل استجابات API و JSON',
    titleEn: 'Simple API Client',
    levelRequired: 10,
    difficulty: 'متقدم',
    goalAr: 'بناء عميل بيانات يحلل استجابات JSON الواردة من واجهات برمجية ويتحقق من سلامة الحقول.',
    requirementsAr: [
      'إنشاء دالة parse_users_response(raw_json)',
      'التعامل الآمن مع نصوص JSON التالفة بإرجاع قائمة فارغة',
      'تصفية المستخدمين النشطين فقط (active == True) وإرجاع أسمائهم',
    ],
    hintsAr: [
      'استخدم json.loads داخل try / except json.JSONDecodeError.',
    ],
    starterCode: `import json

def parse_users_response(raw_json):
    try:
        payload = json.loads(raw_json)
    except (json.JSONDecodeError, TypeError):
        return []
    users = payload.get("users", [])
    return [u["name"] for u in users if isinstance(u, dict) and u.get("active") is True and "name" in u]
`,
    testCases: [
      {
        id: 'api-1',
        descriptionAr: 'استخراج المستخدمين النشطين من JSON صالح',
        pythonTestCode: 'raw = \'{"users": [{"name": "Amina", "active": true}, {"name": "Zaid", "active": false}]}\'\nassert parse_users_response(raw) == ["Amina"]',
      },
      {
        id: 'api-2',
        descriptionAr: 'التعامل الآمن مع JSON تالف دون انهيار',
        pythonTestCode: 'assert parse_users_response("{invalid json") == []',
      },
    ],
    xpReward: 180,
  },
];
