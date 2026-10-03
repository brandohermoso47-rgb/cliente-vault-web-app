import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'classes-collection'),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'class-document'),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./firebase', () => ({ db: 'test-db' }));

import { subscribeInstructorClasses } from './instructor';

describe('instructor class Firestore paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the classes subcollection directly under the user for class subscriptions', () => {
    subscribeInstructorClasses('teacher-1', vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith('test-db', 'users/teacher-1/classes');
  });
});
