import type { Project, ProjectTestCase } from '../types/database';

export interface ProjectTestExecution {
  testId: string;
  descriptionAr: string;
  passed: boolean;
  error?: string;
}

export function buildProjectTestScript(
  userCode: string,
  testCase: ProjectTestCase
): string {
  return `${userCode}\n\n# --- Project Automated Test: ${testCase.id} ---\n${testCase.pythonTestCode}\nprint("__TEST_PASSED__:${testCase.id}")`;
}

export function summarizeProjectRun(
  project: Project,
  results: ProjectTestExecution[]
): {
  passedTests: number;
  totalTests: number;
  passed: boolean;
} {
  const totalTests = project.testCases.length;
  const passedTests = results.filter((r) => r.passed).length;
  return {
    passedTests,
    totalTests,
    passed: totalTests > 0 && passedTests === totalTests,
  };
}

export function sanitizePythonErrorMessage(rawError: string): string {
  const lines = rawError.trim().split('\n');
  if (lines.length === 0) return 'خطأ غير معروف في التنفيذ';
  return lines.slice(-4).join('\n');
}
