import { aiService } from './ai/AIService';
import { LocalAuthAdapter } from './auth/LocalAuthAdapter';
import { LocalDatabaseAdapter } from './database/LocalDatabaseAdapter';
import { pythonRuntime } from './python/PythonRuntime';
import { speechService } from './speech/SpeechService';
import { localStorageAdapter } from './storage/LocalStorageAdapter';

export const dbAdapter = new LocalDatabaseAdapter();
export const authAdapter = new LocalAuthAdapter(dbAdapter, localStorageAdapter);

export { aiService, localStorageAdapter, pythonRuntime, speechService };
