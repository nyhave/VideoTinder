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
      tierGold: 'Gold'
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
    expect(container.textContent).toContain('Upgrade to Gold');
    act(() => { jest.advanceTimersByTime(5000); });
    expect(container.textContent).toContain('Invite a friend');
    act(() => { jest.advanceTimersByTime(5000); });
    expect(container.textContent).toContain('Upgrade to Gold');
  });

  test('renders nothing for gold tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'gold' }} />, container);
    expect(container.innerHTML).toBe('');
  });

});

