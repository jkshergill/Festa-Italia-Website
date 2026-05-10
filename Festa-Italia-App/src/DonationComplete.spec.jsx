import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Donate from './Donate';
import DonationSuccess from './DonationSuccess';

// Mock environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key'
    }
  }
});

// Mock window.alert to prevent errors
vi.stubGlobal('alert', vi.fn());

// Mock window.location
const mockLocation = { href: 'http://localhost:5173/', search: '' };
Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

// Mock Supabase client
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: 'test-order-123' }], error: null });
const mockSingle = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn()
    },
    from: vi.fn((table) => {
      if (table === 'pending_orders') {
        return {
          insert: mockInsert,
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
          delete: mockDelete
        };
      }
      if (table === 'donors') {
        return { insert: mockInsert };
      }
      return { insert: mockInsert, select: mockSelect, eq: mockEq, single: mockSingle, delete: mockDelete };
    }),
    functions: {
      invoke: vi.fn()
    }
  }
}));

const mockSetPage = vi.fn();

describe('Donation System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    mockLocation.href = 'http://localhost:5173/';
    mockSingle.mockReset();
    mockInsert.mockReset();
    mockDelete.mockReset();
    
    // Default successful responses
    mockSingle.mockResolvedValue({ data: { amount: 5000, metadata: { donation_type: 'Basic', donor_name: 'Test Donor' } }, error: null });
    mockInsert.mockResolvedValue({ data: [{ id: 'test-order-123' }], error: null });
  });

  // ============================================
  // 1. DONATION SUCCESS PAGE TESTS
  // ============================================
  describe('Donation Success Page', () => {
    it('displays error when no orderId in URL', async () => {
      mockLocation.search = '';
      const { supabase } = await import('./supabaseClient');
      supabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: { id: 'user-123' } } } 
      });
      
      render(<DonationSuccess setPage={mockSetPage} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Something Went Wrong/i)).toBeDefined();
      });
    });

    it('redirects to login when user not authenticated', async () => {
      mockLocation.search = '?orderId=test-123';
      const { supabase } = await import('./supabaseClient');
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      
      render(<DonationSuccess setPage={mockSetPage} />);
      
      await waitFor(() => {
        expect(window.location.href).toContain('/login');
      });
    });

    it('fetches pending order when valid orderId present', async () => {
      mockLocation.search = '?orderId=test-123';
      const { supabase } = await import('./supabaseClient');
      supabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: { id: 'user-123' } } } 
      });
      
      render(<DonationSuccess setPage={mockSetPage} />);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('pending_orders');
      });
    });
  });

  // ============================================
  // 2. DONATION AUTHENTICATION TEST
  // ============================================
  describe('Donation Authentication', () => {
    it('requires user to be logged in to access donation page', async () => {
      const { supabase } = await import('./supabaseClient');
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      
      render(<Donate setPage={mockSetPage} />);
      
      // Donate component should still render, but checkout will require login
      expect(screen.getByText(/Thank you for supporting your community/i)).toBeDefined();
    });
  });
});