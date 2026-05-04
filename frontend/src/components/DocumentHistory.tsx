import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Shield, Activity, Truck, Settings, Users, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  status: 'Emailed' | 'Saved' | 'Pending';
  date: any;
  userId: string;
}

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  telecommunication: <Activity className="w-4 h-4" />,
  traffic: <Truck className="w-4 h-4" />,
  medical: <Activity className="w-4 h-4" />,
  finance: <Settings className="w-4 h-4" />,
  maintenance: <Settings className="w-4 h-4" />,
  management: <Users className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  signaling: <AlertTriangle className="w-4 h-4" />,
};

const TOPIC_COLORS: Record<string, string> = {
  telecommunication: "bg-blue-100 text-blue-700 border-blue-200",
  traffic: "bg-orange-100 text-orange-700 border-orange-200",
  medical: "bg-emerald-100 text-emerald-700 border-emerald-200",
  finance: "bg-purple-100 text-purple-700 border-purple-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  management: "bg-indigo-100 text-indigo-700 border-indigo-200",
  security: "bg-rose-100 text-rose-700 border-rose-200",
  signaling: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export const DocumentHistory: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: DocumentRecord[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as DocumentRecord);
      });
      setDocuments(docs);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-white/50 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            Recent Transactions
          </h3>
          <p className="text-sm text-gray-500 mt-1">Latest document transfers and classification results</p>
        </div>
        <div className="flex space-x-2">
            <div className="flex items-center px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-500 border border-gray-100">
                {documents.length} Total Records
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4 border-b border-gray-100">Document</th>
              <th className="px-6 py-4 border-b border-gray-100">Department</th>
              <th className="px-6 py-4 border-b border-gray-100">Priority</th>
              <th className="px-6 py-4 border-b border-gray-100">Action Status</th>
              <th className="px-6 py-4 border-b border-gray-100">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {error ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
                    <p className="text-rose-600 font-bold mb-2">Database Error</p>
                    <p className="text-gray-500 text-xs max-w-md mx-auto">{error}</p>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No documents processed yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{doc.title}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{doc.content}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={twMerge(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize shadow-sm",
                      TOPIC_COLORS[doc.topic] || "bg-gray-100 text-gray-700 border-gray-200"
                    )}>
                      {TOPIC_ICONS[doc.topic] || <FileText className="w-3 h-3 mr-1" />}
                      <span className="ml-1.5">{doc.topic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={twMerge(
                      "text-xs font-black uppercase tracking-widest",
                      doc.priority === 'high' ? "text-rose-600" : doc.priority === 'medium' ? "text-amber-600" : "text-blue-600"
                    )}>
                      {doc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700">
                      {doc.status === 'Emailed' ? (
                        <><Mail className="w-3.5 h-3.5 text-indigo-500" /> <span className="text-indigo-600">Emailed</span></>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-600">Stored</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-400">
                    {doc.date?.toDate ? doc.date.toDate().toLocaleDateString() : 'Just now'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
