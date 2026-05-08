import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentHistory } from '../components/DocumentHistory';
import { LogOut, Train, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

export const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [deptMapping, setDeptMapping] = useState<Record<string, string[]>>({});
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const fetchDepts = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'departments'));
        const snapshot = await getDocs(q);
        const mapping: Record<string, string[]> = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId === currentUser.uid) {
            mapping[data.name.toLowerCase()] = [data.email];
          }
        });
        setDeptMapping(mapping);
      } catch (err) {
        console.warn("Could not fetch departments:", err);
      }
    };
    fetchDepts();
  }, [currentUser]);

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/health`, { 
          signal: AbortSignal.timeout(10000),
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentUser) return;

    setLoading(true);
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process files one by one to avoid backend timeouts/OOM on free tier
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusMsg(`Processing ${i + 1} of ${files.length}: ${file.name}...`);
        
        const formData = new FormData();
        formData.append('files', file);
        formData.append('mapping', JSON.stringify(deptMapping));

        try {
          const response = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            body: formData,
            headers: { 'bypass-tunnel-reminder': 'true' }
          });

          if (!response.ok) throw new Error('Backend server error');
          
          const results = await response.json();
          
          // Save result to Firebase Firestore
          for (const res of results) {
            if (res.error) {
              console.error("Error from backend:", res.error);
              errorCount++;
              continue;
            }
            
            await addDoc(collection(db, 'documents'), {
              ...res,
              date: serverTimestamp(),
              userId: currentUser.uid
            });
            successCount++;
          }
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0 && successCount === 0) {
        setStatusMsg('Failed to connect to Python backend. Make sure it is running.');
      } else if (errorCount > 0) {
        setStatusMsg(`Processed ${successCount} files, but ${errorCount} failed.`);
      } else {
        setStatusMsg('Successfully processed all documents!');
      }
      setTimeout(() => setStatusMsg(''), 5000);
      
    } catch (error) {
      console.error("Critical error:", error);
      setStatusMsg('Failed to connect to Python backend. Make sure it is running.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-white">
                <Train size={24} />
              </div>
              <div className="ml-4">
                <h1 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">KMRL</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Kochi Metro Rail Limited</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-1 px-4 py-1.5 bg-gray-100 rounded-2xl">
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-white rounded-xl shadow-sm"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/departments')}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Departments
              </button>
              <button 
                onClick={() => navigate('/transactions')}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Transaction History
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-gray-900">{currentUser?.email?.split('@')[0]}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Administrator</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                <h2 className="text-2xl font-black mb-2 relative">Upload Bunch</h2>
                <p className="text-indigo-100 text-sm mb-8 relative">Connect to the Python ML engine to classify and route multiple files at once.</p>
                
                <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <Upload size={18} className="mr-2" />
                    )}
                    {loading ? 'Processing...' : 'Upload Files'}
                </button>
            </div>

            {statusMsg && (
                <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm flex items-center text-xs font-bold text-indigo-600 animate-in fade-in zoom-in duration-300">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500" />}
                    {statusMsg}
                </div>
            )}

            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">System Status</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Python API</span>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                          backendStatus === 'online' ? 'bg-emerald-100 text-emerald-700' :
                          backendStatus === 'offline' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {backendStatus === 'online' ? 'Active' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">ML Engine</span>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                          backendStatus === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {backendStatus === 'online' ? 'Ready' : 'Unavailable'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Auto-Email</span>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase">Enabled</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-8">
            <DocumentHistory />
          </div>
        </div>
      </main>
    </div>
  );
};
