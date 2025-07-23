import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminScreen from '../components/AdminScreen.jsx';
import { LanguageProvider } from '../i18n.js';
import { deleteDoc } from '../firebase.js';

jest.mock('../firebase.js', () => ({
  db: {},
  storage: {},
  messaging: {},
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  deleteDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn((db, col, id) => ({ col, id })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  listAll: jest.fn(() => Promise.resolve({ items: [] })),
  ref: jest.fn(() => ({})),
  getDownloadURL: jest.fn(() => Promise.resolve('')),
  deleteObject: jest.fn(() => Promise.resolve()),
  setExtendedLogging: jest.fn(),
  isExtendedLogging: jest.fn(() => false),
  useDoc: jest.fn(() => ({}))
}));

describe('AdminScreen delete user', () => {
  test('clicking delete removes user', async () => {
    window.confirm = jest.fn(() => true);
    render(
      <LanguageProvider value={{ lang: 'en', setLang: () => {} }}>
        <AdminScreen profiles={[{ id: 'u1', name: 'User' }]} userId="u1" onSwitchProfile={() => {}} onOpenRevealTest={() => {}} />
      </LanguageProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete user' }));
    expect(deleteDoc).toHaveBeenCalled();
    const called = deleteDoc.mock.calls.some(c => c[0]?.col === 'profiles' && c[0]?.id === 'u1');
    expect(called).toBe(true);
  });
});
