import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICustomField, IRemarkEntry } from '@/lib/models/Person';
import { AccountCategory, TransactionType } from '@/lib/models/Transaction';

export interface PersonItem {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  category: 'customer' | 'supplier' | 'friend' | 'family' | 'staff' | 'other';
  dob?: string;
  anniversary?: string;
  address?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
  notes?: string;
  remarksHistory?: IRemarkEntry[];
  openingBalance: number;
  totalGiven: number;
  totalTaken: number;
  netBalance: number;
  transactionCount: number;
  customFields?: ICustomField[];
  createdAt: string;
}

export interface TransactionItem {
  _id: string;
  accountCategory: AccountCategory;
  type: TransactionType;
  amount: number;
  date: string;
  dueDate?: string;
  personId?: string | null;
  personName?: string;
  personMobile?: string;
  category?: string;
  description?: string;
  isSettled: boolean;
  settledAt?: string | null;
  createdAt: string;
}

interface LedgerState {
  persons: PersonItem[];
  transactions: TransactionItem[];
  selectedPersonId: string | null;
  activeLedgerTab: 'personal' | 'real' | 'nominal' | 'all';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: LedgerState = {
  persons: [],
  transactions: [],
  selectedPersonId: null,
  activeLedgerTab: 'personal',
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchPersons = createAsyncThunk(
  'ledger/fetchPersons',
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const url = search ? `/api/ledger/persons?q=${encodeURIComponent(search)}` : '/api/ledger/persons';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.persons;
    } catch {
      return rejectWithValue('Failed to load persons');
    }
  }
);

export const createPerson = createAsyncThunk(
  'ledger/createPerson',
  async (personData: Partial<PersonItem>, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/ledger/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.person;
    } catch {
      return rejectWithValue('Failed to create person');
    }
  }
);

export const updatePerson = createAsyncThunk(
  'ledger/updatePerson',
  async ({ id, updates }: { id: string; updates: Partial<PersonItem> }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/ledger/persons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.person;
    } catch {
      return rejectWithValue('Failed to update person');
    }
  }
);

export const deletePerson = createAsyncThunk(
  'ledger/deletePerson',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/ledger/persons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return id;
    } catch {
      return rejectWithValue('Failed to delete person');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'ledger/fetchTransactions',
  async (personId: string | undefined, { rejectWithValue }) => {
    try {
      const url = personId
        ? `/api/ledger/transactions?personId=${personId}`
        : '/api/ledger/transactions';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.transactions;
    } catch {
      return rejectWithValue('Failed to load transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'ledger/createTransaction',
  async (txData: Partial<TransactionItem>, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch('/api/ledger/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      // Refresh persons to update balances
      dispatch(fetchPersons());
      return data.transaction;
    } catch {
      return rejectWithValue('Failed to create transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'ledger/deleteTransaction',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/ledger/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      dispatch(fetchPersons());
      return id;
    } catch {
      return rejectWithValue('Failed to delete transaction');
    }
  }
);

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setSelectedPersonId: (state, action: PayloadAction<string | null>) => {
      state.selectedPersonId = action.payload;
    },
    setActiveLedgerTab: (
      state,
      action: PayloadAction<'personal' | 'real' | 'nominal' | 'all'>
    ) => {
      state.activeLedgerTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Persons
    builder
      .addCase(fetchPersons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.persons = action.payload;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createPerson.fulfilled, (state, action) => {
      state.persons.unshift({
        ...action.payload,
        totalGiven: 0,
        totalTaken: 0,
        netBalance: action.payload.openingBalance || 0,
        transactionCount: 0,
      });
    });

    builder.addCase(updatePerson.fulfilled, (state, action) => {
      const idx = state.persons.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.persons[idx] = {
          ...state.persons[idx],
          ...action.payload,
        };
      }
    });

    builder.addCase(deletePerson.fulfilled, (state, action) => {
      state.persons = state.persons.filter((p) => p._id !== action.payload);
      if (state.selectedPersonId === action.payload) {
        state.selectedPersonId = null;
      }
    });

    // Transactions
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.transactions = action.payload;
    });

    builder.addCase(createTransaction.fulfilled, (state, action) => {
      state.transactions.unshift(action.payload);
    });

    builder.addCase(deleteTransaction.fulfilled, (state, action) => {
      state.transactions = state.transactions.filter((t) => t._id !== action.payload);
    });
  },
});

export const { setSelectedPersonId, setActiveLedgerTab, setSearchQuery } = ledgerSlice.actions;

export default ledgerSlice.reducer;
