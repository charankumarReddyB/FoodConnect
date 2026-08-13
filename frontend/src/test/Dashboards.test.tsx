import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DonorDashboard from '../screens/DonorDashboard';
import RecipientDashboard from '../screens/RecipientDashboard';
import VolunteerDashboard from '../screens/VolunteerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import { LanguageProvider } from '../i18n/i18nContext';

describe('Dashboards Component Suite', () => {
  it('renders Donor Dashboard with action buttons and stats', () => {
    render(
      <LanguageProvider>
        <DonorDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText(/Donor Portal/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Post Food Now/i)[0]).toBeInTheDocument();
  });

  it('renders Recipient Dashboard with search and available food', () => {
    render(
      <LanguageProvider>
        <RecipientDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByPlaceholderText(/Search food donations/i)).toBeInTheDocument();
  });

  it('renders Volunteer Dashboard with delivery tasks', () => {
    render(
      <LanguageProvider>
        <VolunteerDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getAllByText(/Available Jobs/i)[0]).toBeInTheDocument();
  });

  it('renders Admin Dashboard with platform metrics', () => {
    render(
      <LanguageProvider>
        <AdminDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText(/FoodConnect Admin/i)).toBeInTheDocument();
  });
});
