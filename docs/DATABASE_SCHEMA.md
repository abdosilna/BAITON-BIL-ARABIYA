# مخطط قاعدة البيانات المستقبلية (Supabase Postgres)

جميع الجداول التالية معرفة في `src/types/database.ts` وجاهزة للتحويل المباشر إلى Supabase عبر الملفات:
- `docs/sql/schema.sql`
- `docs/sql/rls_policies.sql`

## الجداول والعلاقات
1. `profiles` (`id` PK -> `auth.users(id)`)
2. `courses` (`id` PK, `level_number` UNIQUE)
3. `modules` (`id` PK, `course_id` FK -> `courses.id`)
4. `lessons` (`id` PK, `module_id` FK -> `modules.id`, `course_id` FK -> `courses.id`)
5. `exercises` (`id` PK, `lesson_id` FK -> `lessons.id`, `course_id` FK -> `courses.id`)
6. `questions` (`id` PK, `module_id` FK -> `modules.id`)
7. `submissions` (`id` PK, `user_id` FK -> `profiles.id`, `exercise_id` FK -> `exercises.id`)
8. `progress` (`id` PK, `user_id` FK -> `profiles.id`, `lesson_id` FK -> `lessons.id`, UNIQUE `(user_id, lesson_id)`)
9. `achievements` (`id` PK)
10. `user_achievements` (`id` PK, `user_id` FK -> `profiles.id`, `achievement_id` FK -> `achievements.id`, UNIQUE `(user_id, achievement_id)`)
11. `daily_activity` (`id` PK, `user_id` FK -> `profiles.id`, `date`, UNIQUE `(user_id, date)`)
12. `ai_conversations` (`id` PK, `user_id` FK -> `profiles.id`)
13. `projects` (`id` PK)
14. `project_submissions` (`id` PK, `user_id` FK -> `profiles.id`, `project_id` FK -> `projects.id`)

> ملاحظة: في المرحلة الأولى (Local Demo Mode)، تُخزن جميع هذه الكيانات محليًا في IndexedDB داخل المتصفح.
