import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// This project doesn't enable vitest's `globals: true` (every test file
// explicitly imports describe/it/expect), so @testing-library/react's own
// auto-cleanup — which only registers itself when it finds a global
// `afterEach` — never kicks in. Without this, `render()` leaks DOM nodes
// across tests within a file and later assertions see duplicates.
afterEach(cleanup);
