'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageCircle,
  IndianRupee,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Search,
  Building,
  CreditCard,
  Briefcase,
  Mic,
  MicOff,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bookmark,
  ShieldCheck,
  Tag,
  BookOpen,
  X,
  Circle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPersons,
  createPerson,
  updatePerson,
  deletePerson,
  fetchAccounts,
  createAccount,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  setSelectedPersonId,
  setActiveLedgerTab,
  setSearchQuery,
  PersonItem,
  AccountItem,
  TransactionItem,
} from '@/store/slices/ledgerSlice';
import { showToast } from '@/store/slices/uiSlice';
import { createTask, fetchThreeDaysTasks } from '@/store/slices/tasksSlice';
import { AccountType } from '@/lib/models/Account';
import { ICustomField } from '@/lib/models/Person';

export default function HisaabKitaabPanel() {
  const dispatch = useAppDispatch();
  const {
    persons,
    accounts,
    transactions,
    selectedPersonId,
    activeLedgerTab,
    searchQuery,
    isLoading,
  } = useAppSelector((state) => state.ledger);

  // Modals & sub-views
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddDoubleEntryOpen, setIsAddDoubleEntryOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddNonTxEntryOpen, setIsAddNonTxEntryOpen] = useState(false);
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
  const [isAddCustomFieldOpen, setIsAddCustomFieldOpen] = useState(false);

  // Dynamic Custom Field Form State (Date Task vs Normal Info)
  const [customFieldType, setCustomFieldType] = useState<'date_task' | 'info'>('date_task');
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldDetails, setCustomFieldDetails] = useState('');
  const [customFieldDate, setCustomFieldDate] = useState(new Date().toISOString().split('T')[0]);
  const [customFieldAmount, setCustomFieldAmount] = useState<number | ''>('');
  const [customFieldTax, setCustomFieldTax] = useState('');
  const [customFieldRemarks, setCustomFieldRemarks] = useState('');
  const [customFieldSyncTask, setCustomFieldSyncTask] = useState(true);

  // New Person Form State (Multiple contacts, Opening balance + remarks, etc.)
  const [personName, setPersonName] = useState('');
  const [personCategory, setPersonCategory] = useState<'customer' | 'supplier' | 'friend' | 'family' | 'staff' | 'other'>('customer');
  const [contactsList, setContactsList] = useState<{ label: string; number: string; isWhatsapp: boolean }[]>([
    { label: 'Primary Mobile', number: '', isWhatsapp: true },
  ]);
  const [personDob, setPersonDob] = useState('');
  const [personAnniversary, setPersonAnniversary] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [personBankAcc, setPersonBankAcc] = useState('');
  const [personIfsc, setPersonIfsc] = useState('');
  const [personBankName, setPersonBankName] = useState('');
  const [personUpi, setPersonUpi] = useState('');
  const [personOpeningBalance, setPersonOpeningBalance] = useState<number>(0);
  const [personOpeningBalanceRemark, setPersonOpeningBalanceRemark] = useState('');
  const [personNotes, setPersonNotes] = useState('');

  // Double-Entry Journal State
  const [debitAccId, setDebitAccId] = useState('');
  const [creditAccId, setCreditAccId] = useState('');
  const [journalAmount, setJournalAmount] = useState<number | ''>('');
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalDueDate, setJournalDueDate] = useState('');
  const [journalNarration, setJournalNarration] = useState('');

  // Non-Transactional Entry State
  const [entryCategory, setEntryCategory] = useState('KYC / Documents');
  const [entryKey, setEntryKey] = useState('');
  const [entryValue, setEntryValue] = useState('');
  const [entryRemarks, setEntryRemarks] = useState('');

  // Remark with Due Date State
  const [remarkNote, setRemarkNote] = useState('');
  const [remarkDueDate, setRemarkDueDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Load initial data
  useEffect(() => {
    dispatch(fetchPersons(undefined));
    dispatch(fetchAccounts());
    dispatch(fetchTransactions(undefined));
  }, [dispatch]);

  const selectedPerson = persons.find((p) => p._id === selectedPersonId);

  // Voice typing toggle
  const toggleVoiceTyping = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(showToast({ message: 'Voice typing not supported on this browser', type: 'error' }));
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        dispatch(showToast({ message: 'Listening... बोलिए...', type: 'info' }));
      };

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setter((prev) => (prev ? `${prev} ${text}` : text));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Multiple contacts helper in form
  const addContactField = () => {
    setContactsList([...contactsList, { label: 'Alternate Mobile', number: '', isWhatsapp: false }]);
  };

  const updateContactField = (idx: number, field: string, val: any) => {
    const updated = [...contactsList];
    (updated[idx] as any)[field] = val;
    setContactsList(updated);
  };

  const removeContactField = (idx: number) => {
    if (contactsList.length <= 1) return;
    setContactsList(contactsList.filter((_, i) => i !== idx));
  };

  // Create Person Handler
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    const validContacts = contactsList.filter((c) => c.number.trim().length > 0);
    const primaryMobile = validContacts[0]?.number || '';

    await dispatch(
      createPerson({
        name: personName.trim(),
        mobile: primaryMobile,
        contacts: validContacts,
        category: personCategory,
        dob: personDob,
        anniversary: personAnniversary,
        address: personAddress,
        bankAccountNo: personBankAcc.trim(),
        ifscCode: personIfsc.trim().toUpperCase(),
        bankName: personBankName.trim(),
        upiId: personUpi.trim(),
        notes: personNotes,
        openingBalance: Number(personOpeningBalance) || 0,
        openingBalanceRemark: personOpeningBalanceRemark,
        profileEntries: [],
        remarksHistory: [],
      })
    );

    setIsAddPersonOpen(false);
    setPersonName('');
    setContactsList([{ label: 'Primary Mobile', number: '', isWhatsapp: true }]);
    setPersonOpeningBalance(0);
    setPersonOpeningBalanceRemark('');
    setPersonNotes('');
    dispatch(showToast({ message: 'Person created with Personal Account! 👤', type: 'success' }));
  };

  // Submit Double-Entry Transaction
  const handleCreateDoubleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitAccId || !creditAccId || !journalAmount || Number(journalAmount) <= 0) {
      dispatch(showToast({ message: 'Please select Debit Account, Credit Account, and Amount', type: 'error' }));
      return;
    }
    if (debitAccId === creditAccId) {
      dispatch(showToast({ message: 'Debit and Credit accounts cannot be the same', type: 'error' }));
      return;
    }

    await dispatch(
      createTransaction({
        debitAccountId: debitAccId,
        creditAccountId: creditAccId,
        amount: Number(journalAmount),
        date: journalDate,
        dueDate: journalDueDate,
        narration: journalNarration,
      })
    );

    setIsAddDoubleEntryOpen(false);
    setJournalAmount('');
    setJournalDueDate('');
    setJournalNarration('');
    dispatch(showToast({ message: 'Double-entry transaction posted successfully! ⚖️', type: 'success' }));
  };

  // Add Non-Transactional Profile Entry to Person
  const handleAddNonTxEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !entryKey.trim() || !entryValue.trim()) return;

    const newProfileEntry = {
      category: entryCategory,
      key: entryKey.trim(),
      value: entryValue.trim(),
      remarks: entryRemarks.trim(),
    };

    const currentEntries = selectedPerson.profileEntries || [];
    const updated = [...currentEntries, newProfileEntry];

    await dispatch(
      updatePerson({
        id: selectedPerson._id,
        updates: { profileEntries: updated },
      })
    );

    setEntryKey('');
    setEntryValue('');
    setEntryRemarks('');
    setIsAddNonTxEntryOpen(false);
    dispatch(showToast({ message: 'Profile entry added! 📋', type: 'success' }));
  };

  // Add Date-wise Remark with Task Manager Due Date
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !remarkNote.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      recordedDate: todayStr,
      dueDate: remarkDueDate,
      note: remarkNote.trim(),
      syncAsTask: !!remarkDueDate,
      completed: false,
    };

    const currentRemarks = selectedPerson.remarksHistory || [];
    const updated = [newEntry, ...currentRemarks];

    await dispatch(
      updatePerson({
        id: selectedPerson._id,
        updates: { remarksHistory: updated },
      })
    );

    // If due date was given, also explicitly dispatch createTask so it reflects immediately
    if (remarkDueDate) {
      await dispatch(
        createTask({
          title: `Follow-up with ${selectedPerson.name}: ${remarkNote.trim()}`,
          description: `Party: ${selectedPerson.name} (${selectedPerson.mobile || 'No contact'}). Remark: ${remarkNote.trim()}`,
          priority: 'urgent-important',
          date: remarkDueDate,
          dueDate: remarkDueDate,
        })
      );
      dispatch(showToast({ message: 'Remark saved and added to Task Manager for due date! 📅', type: 'success' }));
    } else {
      dispatch(showToast({ message: 'Remark saved to profile timeline! 📝', type: 'success' }));
    }

    setRemarkNote('');
    setRemarkDueDate('');
    setIsAddRemarkOpen(false);
  };

  // Add Dynamic Custom Field (Date Task with Amount & Tax vs Normal Info)
  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !customFieldName.trim()) return;

    const newField: ICustomField = {
      _id: Date.now().toString(),
      fieldType: customFieldType,
      fieldName: customFieldName.trim(),
      details: customFieldDetails.trim(),
      date: customFieldType === 'date_task' ? customFieldDate : undefined,
      amount: customFieldAmount !== '' ? Number(customFieldAmount) : undefined,
      tax: customFieldTax.trim() || undefined,
      remarks: customFieldRemarks.trim(),
      syncAsTask: customFieldType === 'date_task' ? customFieldSyncTask : false,
      completed: false,
      createdAt: new Date(),
    };

    const currentFields = selectedPerson.customFields || [];
    const updated = [...currentFields, newField];

    await dispatch(
      updatePerson({
        id: selectedPerson._id,
        updates: { customFields: updated },
      })
    );

    // If date_task with syncAsTask, create task immediately
    if (customFieldType === 'date_task' && customFieldSyncTask && customFieldDate) {
      const amountStr = customFieldAmount !== '' ? ` (₹${Number(customFieldAmount).toLocaleString('en-IN')})` : '';
      const taxStr = customFieldTax.trim() ? ` [Tax: ${customFieldTax.trim()}]` : '';
      await dispatch(
        createTask({
          title: `${selectedPerson.name}: ${customFieldName.trim()}${amountStr}${taxStr}`,
          description: `Party: ${selectedPerson.name} | Field: ${customFieldName.trim()}${customFieldRemarks.trim() ? ' | ' + customFieldRemarks.trim() : ''}`,
          priority: 'urgent-important',
          date: customFieldDate,
          dueDate: customFieldDate,
          personId: selectedPerson._id,
          personName: selectedPerson.name,
          amount: customFieldAmount !== '' ? Number(customFieldAmount) : undefined,
          tax: customFieldTax.trim() || undefined,
          sourceType: 'person_field',
        })
      );
      dispatch(fetchThreeDaysTasks(customFieldDate));
      dispatch(showToast({ message: 'फील्ड सफलतापूर्वक प्रोफाइल में जोड़ी गई और टास्क मैनेजर में सिंक हो गई! 📅', type: 'success' }));
    } else {
      dispatch(showToast({ message: 'प्रोफ़ाइल फ़ील्ड सफलतापूर्वक जोड़ी गई! 📋', type: 'success' }));
    }

    setCustomFieldName('');
    setCustomFieldDetails('');
    setCustomFieldAmount('');
    setCustomFieldTax('');
    setCustomFieldRemarks('');
    setIsAddCustomFieldOpen(false);
  };

  const handleDeleteCustomField = async (fieldIndex: number) => {
    if (!selectedPerson) return;
    const currentFields = [...(selectedPerson.customFields || [])];
    currentFields.splice(fieldIndex, 1);

    await dispatch(
      updatePerson({
        id: selectedPerson._id,
        updates: { customFields: currentFields },
      })
    );
    dispatch(showToast({ message: 'Field removed from profile', type: 'info' }));
  };

  const handleToggleCustomFieldComplete = async (fieldIndex: number) => {
    if (!selectedPerson) return;
    const currentFields = JSON.parse(JSON.stringify(selectedPerson.customFields || []));
    if (currentFields[fieldIndex]) {
      currentFields[fieldIndex].completed = !currentFields[fieldIndex].completed;
      await dispatch(
        updatePerson({
          id: selectedPerson._id,
          updates: { customFields: currentFields },
        })
      );
    }
  };

  // Export Contact as .vcf
  const exportVCard = (person: PersonItem) => {
    const phoneLines = (person.contacts || [])
      .map((c) => `TEL;TYPE=${c.label.toUpperCase()}:${c.number}`)
      .join('\n');

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${person.name}
${phoneLines || `TEL;TYPE=CELL:${person.mobile}`}
${person.email ? `EMAIL:${person.email}` : ''}
NOTE:${person.notes || ''} | FocusTube Double-Entry Ledger
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${person.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispatch(showToast({ message: 'Contact .vcf downloaded to phone! 📱', type: 'info' }));
  };

  // Balances summary
  const totalReceivable = persons.reduce((acc, p) => (p.netBalance > 0 ? acc + p.netBalance : acc), 0);
  const totalPayable = persons.reduce((acc, p) => (p.netBalance < 0 ? acc + Math.abs(p.netBalance) : acc), 0);
  const netOverall = totalReceivable - totalPayable;

  const filteredPersons = persons.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesContacts = p.contacts?.some((c) => c.number.includes(q));
    const matchesEntries = p.profileEntries?.some((e) => e.value.toLowerCase().includes(q) || e.key.toLowerCase().includes(q));
    return (
      p.name.toLowerCase().includes(q) ||
      (p.mobile && p.mobile.includes(q)) ||
      matchesContacts ||
      matchesEntries
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Top Header & Overview */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>डबल एंट्री लेजर (Double-Entry Bookkeeping)</span>
              </h1>
              <p className="text-xs text-neutral-400">
                Personal (Parties) · Real (Cash &amp; Assets) · Nominal (Income &amp; Expense) · Debit &amp; Credit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAddPersonOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Person</span>
            </button>

            <button
              onClick={() => setIsAddDoubleEntryOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Double Entry (Dr / Cr)</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                कुल लेना है (Receivable)
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">
                ₹{totalReceivable.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                कुल देना है (Payable)
              </span>
              <span className="text-lg sm:text-xl font-bold text-rose-400">
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                नेट बैलेंस (Net)
              </span>
              <span className={`text-lg sm:text-xl font-bold ${netOverall >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{netOverall.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#262626] flex-wrap">
          <button
            onClick={() => {
              dispatch(setActiveLedgerTab('personal'));
              dispatch(setSelectedPersonId(null));
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'personal' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            👥 Personal Profiles ({persons.length})
          </button>
          <button
            onClick={() => dispatch(setActiveLedgerTab('accounts'))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'accounts' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🏛️ All Accounts ({accounts.length})
          </button>
          <button
            onClick={() => dispatch(setActiveLedgerTab('journal'))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'journal' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ⚖️ Double-Entry Journal ({transactions.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedPerson ? (
        /* ==================== SELECTED PERSON COMPREHENSIVE PROFILE ==================== */
        <div className="space-y-4">
          <button
            onClick={() => dispatch(setSelectedPersonId(null))}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white bg-[#1a1a1a] border border-[#2e2e2e] px-3 py-1.5 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All People</span>
          </button>

          {/* Profile Header Card */}
          <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {selectedPerson.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedPerson.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span className="capitalize font-semibold text-neutral-300 px-2 py-0.5 rounded bg-[#222]">
                      {selectedPerson.category}
                    </span>
                    {selectedPerson.dob && (
                      <span className="text-amber-400 font-medium">🎂 DOB: {selectedPerson.dob}</span>
                    )}
                    {selectedPerson.anniversary && (
                      <span className="text-rose-400 font-medium">💍 Anniv: {selectedPerson.anniversary}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => exportVCard(selectedPerson)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#252525] hover:bg-[#303030] text-neutral-200 rounded-xl text-xs font-medium transition"
                  title="Export contacts as vCard for mobile"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save to Phone (.vcf)</span>
                </button>
              </div>
            </div>

            {/* Multiple Contacts List with Direct Call & WhatsApp */}
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                📞 Contact Numbers ({selectedPerson.contacts?.length || 1})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(selectedPerson.contacts && selectedPerson.contacts.length > 0
                  ? selectedPerson.contacts
                  : [{ label: 'Primary', number: selectedPerson.mobile, isWhatsapp: true }]
                ).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-[#1f1f1f] border border-[#333] rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{c.label}</span>
                      <span className="font-bold text-white">{c.number}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${c.number}`}
                        className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/91${c.number.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `नमस्ते ${selectedPerson.name} जी, आपके हिसाब का शेष बैलेंस ₹${Math.abs(selectedPerson.netBalance)} ${
                            selectedPerson.netBalance > 0 ? 'लेना है' : 'देना है'
                          }।`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                        title="WhatsApp with Balance Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance & Opening Balance with Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#262626]">
              <div className="bg-[#1f1f1f] border border-[#333] p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Net Balance (लेना / देना)
                </span>
                <span
                  className={`text-lg font-bold ${
                    selectedPerson.netBalance > 0
                      ? 'text-emerald-400'
                      : selectedPerson.netBalance < 0
                      ? 'text-rose-400'
                      : 'text-neutral-300'
                  }`}
                >
                  {selectedPerson.netBalance > 0
                    ? `₹${selectedPerson.netBalance.toLocaleString('en-IN')} (लेना है)`
                    : selectedPerson.netBalance < 0
                    ? `₹${Math.abs(selectedPerson.netBalance).toLocaleString('en-IN')} (देना है)`
                    : '₹0 (हिसाब चुकता)'}
                </span>
              </div>

              <div className="bg-[#1f1f1f] border border-[#333] p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Opening Balance &amp; Remarks
                </span>
                <span className="text-sm font-bold text-white block">
                  ₹{Number(selectedPerson.openingBalance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5 block italic">
                  {selectedPerson.openingBalanceRemark || 'No opening balance remarks logged'}
                </span>
              </div>
            </div>

            {/* DYNAMIC CUSTOM FIELDS: DATE TASKS & NORMAL PROFILE INFO */}
            <div className="pt-3 border-t border-[#262626] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                    डायनामिक प्रोफ़ाइल फ़ील्ड्स व पर्सन टास्क्स (Dynamic Fields)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    तारीख, राशि व टैक्स के साथ टास्क्स जोड़ें अथवा स्थायी प्रोफ़ाइल विवरण रखें
                  </span>
                </div>
                <button
                  onClick={() => setIsAddCustomFieldOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl font-bold shadow-lg transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ नई फ़ील्ड जोड़ें (Add Field)</span>
                </button>
              </div>

              {/* Sub-section 1: Date & Task Fields (Date, Amount, Tax, Remarks, Auto-Task) */}
              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#282828] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>📅 महत्वपूर्ण तारीखें, ड्यू डेट्स व टास्क्स (Date, Amount &amp; Tax Tasks)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] px-2 py-0.5 rounded-full font-semibold">
                    {selectedPerson.customFields?.filter(f => f.fieldType === 'date_task' || f.date).length || 0} Tasks
                  </span>
                </div>

                {selectedPerson.customFields && selectedPerson.customFields.filter(f => f.fieldType === 'date_task' || f.date).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPerson.customFields.map((field, idx) => {
                      if (field.fieldType !== 'date_task' && !field.date) return null;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition ${
                            field.completed
                              ? 'bg-[#121212] border-[#222222] opacity-60'
                              : 'bg-[#191919] border-[#2e2e2e]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleCustomFieldComplete(idx)}
                                className="mt-0.5 text-neutral-400 hover:text-white transition flex-shrink-0"
                              >
                                {field.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-neutral-500" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-xs font-bold ${field.completed ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
                                  {field.fieldName || field.label}
                                </h4>
                                {field.remarks && (
                                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                    {field.remarks}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteCustomField(idx)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition"
                              title="Delete Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-[#252525] text-[10px]">
                            {field.date && (
                              <span className="flex items-center gap-1 font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                <Clock className="w-2.5 h-2.5" />
                                <span>तारीख: {field.date}</span>
                              </span>
                            )}
                            {field.amount ? (
                              <span className="font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                ₹{Number(field.amount).toLocaleString('en-IN')}
                              </span>
                            ) : null}
                            {field.tax && (
                              <span className="font-medium text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/30">
                                Tax: {field.tax}
                              </span>
                            )}
                            <span className="ml-auto text-[9px] text-blue-400 font-bold bg-blue-950/40 px-1.5 py-0.5 rounded">
                              ✓ Task Manager Synced
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-1">
                    कोई ड्यू डेट या टास्क फ़ील्ड नहीं है। &quot;+ नई फ़ील्ड जोड़ें&quot; बटन से तारीख, राशि व टैक्स जोड़ें।
                  </p>
                )}
              </div>

              {/* Sub-section 2: Permanent Info Fields (Details, Remarks, KYC, etc.) */}
              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#282828] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>📋 स्थाई प्रोफ़ाइल विवरण एवं दस्तावेज (Profile Attributes &amp; KYC)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#202020] px-2 py-0.5 rounded-full font-semibold">
                    {(selectedPerson.profileEntries?.length || 0) + (selectedPerson.customFields?.filter(f => f.fieldType === 'info' || (!f.fieldType && !f.date)).length || 0)} Items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {/* Render Profile Entries */}
                  {selectedPerson.profileEntries?.map((entry, idx) => (
                    <div key={`pe-${idx}`} className="p-3 bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 bg-[#252525] px-1.5 py-0.5 rounded">
                          {entry.category}
                        </span>
                      </div>
                      <span className="font-semibold text-neutral-400 block">{entry.key}:</span>
                      <span className="font-bold text-white block text-sm">{entry.value}</span>
                      {entry.remarks && <span className="text-[11px] text-neutral-400 block italic">{entry.remarks}</span>}
                    </div>
                  ))}

                  {/* Render Dynamic Custom Info Fields */}
                  {selectedPerson.customFields?.map((field, idx) => {
                    if (field.fieldType === 'date_task' || field.date) return null;
                    return (
                      <div key={`cf-${idx}`} className="p-3 bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl text-xs space-y-1 relative group">
                        <button
                          onClick={() => handleDeleteCustomField(idx)}
                          className="absolute right-2 top-2 text-neutral-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Delete Field"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="font-semibold text-neutral-400 block">{field.fieldName || field.label}:</span>
                        <span className="font-bold text-white block text-sm">{field.details || field.value}</span>
                        {field.remarks && <span className="text-[11px] text-neutral-400 block italic">{field.remarks}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DATE-WISE INTERACTION REMARKS & TASK MANAGER DUE DATES */}
            <div className="pt-2 border-t border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Date-wise Remarks &amp; Due Date Follow-ups (Task Manager Linked)
                </span>
                <button
                  onClick={() => setIsAddRemarkOpen(!isAddRemarkOpen)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Remark</span>
                </button>
              </div>

              {isAddRemarkOpen && (
                <form onSubmit={handleAddRemark} className="bg-[#1b1b1b] p-3 rounded-xl border border-[#303030] space-y-2 animate-fade-in">
                  <div className="relative">
                    <textarea
                      value={remarkNote}
                      onChange={(e) => setRemarkNote(e.target.value)}
                      placeholder="बातचीत या रिमार्क दर्ज करें (e.g. आज कॉल पर बात हुई, 25 तारीख को ₹50,000 देने का वादा किया)..."
                      rows={2}
                      className="w-full pl-3 pr-10 py-2 bg-[#121212] border border-[#383838] rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVoiceTyping(setRemarkNote)}
                      className={`absolute right-2.5 top-2.5 p-1 rounded-lg transition ${
                        isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-neutral-400 hover:text-white'
                      }`}
                      title="Voice Typing (बोलकर लिखें)"
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-[11px] text-neutral-400 font-medium">Follow-up Due Date:</label>
                    <input
                      type="date"
                      value={remarkDueDate}
                      onChange={(e) => setRemarkDueDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#121212] border border-[#383838] rounded-lg text-xs text-neutral-200 outline-none"
                    />
                    <span className="text-[10px] text-amber-400 font-semibold">
                      (यह तारीख टास्क मैनेजर के 3-Day व्यू में स्वतः दिखेगी)
                    </span>
                    <button
                      type="submit"
                      disabled={!remarkNote.trim()}
                      className="ml-auto px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Save Remark
                    </button>
                  </div>
                </form>
              )}

              {/* Remarks Timeline */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedPerson.remarksHistory && selectedPerson.remarksHistory.length > 0 ? (
                  selectedPerson.remarksHistory.map((rh, idx) => (
                    <div key={idx} className="p-3 bg-[#191919] border border-[#2c2c2c] rounded-xl text-xs space-y-1">
                      <span className="font-semibold text-neutral-100 block">{rh.note}</span>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                        <span>Recorded: {rh.recordedDate}</span>
                        {rh.dueDate && (
                          <span className="text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                            🔔 Due on: {rh.dueDate} (In Task Manager)
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic py-2">
                    No remarks recorded. Use the &quot;Add Remark&quot; button to log conversations.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeLedgerTab === 'personal' ? (
        /* ==================== ALL PERSONAL PROFILES LIST ==================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search party by name, contacts, documents, notes..."
                className="w-full pl-9 pr-4 py-2 bg-[#161616] border border-[#2e2e2e] rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none focus:border-red-500"
              />
            </div>
            <span className="text-xs text-neutral-400">Showing {filteredPersons.length} parties</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredPersons.map((p) => (
              <div
                key={p._id}
                onClick={() => dispatch(setSelectedPersonId(p._id))}
                className="bg-[#161616] border border-[#282828] hover:border-[#383838] p-4 rounded-2xl shadow-md cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-base">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-100 leading-tight">{p.name}</h3>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          {p.contacts && p.contacts.length > 0 ? p.contacts[0].number : p.mobile || 'No contact'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium capitalize">
                      {p.category}
                    </span>
                  </div>

                  {p.openingBalanceRemark && (
                    <p className="text-[11px] text-neutral-400 italic line-clamp-1 mt-2">
                      Opening: {p.openingBalanceRemark}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#242424] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-400">Net Balance:</span>
                  <span
                    className={`font-bold ${
                      p.netBalance > 0 ? 'text-emerald-400' : p.netBalance < 0 ? 'text-rose-400' : 'text-neutral-400'
                    }`}
                  >
                    {p.netBalance > 0
                      ? `+₹${p.netBalance.toLocaleString('en-IN')} (लेना)`
                      : p.netBalance < 0
                      ? `-₹${Math.abs(p.netBalance).toLocaleString('en-IN')} (देना)`
                      : '₹0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeLedgerTab === 'accounts' ? (
        /* ==================== ALL ACCOUNTS (REAL, PERSONAL, NOMINAL) ==================== */
        <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Chart of Accounts (Real · Personal · Nominal)
            </h3>
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {accounts.map((acc) => (
              <div key={acc._id} className="p-3.5 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{acc.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      acc.accountType === 'personal'
                        ? 'bg-blue-900/60 text-blue-300'
                        : acc.accountType === 'real'
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-emerald-900/60 text-emerald-300'
                    }`}
                  >
                    {acc.accountType}
                  </span>
                </div>
                {acc.description && <p className="text-[11px] text-neutral-400">{acc.description}</p>}
                <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Balance:</span>
                  <span className="font-bold text-neutral-200">
                    ₹{Number(acc.netBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== DOUBLE ENTRY JOURNAL (DEBIT & CREDIT) ==================== */
        <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Double-Entry Journal Register (डेबिट एवं क्रेडिट)
            </h3>
            <button
              onClick={() => setIsAddDoubleEntryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Double Entry</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">
                No double-entry transactions recorded yet. Click &quot;Record Double Entry&quot; above.
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="p-3.5 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">
                        ₹{Number(tx.amount).toLocaleString('en-IN')}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="font-mono text-[11px] text-neutral-400">📅 {tx.date}</span>
                    </div>

                    <div className="flex items-center gap-3 font-medium">
                      <span className="text-blue-400">
                        Dr: <strong>{tx.debitAccountName}</strong> ({tx.debitAccountType})
                      </span>
                      <span className="text-neutral-500">|</span>
                      <span className="text-amber-400">
                        Cr: <strong>{tx.creditAccountName}</strong> ({tx.creditAccountType})
                      </span>
                    </div>

                    {tx.narration && (
                      <p className="text-[11px] text-neutral-400 italic">
                        Narration: {tx.narration}
                      </p>
                    )}

                    {tx.dueDate && (
                      <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 inline-block mt-0.5">
                        🔔 Due on: {tx.dueDate} (Shows in Task Manager)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => dispatch(deleteTransaction(tx._id))}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== CREATE PERSON MODAL (WITH MULTIPLE CONTACTS) ==================== */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-500" />
              <span>Create Person Profile (पर्सनल खाता)</span>
            </h3>

            <form onSubmit={handleCreatePerson} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Person Name <span className="text-red-500">* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar, Sharma Traders"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              {/* Multiple Contacts Section */}
              <div className="space-y-2 pt-1 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300">
                    Multiple Contacts (फोन नंबर)
                  </label>
                  <button
                    type="button"
                    onClick={addContactField}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    + Add Another Number
                  </button>
                </div>

                {contactsList.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => updateContactField(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Mobile, Office)"
                      className="w-32 px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="tel"
                      value={c.number}
                      onChange={(e) => updateContactField(idx, 'number', e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="flex-1 px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                    />
                    {contactsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactField(idx)}
                        className="p-1.5 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Opening Balance with Remarks */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[#262626]">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Opening Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={personOpeningBalance}
                    onChange={(e) => setPersonOpeningBalance(Number(e.target.value))}
                    placeholder="+ for Lena, - for Dena"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Opening Balance Remarks
                  </label>
                  <input
                    type="text"
                    value={personOpeningBalanceRemark}
                    onChange={(e) => setPersonOpeningBalanceRemark(e.target.value)}
                    placeholder="e.g. Purana hisaab for cement supply"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* DOB, Anniversary, Category */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={personCategory}
                    onChange={(e) => setPersonCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                    <option value="staff">Staff</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Birth Date (DOB)</label>
                  <input
                    type="date"
                    value={personDob}
                    onChange={(e) => setPersonDob(e.target.value)}
                    className="w-full px-2 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Anniversary</label>
                  <input
                    type="date"
                    value={personAnniversary}
                    onChange={(e) => setPersonAnniversary(e.target.value)}
                    className="w-full px-2 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#262626]">
                <input
                  type="text"
                  value={personBankAcc}
                  onChange={(e) => setPersonBankAcc(e.target.value)}
                  placeholder="Bank A/C Number"
                  className="px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={personIfsc}
                  onChange={(e) => setPersonIfsc(e.target.value)}
                  placeholder="IFSC Code"
                  className="px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPersonOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Save Person Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DOUBLE ENTRY TRANSACTION MODAL ==================== */}
      {isAddDoubleEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
              <span>Record Double-Entry Journal (Dr &amp; Cr)</span>
            </h3>

            <form onSubmit={handleCreateDoubleEntry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">
                  Debit Account (Dr - पाने वाला / खर्च / संपत्ति आती है) *
                </label>
                <select
                  required
                  value={debitAccId}
                  onChange={(e) => setDebitAccId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select Debit Account...</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} ({acc.accountType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Credit Account (Cr - देने वाला / आय / संपत्ति जाती है) *
                </label>
                <select
                  required
                  value={creditAccId}
                  onChange={(e) => setCreditAccId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-amber-500"
                >
                  <option value="">Select Credit Account...</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} ({acc.accountType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={journalAmount}
                    onChange={(e) => setJournalAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="₹ Amount"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  Due Date (देना कब है / लेना कब है - Auto Task Manager)
                </label>
                <input
                  type="date"
                  value={journalDueDate}
                  onChange={(e) => setJournalDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Narration / Remarks</label>
                <input
                  type="text"
                  value={journalNarration}
                  onChange={(e) => setJournalNarration(e.target.value)}
                  placeholder="e.g. Paid cash for office stationery, Consulting fee receipt"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDoubleEntryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE NON-TRANSACTIONAL PROFILE ENTRY MODAL ==================== */}
      {isAddNonTxEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>Add Non-Transactional Profile Entry</span>
            </h3>

            <form onSubmit={handleAddNonTxEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                <select
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                >
                  <option value="KYC / Documents">KYC / Documents (GSTIN, PAN, Aadhaar)</option>
                  <option value="Business Terms">Business Terms &amp; Credit Limits</option>
                  <option value="Personal / Family">Personal / Family Details</option>
                  <option value="Agreements / Notes">Agreements / Meeting Notes</option>
                  <option value="Preferences">Preferences / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Field Name / Key *</label>
                <input
                  type="text"
                  required
                  value={entryKey}
                  onChange={(e) => setEntryKey(e.target.value)}
                  placeholder="e.g. GSTIN, PAN, Credit Limit, Relationship"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Field Value *</label>
                <input
                  type="text"
                  required
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  placeholder="e.g. 07AAAAA0000A1Z5, ₹5,00,000 / 30 Days"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={entryRemarks}
                  onChange={(e) => setEntryRemarks(e.target.value)}
                  placeholder="Any additional remarks..."
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNonTxEntryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Save to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE ACCOUNT MODAL ==================== */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Create Chart of Account (Real / Nominal / Personal)</span>
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;
                const name = form.accName.value;
                const accountType = form.accType.value;
                const description = form.accDesc.value;

                await dispatch(createAccount({ name, accountType, description, openingBalance: 0 }));
                setIsAddAccountOpen(false);
                dispatch(showToast({ message: 'Account added to Chart of Accounts! 🏛️', type: 'success' }));
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Account Name *</label>
                <input
                  name="accName"
                  required
                  placeholder="e.g. ICICI Bank, Printing Expenses, Software License"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Account Classification *</label>
                <select
                  name="accType"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                >
                  <option value="real">Real Account (Assets, Bank, Property, Cash)</option>
                  <option value="nominal">Nominal Account (Expenses &amp; Incomes)</option>
                  <option value="personal">Personal Account (Party / Contact)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description / Notes</label>
                <input
                  name="accDesc"
                  placeholder="General notes about account"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CREATE DYNAMIC CUSTOM FIELD MODAL ==================== */}
      {isAddCustomFieldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-500" />
                <span>प्रोफ़ाइल में नई फ़ील्ड जोड़ें (Add Profile Field)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomFieldOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Field Type Selection: Date/Task vs Normal Info */}
            <div className="flex items-center p-1 bg-[#121212] rounded-xl border border-[#2b2b2b]">
              <button
                type="button"
                onClick={() => setCustomFieldType('date_task')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  customFieldType === 'date_task'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>1. तारीख व टास्क फ़ील्ड</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomFieldType('info')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  customFieldType === 'info'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. सामान्य विवरण / KYC</span>
              </button>
            </div>

            <form onSubmit={handleAddCustomField} className="space-y-3">
              {/* Field Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {customFieldType === 'date_task'
                    ? 'किस चीज़ की तारीख है? (Field Name / Purpose) *'
                    : 'फ़ील्ड का नाम (Field Name / Label) *'}
                </label>
                <input
                  type="text"
                  required
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  placeholder={
                    customFieldType === 'date_task'
                      ? 'उदा. पेमेंट फॉलो-अप, चेक क्लीयरेंस, एग्रीमेंट रिन्यूअल'
                      : 'उदा. GSTIN, PAN कार्ड, बैंक खाता, व्यापार शर्तें, पता'
                  }
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* DATE TASK SPECIFIC FIELDS */}
              {customFieldType === 'date_task' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        तारीख (Due Date) *
                      </label>
                      <input
                        type="date"
                        required
                        value={customFieldDate}
                        onChange={(e) => setCustomFieldDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        अमाउंट (₹ Optional)
                      </label>
                      <input
                        type="number"
                        value={customFieldAmount}
                        onChange={(e) =>
                          setCustomFieldAmount(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="उदा. 50000"
                        className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      टैक्स / GST विवरण (Optional)
                    </label>
                    <input
                      type="text"
                      value={customFieldTax}
                      onChange={(e) => setCustomFieldTax(e.target.value)}
                      placeholder="उदा. 18% GST / ₹9,000 Tax"
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      रिमार्क्स (Remarks / Notes)
                    </label>
                    <textarea
                      value={customFieldRemarks}
                      onChange={(e) => setCustomFieldRemarks(e.target.value)}
                      rows={2}
                      placeholder="कोई विशेष निर्देश या बातचीत का विवरण..."
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 bg-amber-950/20 p-2.5 rounded-xl border border-amber-800/30">
                    <input
                      type="checkbox"
                      id="syncTaskCheckbox"
                      checked={customFieldSyncTask}
                      onChange={(e) => setCustomFieldSyncTask(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                    <label
                      htmlFor="syncTaskCheckbox"
                      className="text-xs text-amber-300 font-semibold cursor-pointer"
                    >
                      टास्क मैनेजर में उस तारीख को ऑटो-ऐड करें (3-Day Daily Tasks)
                    </label>
                  </div>
                </>
              ) : (
                /* NORMAL INFO FIELD */
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      डिटेल्स / विवरण (Field Details / Value) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customFieldDetails}
                      onChange={(e) => setCustomFieldDetails(e.target.value)}
                      placeholder="उदा. 07AAAAA0000A1Z5, HDFC 5010023423..."
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      रिमार्क्स (Remarks - Optional)
                    </label>
                    <input
                      type="text"
                      value={customFieldRemarks}
                      onChange={(e) => setCustomFieldRemarks(e.target.value)}
                      placeholder="अतिरिक्त जानकारी या टिप्पणी..."
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2d2d2d]">
                <button
                  type="button"
                  onClick={() => setIsAddCustomFieldOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  {customFieldType === 'date_task' ? 'Save & Sync Task' : 'Save to Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
