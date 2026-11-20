import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICustomField, IRemarkEntry, IContactItem, IProfileEntry } from '@/lib/models/Person';
import { AccountType } from '@/lib/models/Account';

export interface AccountItem {
  _id: string;
  name: string;
  accountType: AccountType; // 'personal' | 'real' | 'nominal'
  personId?: string | null;
  personMobile?: string;
  openingBalance: number;
  openingBalanceRemark?: string;
  description?: string;
  totalDebit?: number;
  totalCredit?: number;
  netBalance?: number;
}

export interface PersonItem {
  _id: string;
  name: string;
  mobile: string;
  contacts?: IContactItem[];
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
  openingBalance: number;
  openingBalanceRemark?: string;
  profileEntries?: IProfileEntry[];
  remarksHistory?: IRemarkEntry[];
  totalGiven: number;
  totalTaken: number;
  netBalance: number;
  transactionCount: number;
  customFields?: ICustomField[];
  createdAt: string;
}

export interface TransactionItem {
  _id: string;
  debitAccountId: string;
  debitAccountName: string;
  debitAccountType: AccountType;
  creditAccountId: string;
  creditAccountName: string;
  creditAccountType: AccountType;
  amount: number;
  date: string;
  dueDate?: string;
  narration?: string;
  personId?: string | null;
  personName?: string;
  personMobile?: string;
  isSettled: boolean;
  settledAt?: string | null;
  createdAt: string;
}

interface LedgerState {
  persons: PersonItem[];
  accounts: AccountItem[];
  transactions: TransactionItem[];
  selectedPersonId: string | null;
  activeLedgerTab: 'personal' | 'real' | 'nominal' | 'journal' | 'accounts';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: LedgerState = {
  persons: [],
  accounts: [],
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
  async (personData: Partial<PersonItem>, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch('/api/ledger/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      dispatch(fetchAccounts());
      return data.person;
    } catch {
      return rejectWithValue('Failed to create person');
    }
  }
);

export const updatePerson = createAsyncThunk(
  'ledger/updatePerson',
  async ({ id, updates }: { id: string; updates: Partial<PersonItem> }, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/ledger/persons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      dispatch(fetchAccounts());
      return data.person;
    } catch {
      return rejectWithValue('Failed to update person');
    }
  }
);

export const deletePerson = createAsyncThunk(
  'ledger/deletePerson',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/ledger/persons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      dispatch(fetchAccounts());
      return id;
    } catch {
      return rejectWithValue('Failed to delete person');
    }
  }
);

export const fetchAccounts = createAsyncThunk(
  'ledger/fetchAccounts',
  async (type: string | undefined, { rejectWithValue }) => {
    try {
      const url = type ? `/api/ledger/accounts?type=${type}` : '/api/ledger/accounts';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.accounts;
    } catch {
      return rejectWithValue('Failed to load accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'ledger/createAccount',
  async (accData: Partial<AccountItem>, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch('/api/ledger/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      dispatch(fetchPersons(undefined));
      return data.account;
    } catch {
      return rejectWithValue('Failed to create account');
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
      dispatch(fetchPersons(undefined));
      dispatch(fetchAccounts());
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
      dispatch(fetchPersons(undefined));
      dispatch(fetchAccounts());
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
      action: PayloadAction<'personal' | 'real' | 'nominal' | 'journal' | 'accounts'>
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

    // Accounts
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.accounts = action.payload;
    });

    builder.addCase(createAccount.fulfilled, (state, action) => {
      state.accounts.push(action.payload);
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
