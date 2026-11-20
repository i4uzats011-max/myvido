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
  Tag,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPersons,
  createPerson,
  updatePerson,
  deletePerson,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  setSelectedPersonId,
  setActiveLedgerTab,
  setSearchQuery,
  PersonItem,
  TransactionItem,
} from '@/store/slices/ledgerSlice';
import { showToast } from '@/store/slices/uiSlice';
import { createTask } from '@/store/slices/tasksSlice';

export default function HisaabKitaabPanel() {
  const dispatch = useAppDispatch();
  const {
    persons,
    transactions,
    selectedPersonId,
    activeLedgerTab,
    searchQuery,
    isLoading,
  } = useAppSelector((state) => state.ledger);

  // Modals & form state
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);

  // New Person State
  const [personName, setPersonName] = useState('');
  const [personMobile, setPersonMobile] = useState('');
  const [personCategory, setPersonCategory] = useState<'customer' | 'supplier' | 'friend' | 'family' | 'staff' | 'other'>('customer');
  const [personDob, setPersonDob] = useState('');
  const [personBankAcc, setPersonBankAcc] = useState('');
  const [personIfsc, setPersonIfsc] = useState('');
  const [personBankName, setPersonBankName] = useState('');
  const [personUpi, setPersonUpi] = useState('');
  const [personOpeningBalance, setPersonOpeningBalance] = useState<number>(0);
  const [personNotes, setPersonNotes] = useState('');

  // New Transaction State
  const [txCategory, setTxCategory] = useState<'personal' | 'real' | 'nominal'>('personal');
  const [txType, setTxType] = useState<'given' | 'taken' | 'income' | 'expense' | 'asset_add' | 'asset_reduce'>('given');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDueDate, setTxDueDate] = useState('');
  const [txDescription, setTxDescription] = useState('');

  // New Remark State with Voice Typing
  const [remarkNote, setRemarkNote] = useState('');
  const [remarkDueDate, setRemarkDueDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    dispatch(fetchPersons());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const selectedPerson = persons.find((p) => p._id === selectedPersonId);

  // Voice typing toggle
  const toggleVoiceTyping = (targetSetter: React.Dispatch<React.SetStateAction<string>>) => {
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
        targetSetter((prev) => (prev ? `${prev} ${text}` : text));
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

  // Create Person Handler
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    await dispatch(
      createPerson({
        name: personName.trim(),
        mobile: personMobile.trim(),
        category: personCategory,
        dob: personDob,
        bankAccountNo: personBankAcc.trim(),
        ifscCode: personIfsc.trim().toUpperCase(),
        bankName: personBankName.trim(),
        upiId: personUpi.trim(),
        notes: personNotes,
        openingBalance: Number(personOpeningBalance) || 0,
      })
    );

    setIsAddPersonOpen(false);
    setPersonName('');
    setPersonMobile('');
    setPersonBankAcc('');
    setPersonIfsc('');
    setPersonBankName('');
    setPersonUpi('');
    setPersonNotes('');
    setPersonOpeningBalance(0);
    dispatch(showToast({ message: 'Personal account created! 👤', type: 'success' }));
  };

  // Create Transaction Handler
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || Number(txAmount) <= 0) return;

    await dispatch(
      createTransaction({
        accountCategory: txCategory,
        type: txType,
        amount: Number(txAmount),
        date: txDate,
        dueDate: txDueDate,
        personId: selectedPerson?._id || null,
        personName: selectedPerson?.name || '',
        personMobile: selectedPerson?.mobile || '',
        description: txDescription,
        category: txCategory === 'personal' ? 'Personal Lenden' : txCategory === 'real' ? 'Asset Transaction' : 'Nominal P&L',
      })
    );

    setIsAddTxOpen(false);
    setTxAmount('');
    setTxDescription('');
    setTxDueDate('');
    dispatch(showToast({ message: 'Transaction recorded successfully! 💰', type: 'success' }));
  };

  // Add Remark with Follow-up Due Date to Person
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
    const updatedRemarks = [newEntry, ...currentRemarks];

    await dispatch(
      updatePerson({
        id: selectedPerson._id,
        updates: { remarksHistory: updatedRemarks },
      })
    );

    // If due date was given, create task in Daily Tasks
    if (remarkDueDate) {
      await dispatch(
        createTask({
          title: `Follow-up with ${selectedPerson.name}: ${remarkNote.trim()}`,
          description: `Contact: ${selectedPerson.mobile || 'N/A'}. Due on ${remarkDueDate}`,
          priority: 'urgent-important',
          date: remarkDueDate,
          dueDate: remarkDueDate,
        })
      );
      dispatch(showToast({ message: 'Remark saved and added to Daily Tasks! 📅', type: 'success' }));
    } else {
      dispatch(showToast({ message: 'Remark added to profile! 📝', type: 'success' }));
    }

    setRemarkNote('');
    setRemarkDueDate('');
    setIsAddRemarkOpen(false);
  };

  // Export Contact as .vcf (vCard) for direct phone import
  const exportVCard = (person: PersonItem) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${person.name}
TEL;TYPE=CELL:${person.mobile}
NOTE:${person.notes || ''} | FocusTube Ledger
${person.email ? `EMAIL:${person.email}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${person.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispatch(showToast({ message: 'Contact .vcf downloaded! Open on phone to save.', type: 'info' }));
  };

  // Compute Overall Totals
  const totalReceivable = persons.reduce((acc, p) => (p.netBalance > 0 ? acc + p.netBalance : acc), 0);
  const totalPayable = persons.reduce((acc, p) => (p.netBalance < 0 ? acc + Math.abs(p.netBalance) : acc), 0);
  const netOverall = totalReceivable - totalPayable;

  const filteredPersons = persons.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.mobile && p.mobile.includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );
  });

  const personTransactions = transactions.filter((t) => t.personId === selectedPersonId);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Top Header & Overview Cards */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>हिसाब-किताब &amp; Double-Entry Ledger</span>
              </h1>
              <p className="text-xs text-neutral-400">
                Real (Assets) · Personal (Lena/Dena &amp; Contacts) · Nominal (Income/Expense)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAddPersonOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Person / Party</span>
            </button>

            <button
              onClick={() => setIsAddTxOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Transaction</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Total Receivable (Lena) */}
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

          {/* Total Payable (Dena) */}
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

          {/* Net Balance */}
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                नेट बैलेंस (Net)
              </span>
              <span
                className={`text-lg sm:text-xl font-bold ${
                  netOverall >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ₹{netOverall.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Account Types Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#262626] flex-wrap">
          <button
            onClick={() => {
              dispatch(setActiveLedgerTab('personal'));
              dispatch(setSelectedPersonId(null));
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'personal'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            👥 Personal Accounts ({persons.length})
          </button>
          <button
            onClick={() => dispatch(setActiveLedgerTab('real'))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'real'
                ? 'bg-amber-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            🏛️ Real Accounts (Assets &amp; Cash)
          </button>
          <button
            onClick={() => dispatch(setActiveLedgerTab('nominal'))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'nominal'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            📊 Nominal Accounts (Income &amp; Expense)
          </button>
          <button
            onClick={() => dispatch(setActiveLedgerTab('all'))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLedgerTab === 'all'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            📑 All Transactions ({transactions.length})
          </button>
        </div>
      </div>

      {/* Main View: If a person is selected, show their full ledger detail; otherwise list */}
      {selectedPerson ? (
        /* Selected Person Full Profile & Ledger View */
        <div className="space-y-4">
          <button
            onClick={() => dispatch(setSelectedPersonId(null))}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white bg-[#1a1a1a] border border-[#2e2e2e] px-3 py-1.5 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All People</span>
          </button>

          {/* Profile Card */}
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
                  <span className="text-xs text-neutral-400">
                    Category: <span className="capitalize text-neutral-300 font-semibold">{selectedPerson.category}</span>
                  </span>
                  {selectedPerson.dob && (
                    <span className="text-xs text-amber-400 block mt-0.5">
                      🎂 DOB: {selectedPerson.dob}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Call, WhatsApp, VCF Export */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPerson.mobile ? (
                  <>
                    <a
                      href={`tel:${selectedPerson.mobile}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call {selectedPerson.mobile}</span>
                    </a>

                    <a
                      href={`https://wa.me/91${selectedPerson.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `नमस्ते ${selectedPerson.name} जी, आपके हिसाब का शेष बैलेंस ₹${Math.abs(
                          selectedPerson.netBalance
                        )} ${selectedPerson.netBalance > 0 ? 'लेना है' : 'देना है'}।`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500 italic">No mobile phone saved</span>
                )}

                <button
                  onClick={() => exportVCard(selectedPerson)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#252525] hover:bg-[#303030] text-neutral-200 rounded-xl text-xs font-medium transition"
                  title="Export vCard to phone contacts"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save to Phone (.vcf)</span>
                </button>
              </div>
            </div>

            {/* Bank Details & Balance Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#1f1f1f] border border-[#333333] p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Net Balance
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
                    : 'हिसाब बराबर (₹0)'}
                </span>
              </div>

              <div className="bg-[#1f1f1f] border border-[#333333] p-3 rounded-xl col-span-2">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">
                  Bank Details &amp; UPI
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
                  <span>
                    A/C: <strong className="text-white">{selectedPerson.bankAccountNo || 'N/A'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    IFSC: <strong className="text-white">{selectedPerson.ifscCode || 'N/A'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    UPI: <strong className="text-white">{selectedPerson.upiId || 'N/A'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Date-wise Remarks History with Voice Typing */}
            <div className="pt-2 border-t border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Date-wise Remarks &amp; Interaction History (बोलकर टाइप करें)
                </span>
                <button
                  onClick={() => setIsAddRemarkOpen(!isAddRemarkOpen)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Remark</span>
                </button>
              </div>

              {isAddRemarkOpen && (
                <form
                  onSubmit={handleAddRemark}
                  className="bg-[#1b1b1b] p-3 rounded-xl border border-[#303030] space-y-2 animate-fade-in"
                >
                  <div className="relative">
                    <textarea
                      value={remarkNote}
                      onChange={(e) => setRemarkNote(e.target.value)}
                      placeholder="बातचीत का विवरण या टिप्पणी लिखें (e.g. आज कॉल पर पेमेंट के लिए बात हुई...)"
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

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-neutral-400 font-medium">
                      Follow-up Due Date:
                    </label>
                    <input
                      type="date"
                      value={remarkDueDate}
                      onChange={(e) => setRemarkDueDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#121212] border border-[#383838] rounded-lg text-xs text-neutral-200 outline-none"
                    />
                    <span className="text-[10px] text-neutral-500">
                      (ड्यू डेट डालने पर यह ऑटोमैटिक आपके डेली टास्क में दिखेगा)
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

              {/* Remarks List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedPerson.remarksHistory && selectedPerson.remarksHistory.length > 0 ? (
                  selectedPerson.remarksHistory.map((rh, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-2.5 bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-semibold text-neutral-200">{rh.note}</span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                          <span>Recorded: {rh.recordedDate}</span>
                          {rh.dueDate && (
                            <span className="text-amber-400 font-medium">
                              • Follow-up Due: {rh.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic py-2">
                    No remarks logged yet. Click &quot;Add Remark&quot; to save phone/meeting notes.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Person's Transactions List */}
          <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Transaction History ({personTransactions.length})
              </h3>
              <button
                onClick={() => setIsAddTxOpen(true)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Entry</span>
              </button>
            </div>

            <div className="space-y-2">
              {personTransactions.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  No transactions recorded yet with {selectedPerson.name}.
                </p>
              ) : (
                personTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3 bg-[#1c1c1c] border border-[#2d2d2d] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          tx.type === 'given'
                            ? 'bg-rose-950/60 text-rose-400'
                            : 'bg-emerald-950/60 text-emerald-400'
                        }`}
                      >
                        {tx.type === 'given' ? 'दिया' : 'लिया'}
                      </div>
                      <div>
                        <span className="font-semibold text-neutral-200 block">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {tx.description || 'General Entry'} · {tx.date}
                        </span>
                        {tx.dueDate && (
                          <span className="text-[10px] text-amber-400 block font-medium">
                            Due Date: {tx.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch(deleteTransaction(tx._id))}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeLedgerTab === 'personal' ? (
        /* List of All Personal Accounts */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search party by name, mobile, notes..."
                className="w-full pl-9 pr-4 py-2 bg-[#161616] border border-[#2e2e2e] rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none focus:border-red-500"
              />
            </div>
            <span className="text-xs text-neutral-400">
              Showing {filteredPersons.length} people
            </span>
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
                        <h3 className="font-bold text-sm text-neutral-100 leading-tight">
                          {p.name}
                        </h3>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          {p.mobile || 'No contact'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium capitalize">
                      {p.category}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-2">{p.notes}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#242424] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Net Balance:</span>
                  <span
                    className={`text-xs font-bold ${
                      p.netBalance > 0
                        ? 'text-emerald-400'
                        : p.netBalance < 0
                        ? 'text-rose-400'
                        : 'text-neutral-400'
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
      ) : (
        /* Real, Nominal or All Transactions Table */
        <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeLedgerTab === 'real'
                ? '🏛️ Real Accounts (Assets, Cash & Properties)'
                : activeLedgerTab === 'nominal'
                ? '📊 Nominal Accounts (Incomes & Expenses)'
                : '📑 All Recorded Transactions'}
            </h3>
            <button
              onClick={() => setIsAddTxOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.type === 'given' || tx.type === 'expense'
                        ? 'bg-rose-950/60 text-rose-400'
                        : 'bg-emerald-950/60 text-emerald-400'
                    }`}
                  >
                    {tx.type}
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-100 block">
                      ₹{tx.amount.toLocaleString('en-IN')}{' '}
                      {tx.personName && `· ${tx.personName}`}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {tx.description || tx.category} · Date: {tx.date}
                    </span>
                    {tx.dueDate && (
                      <span className="text-[10px] text-amber-400 block font-medium">
                        Due: {tx.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => dispatch(deleteTransaction(tx._id))}
                  className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-500" />
              <span>Create Personal Profile / Party</span>
            </h3>

            <form onSubmit={handleCreatePerson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Person / Party Name <span className="text-red-500">* (Mandatory)</span>
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar, Sharma Electricals"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={personMobile}
                    onChange={(e) => setPersonMobile(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={personCategory}
                    onChange={(e) => setPersonCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                    <option value="staff">Staff</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    DOB / Birthday (Auto-syncs to Calendar)
                  </label>
                  <input
                    type="date"
                    value={personDob}
                    onChange={(e) => setPersonDob(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    value={personOpeningBalance}
                    onChange={(e) => setPersonOpeningBalance(Number(e.target.value))}
                    placeholder="+ for Lena, - for Dena"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#262626] space-y-2">
                <span className="text-xs font-bold text-neutral-400 block">Bank Account &amp; UPI</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={personBankAcc}
                    onChange={(e) => setPersonBankAcc(e.target.value)}
                    placeholder="Bank Account Number"
                    className="px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={personIfsc}
                    onChange={(e) => setPersonIfsc(e.target.value)}
                    placeholder="IFSC Code"
                    className="px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none uppercase"
                  />
                </div>
                <input
                  type="text"
                  value={personUpi}
                  onChange={(e) => setPersonUpi(e.target.value)}
                  placeholder="UPI ID (e.g. name@okhdfcbank)"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  General Remarks / Notes
                </label>
                <textarea
                  value={personNotes}
                  onChange={(e) => setPersonNotes(e.target.value)}
                  placeholder="Additional profile information or context..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
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
                  Save Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              <span>Record Ledger Transaction</span>
            </h3>

            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Account Type
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                >
                  <option value="personal">Personal (Lena / Dena)</option>
                  <option value="real">Real (Asset / Cash / Property)</option>
                  <option value="nominal">Nominal (Income / Expense)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Entry Type
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  >
                    <option value="given">दिया (Payment / Loan Given)</option>
                    <option value="taken">लिया (Receipt / Loan Taken)</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="asset_add">Asset Acquired</option>
                    <option value="asset_reduce">Asset Disposed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="₹ Amount"
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Due Date (देना/लेना कब है)
                  </label>
                  <input
                    type="date"
                    value={txDueDate}
                    onChange={(e) => setTxDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description / Remarks
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Loan given for materials, consulting advance"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
