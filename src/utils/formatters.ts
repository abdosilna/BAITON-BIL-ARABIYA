export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} س ${rem} د` : `${hours} ساعة`;
}

export function formatArabicDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
}

export function formatTimeShort(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

export function getCourseCompletionPercentage(
  courseId: string,
  totalCourseLessons: number,
  completedLessonIds: Set<string>,
  lessonToCourseMap: Map<string, string>
): number {
  if (totalCourseLessons === 0) return 0;
  let completed = 0;
  for (const lessonId of completedLessonIds) {
    if (lessonToCourseMap.get(lessonId) === courseId) {
      completed += 1;
    }
  }
  return Math.min(100, Math.round((completed / totalCourseLessons) * 100));
}
