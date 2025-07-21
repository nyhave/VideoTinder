import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from '../components/WelcomeScreen.jsx';
import { LanguageProvider } from '../i18n.js';
import { setDoc, doc } from '../firebase.js';

jest.mock('../firebase.js', () => ({
  db: {},
  auth: {},
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  increment: jest.fn(() => 'increment'),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

let nowSpy;
beforeEach(() => {
  nowSpy = jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-05-20T00:00:00Z').valueOf());
});

afterEach(() => {
  nowSpy.mockRestore();
  jest.clearAllMocks();
});

function renderWelcome(onLogin = jest.fn()) {
  return render(
    <LanguageProvider value={{ lang: 'en', setLang: () => {} }}>
      <WelcomeScreen onLogin={onLogin} />
    </LanguageProvider>
  );
}

// Test showing register form
test('shows registration form when clicking register', async () => {
  renderWelcome();
  const regButton = screen.getByRole('button', { name: 'Create profile' });
  await userEvent.click(regButton);
  expect(screen.getByPlaceholderText('Fornavn')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
});

// Test missing fields validation
test('shows missing fields overlay when required fields are empty', async () => {
  renderWelcome();
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));
  expect(await screen.findByText('Please fill out all required fields')).toBeInTheDocument();
});

// Test age validation
test('shows age error when user is under 18', async () => {
  renderWelcome();
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));
  await userEvent.type(screen.getByPlaceholderText('Fornavn'), 'Alice');
  await userEvent.type(screen.getByPlaceholderText('By'), 'City');
  await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@test.com');
  await userEvent.type(screen.getByPlaceholderText('username'), 'alice');
  await userEvent.type(screen.getByPlaceholderText('********'), 'pass123');
  await userEvent.type(screen.getByPlaceholderText('F\u00f8dselsdag'), '2010-01-01');
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));
  expect(await screen.findByText(/mindst 18 \u00e5r/)).toBeInTheDocument();
});

// Test successful registration

test('calls Firebase and onLogin when registration succeeds', async () => {
  const onLogin = jest.fn();
  renderWelcome(onLogin);
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));
  await userEvent.type(screen.getByPlaceholderText('Fornavn'), 'Bob');
  await userEvent.type(screen.getByPlaceholderText('By'), 'Town');
  await userEvent.type(screen.getByPlaceholderText('F\u00f8dselsdag'), '1990-01-01');
  await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'bob@test.com');
  await userEvent.type(screen.getByPlaceholderText('username'), 'bob');
  await userEvent.type(screen.getByPlaceholderText('********'), 'secret');
  await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));

  await waitFor(() => expect(setDoc).toHaveBeenCalled());
  expect(setDoc).toHaveBeenCalledTimes(1);

  // Overlay should show success message
  expect(await screen.findByText('Thanks for creating your profile!')).toBeInTheDocument();
  await userEvent.click(screen.getByText('Luk'));
  expect(onLogin).toHaveBeenCalledWith('1716163200000');
});
