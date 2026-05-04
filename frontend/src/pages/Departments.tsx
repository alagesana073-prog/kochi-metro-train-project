import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Building2, Plus, Edit2, Trash2, Mail, User, ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Department {
  id: string;
  name: string;
  role: string;
  email: string;
  userId: string;
}

const DEFAULT_DEPTS = [
  'telecommunication', 'traffic', 'medical', 'finance', 
  'maintenance', 'management', 'security', 'signaling'
];

export const Departments: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'departments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const depts: Department[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === currentUser.uid) {
          depts.push({ id: doc.id, ...data } as Department);
        }
      });
      setDepartments(depts);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
      setError(err.message || 'Failed to load departments. Check Firestore rules.');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddDefault = async () => {
    if (!currentUser) return;
    for (const deptName of DEFAULT_DEPTS) {
      // Check if already exists
      if (departments.some(d => d.name.toLowerCase() === deptName)) continue;
      
      await addDoc(collection(db, 'departments'), {
        name: deptName,
        role: 'Head of ' + deptName,
        email: `railway${deptName}@gmail.com`,
        userId: currentUser.uid
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name || !role || !email) return;

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'departments', isEditing), {
          name, role, email
        });
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'departments'), {
          name, role, email, userId: currentUser.uid
        });
        setIsAdding(false);
      }
      // Reset
      setName('');
      setRole('');
      setEmail('');
    } catch (err) {
      console.error("Error saving department:", err);
    }
  };

  const startEdit = (dept: Department) => {
    setIsEditing(dept.id);
    setName(dept.name);
    setRole(dept.role);
    setEmail(dept.email);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      await deleteDoc(doc(db, 'departments', id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
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
                <Building2 size={24} />
              </div>
              <div className="ml-4">
                <h1 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">DEPARTMENTS</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Kochi Metro Train Project</span>
              </div>
            </div>
            
            <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center"
            >
                <Plus size={18} className="mr-2" />
                Add Department
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {loading && (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center mb-8">
                <h2 className="text-xl font-bold text-rose-900 mb-2">Connection Error</h2>
                <p className="text-rose-600/70 text-sm mb-2">{error}</p>
                <p className="text-rose-500/50 text-xs">Make sure your Firestore security rules allow read/write access for authenticated users.</p>
            </div>
        )}

        {departments.length === 0 && !loading && !error && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 text-center mb-8">
                <h2 className="text-xl font-bold text-indigo-900 mb-2">Setup Your Departments</h2>
                <p className="text-indigo-600/70 text-sm mb-6 text-center max-w-md mx-auto">It looks like you haven't added any departments yet. You can start by adding the default railway departments.</p>
                <button 
                    onClick={handleAddDefault}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:scale-[1.02] transition-all"
                >
                    Setup Default Departments
                </button>
            </div>
        )}

        {(isAdding || isEditing) && (
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900">{isEditing ? 'Edit Department' : 'New Department'}</h3>
                    <button onClick={() => {setIsAdding(false); setIsEditing(null);}} className="p-2 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Department Name</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 text-sm font-bold capitalize"
                            placeholder="e.g. Telecommunication"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Roll / Head Name</label>
                        <input 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                            placeholder="e.g. Chief Engineer"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Gmail / Contact ID</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                            placeholder="e.g. dept@gmail.com"
                            required
                        />
                    </div>
                    <div className="md:col-span-3">
                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center hover:bg-black transition-colors">
                            <Save size={18} className="mr-2" />
                            {isEditing ? 'Update Department' : 'Create Department'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:border-indigo-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Building2 size={24} />
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => startEdit(dept)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(dept.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 capitalize mb-1">{dept.name}</h4>
                    <div className="space-y-2 mt-4">
                        <div className="flex items-center text-xs font-bold text-gray-500">
                            <User size={14} className="mr-2 text-indigo-400" />
                            {dept.role}
                        </div>
                        <div className="flex items-center text-xs font-bold text-gray-500">
                            <Mail size={14} className="mr-2 text-indigo-400" />
                            {dept.email}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};
