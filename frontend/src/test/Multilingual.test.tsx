import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageProvider, useTranslation } from '../i18n/i18nContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

const TestComponent = () => {
  const { language, setLanguage, t } = useTranslation();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="translated-title">{t('heroTitle', 'FoodConnect')}</span>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button key={lang.code} onClick={() => setLanguage(lang.code)}>
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
};

describe('Multilingual i18n Suite', () => {
  it('supports all 13 Indian languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(13);
  });

  it('switches language and persists in context', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang')).toBeInTheDocument();

    const hindiBtn = screen.getByText(/हिन्दी/i);
    fireEvent.click(hindiBtn);
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    const teluguBtn = screen.getByText(/తెలుగు/i);
    fireEvent.click(teluguBtn);
    expect(screen.getByTestId('current-lang').textContent).toBe('te');
  });
});
