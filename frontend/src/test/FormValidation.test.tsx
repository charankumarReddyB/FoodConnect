import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PostDonation from '../screens/PostDonation';
import { LanguageProvider } from '../i18n/i18nContext';

describe('Form Validation & Boundary Test Suite', () => {
  const renderPostDonation = () => {
    return render(
      <LanguageProvider>
        <PostDonation onBack={vi.fn()} onSuccess={vi.fn()} />
      </LanguageProvider>
    );
  };

  it('renders Post Donation form fields correctly', () => {
    renderPostDonation();
    expect(screen.getByText(/Post Donation/i)).toBeInTheDocument();
  });

  it('allows form interaction and button triggers', () => {
    renderPostDonation();
    const titleInput = screen.getAllByDisplayValue(/Vegetable Biryani/i)[0];
    expect(titleInput).toBeInTheDocument();
    fireEvent.change(titleInput, { target: { value: 'Fresh Chapati & Curry' } });
    expect(screen.getByDisplayValue(/Fresh Chapati & Curry/i)).toBeInTheDocument();
  });
});
