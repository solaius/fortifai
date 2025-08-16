import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

describe('Dashboard page', () => {
  it('renders the heading and description', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /secrets management dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/monitor and manage your secret providers, references, and access policies/i)).toBeInTheDocument();
  });
}); 