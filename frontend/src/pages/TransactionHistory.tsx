import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Train, ArrowRight, FileText, Mail, User, Building2, Clock, AlertTriangle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

interface Transaction {
  id: string;
  title: string;
  content: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  status: 'Emailed' | 'Saved' | 'Pending';
  date: any;
  userId: string;
  senderName?: string;
  receiverName?: string;
  receiverEmail?: string;
}

interface DeptInfo {
  name: string;
  role: string;
  email: string;
}

const TOPIC_COLORS: Record<string, string> = {
  telecommunication: "from-blue-500 to-blue-600",
  traffic: "from-orange-500 to-orange-600",
  medical: "from-emerald-500 to-emerald-600",
  finance: "from-purple-500 to-purple-600",
  maintenance: "from-amber-500 to-amber-600",
  management: "from-indigo-500 to-indigo-600",
  security: "from-rose-500 to-rose-600",
  signaling: "from-cyan-500 to-cyan-600",
};

const TOPIC_BG: Record<string, string> = {
  telecommunication: "bg-blue-50 border-blue-100 text-blue-700",
  traffic: "bg-orange-50 border-orange-100 text-orange-700",
  medical: "bg-emerald-50 border-emerald-100 text-emerald-700",
  finance: "bg-purple-50 border-purple-100 text-purple-700",
  maintenance: "bg-amber-50 border-amber-100 text-amber-700",
  management: "bg-indigo-50 border-indigo-100 text-indigo-700",
  security: "bg-rose-50 border-rose-100 text-rose-700",
  signaling: "bg-cyan-50 border-cyan-100 text-cyan-700",
};

export const TransactionHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [departments, setDepartments] = useState<Record<string, DeptInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  // Fetch departments for mapping
  useEffect(() => {
    if (!currentUser) return;
    const fetchDepts = async () => {
      try {
        const q = query(collection(db, 'departments'));
        const snapshot = await getDocs(q);
        const deptMap: Record<string, DeptInfo> = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId === currentUser.uid) {
            deptMap[data.name.toLowerCase()] = {
              name: data.name,
              role: data.role,
              email: data.email,
            };
          }
        });
        setDepartments(deptMap);
      } catch (err) {
        console.warn("Could not fetch departments:", err);
      }
    };
    fetchDepts();
  }, [currentUser]);

  // Fetch transactions (documents)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        txns.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txns);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
      setError(err.message || 'Failed to load transactions.');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = searchTerm === '' ||
      txn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || txn.topic.toLowerCase() === filterDept;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = [...new Set(transactions.map(t => t.topic.toLowerCase()))];

  const formatDate = (date: any) => {
    if (!date?.toDate) return 'Just now';
    const d = date.toDate();
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 mr-4 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <Train size={24} />
              </div>
              <div className="ml-4">
                <h1 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">TRANSACTION HISTORY</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Kochi Metro Rail Limited</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-indigo-50 rounded-2xl text-xs font-bold text-indigo-600 border border-indigo-100">
                {transactions.length} Total Transactions
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions by title, department, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
              />
            </div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-600 capitalize"
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map(dept => (
                <option key={dept} value={dept} className="capitalize">{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center mb-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
            <h2 className="text-xl font-bold text-rose-900 mb-2">Connection Error</h2>
            <p className="text-rose-600/70 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTransactions.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Transactions Found</h2>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterDept !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload documents from the Dashboard to see transaction history here.'}
            </p>
          </div>
        )}

        {/* Transaction Cards */}
        <div className="space-y-4">
          {filteredTransactions.map((txn, index) => {
            const deptInfo = departments[txn.topic.toLowerCase()];
            const senderName = txn.senderName || currentUser?.email?.split('@')[0] || 'System';
            const receiverName = deptInfo?.role || txn.receiverName || 'Department Head';
            const receiverEmail = deptInfo?.email || txn.receiverEmail || 'Not configured';

            return (
              <div
                key={txn.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:border-indigo-200 transition-all group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left color stripe */}
                  <div className={twMerge(
                    "lg:w-2 w-full h-2 lg:h-auto bg-gradient-to-b",
                    TOPIC_COLORS[txn.topic.toLowerCase()] || "from-gray-400 to-gray-500"
                  )} />

                  <div className="flex-1 p-6">
                    {/* Top row: Title + status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {txn.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-lg">{txn.content}</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={twMerge(
                          "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          txn.priority === 'high' ? "bg-rose-50 text-rose-600 border-rose-200" :
                          txn.priority === 'medium' ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-blue-50 text-blue-600 border-blue-200"
                        )}>
                          {txn.priority} priority
                        </span>
                        <span className={twMerge(
                          "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          txn.status === 'Emailed' ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
                          "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}>
                          {txn.status === 'Emailed' ? '✉ Emailed' : '✓ Stored'}
                        </span>
                      </div>
                    </div>

                    {/* Transfer visualization */}
                    <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Sender */}
                        <div className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm w-full">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sender</div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 capitalize">{senderName}</div>
                              <div className="text-xs text-gray-400">{currentUser?.email || 'admin@kmtp.in'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={twMerge(
                            "w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-white shadow-lg",
                            TOPIC_COLORS[txn.topic.toLowerCase()] || "from-gray-400 to-gray-500"
                          )}>
                            <ArrowRight size={18} />
                          </div>
                          <span className={twMerge(
                            "mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border capitalize",
                            TOPIC_BG[txn.topic.toLowerCase()] || "bg-gray-50 border-gray-200 text-gray-600"
                          )}>
                            {txn.topic}
                          </span>
                        </div>

                        {/* Receiver */}
                        <div className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm w-full">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Receiver</div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 capitalize">{receiverName}</div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <Mail size={10} className="mr-1" />
                                {receiverEmail}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: date */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <Clock size={12} className="mr-1.5" />
                        {formatDate(txn.date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <FileText size={12} className="mr-1.5" />
                        Document #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
