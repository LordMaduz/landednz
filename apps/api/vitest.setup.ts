// Every test file starts with the bundle globalSetup built, as the server does at start-up.
import { loadContent } from './src/content/index.js';

await loadContent();
