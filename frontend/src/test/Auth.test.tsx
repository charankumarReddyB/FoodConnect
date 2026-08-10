import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auth from '../screens/Auth';
import { LanguageProvider } from '../i18n/i18nContext';

describe('Auth Component & Validation Suite', () => {
  const renderAuth = (role: 'donor' | 'recipient' | 'volunteer' | 'admin' = 'donor') => {
    return render(
      <LanguageProvider>
        <Auth role={role} onBack={vi.fn()} onSuccess={vi.fn()} />
      </LanguageProvider>
    );
  };

  it('renders Mobile OTP tab by default', () => {
    renderAuth();
    expect(screen.getByText(/Mobile OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/Send OTP Code/i)).toBeInTheDocument();
  });

  it('switches to Email & Password mode and validates input', () => {
    renderAuth();
    const emailTab = screen.getByText(/Email & Password/i);
    fireEvent.click(emailTab);
    expect(screen.getByPlaceholderText(/arjun@example.com/i)).toBeInTheDocument();
  });

  it('switches to Register mode when in Email auth method', () => {
    renderAuth();
    fireEvent.click(screen.getByText(/Email & Password/i));
    const registerBtn = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerBtn);
    expect(screen.getByPlaceholderText(/Arjun Sharma/i)).toBeInTheDocument();
  });

  it('renders Google Sign-In button correctly', () => {
    renderAuth();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });
});
