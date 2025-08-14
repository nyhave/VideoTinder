import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import AdBanner from './AdBanner.jsx';

jest.mock('../i18n.js', () => ({
  useT: () => (key) => {
    const map = {
      adBannerText: 'Upgrade to {tier}',
      adBannerButton: 'Upgrade',
      adInviteText: 'Invite a friend',
      adInviteButton: 'Invite',
      adRealettenText: 'Try Realetten',
      adRealettenButton: 'Connect',
      tierSilver: 'Silver'
    };
    return map[key] || key;
  }
}));

describe('AdBanner', () => {
  let container;
  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
    jest.useRealTimers();
  });

  test('cycles through ads for free tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'free' }} />, container);
    expect(container.textContent).toContain('Upgrade to Silver');
    act(() => { jest.advanceTimersByTime(5000); });
    expect(container.textContent).toContain('Invite a friend');
    act(() => { jest.advanceTimersByTime(5000); });
    expect(container.textContent).toContain('Try Realetten');
  });

  test('renders nothing for silver tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'silver' }} />, container);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing for gold tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'gold' }} />, container);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing for platinum tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'platinum' }} />, container);
    expect(container.innerHTML).toBe('');
  });

  test('Realetten ad redirects to interest chat', () => {
    act(() => { ReactDOM.render(<AdBanner user={{ subscriptionTier: 'free' }} />, container); });
    act(() => { jest.advanceTimersByTime(10000); });
    expect(container.textContent).toContain('Try Realetten');
    const handler = jest.fn();
    window.addEventListener('showInterestChat', handler);
    const button = container.querySelector('button');
    act(() => {
      button.click();
    });
    expect(handler).toHaveBeenCalled();
    window.removeEventListener('showInterestChat', handler);
  });
});

