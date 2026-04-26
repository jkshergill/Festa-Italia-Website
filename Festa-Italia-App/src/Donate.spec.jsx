import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Donate from './Donate';

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));

const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  },
  access_token: 'fake-token'
};

describe('Donate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the donation form', () => {
    render(<Donate />);
    
    expect(screen.getByText(/Thank you for supporting your community/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter name/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter amount/i)).toBeDefined();
  });

  it('shows alert when user is not logged in', async () => {
    const { supabase } = await import('./supabaseClient');
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<Donate />);
    
    const donateButton = screen.getByText(/Donate with Clover/i);
    fireEvent.click(donateButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Please sign in to make a donation.');
    });
    
    alertMock.mockRestore();
  });

  it('validates amount field', async () => {
    const { supabase } = await import('./supabaseClient');
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<Donate />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter name/i), {
      target: { value: 'Test Donor' }
    });
    
    const donateButton = screen.getByText(/Donate with Clover/i);
    fireEvent.click(donateButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid donation amount.');
    });
    
    alertMock.mockRestore();
  });

  it('calls edge function when form is valid', async () => {
    const { supabase } = await import('./supabaseClient');
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    supabase.functions.invoke.mockResolvedValue({
      data: { checkoutUrl: 'https://checkout.clover.com/test' },
      error: null
    });
    
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    render(<Donate />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter name/i), {
      target: { value: 'Test Donor' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter amount/i), {
      target: { value: '50' }
    });
    
    const donateButton = screen.getByText(/Donate with Clover/i);
    fireEvent.click(donateButton);
    
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'create-donation-checkout',
        expect.objectContaining({
          body: expect.objectContaining({
            amount: 5000,
            donorName: 'Test Donor'
          })
        })
      );
    });
    
    window.location = originalLocation;
  });
});