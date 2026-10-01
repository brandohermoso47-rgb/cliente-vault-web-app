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

import {
  getMotionRecognitionData,
  saveMotionRecognitionData,
  subscribeInstructorClasses,
  subscribeMotionRecognitionData,
} from './instructor';

describe('instructor class Firestore paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the classes subcollection directly under the user for class subscriptions', () => {
    subscribeInstructorClasses('teacher-1', vi.fn());

    expect(firestore.collection).toHaveBeenCalledWith('test-db', 'users/teacher-1/classes');
  });

  it('saves, loads, and subscribes to motion data on the class document', async () => {
    const motionData = { events: [{ id: 'event-1' }] };
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ motionRecognitionData: motionData }),
    });

    await saveMotionRecognitionData('teacher-1', 'class-1', motionData);
    await expect(getMotionRecognitionData('teacher-1', 'class-1')).resolves.toEqual(motionData);
    subscribeMotionRecognitionData('teacher-1', 'class-1', vi.fn());

    expect(firestore.doc).toHaveBeenCalledWith('test-db', 'users/teacher-1/classes', 'class-1');
    expect(firestore.getDoc).toHaveBeenCalledWith('class-document');
    expect(firestore.onSnapshot).toHaveBeenCalledWith(
      'class-document',
      expect.any(Function),
      expect.any(Function)
    );
  });
});
