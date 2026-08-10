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
    expect(screen.getByText(/Arjun Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Post Food Now/i)).toBeInTheDocument();
  });

  it('renders Recipient Dashboard with search and available food', () => {
    render(
      <LanguageProvider>
        <RecipientDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText(/Annapoorna Trust/i)).toBeInTheDocument();
  });

  it('renders Volunteer Dashboard with delivery tasks', () => {
    render(
      <LanguageProvider>
        <VolunteerDashboard onNavigate={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText(/Available for Deliveries/i)).toBeInTheDocument();
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
