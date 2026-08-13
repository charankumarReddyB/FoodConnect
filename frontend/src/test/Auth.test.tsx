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

  it('renders Google Sign-In button for donor by default', () => {
    renderAuth();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });

  it('renders Email & Password inputs with empty initial values', () => {
    renderAuth();
    const emailInput = screen.getByPlaceholderText(/Enter email address/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('');
  });

  it('switches to Register mode and shows Full Name input', () => {
    renderAuth();
    const registerBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(registerBtn);
    expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
  });

  it('hides Register tab for Admin role', () => {
    renderAuth('admin');
    expect(screen.queryByRole('button', { name: /Register Account/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Administrator Authentication Requires Password Verification/i)).toBeInTheDocument();
  });
});
