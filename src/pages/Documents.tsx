import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  Download, 
  Trash2, 
  File,
  ExternalLink
} from 'lucide-react';

export const Documents = () => {
  const { projects, getProjectDetails, downloadDocument, deleteDocument } = useStore();
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllDocuments();
  }, [projects]);

  const loadAllDocuments = async () => {
    setLoading(true);
    const docs: any[] = [];
    for (const project of projects) {
      try {
        const details = await getProjectDetails(project.id);
        if (details.documents) {
          details.documents.forEach(doc => {
            docs.push({
              ...doc,
              projectName: project.name,
              projectId: project.id
            });
          });
        }
      } catch (e) {
        console.error('Failed to load docs for project', project.id);
      }
    }
    setAllDocuments(docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const filteredDocs = allDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Document Vault</h2>
          <p className="text-neutral-500 text-sm">All project-related files in one place</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by filename or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                  {searchQuery ? `No documents found matching "${searchQuery}"` : 'No documents in the vault yet.'}
                </td>
              </tr>
            ) : filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center">
                      <File className="w-4 h-4 text-neutral-500" />
                    </div>
                    <span className="font-medium text-neutral-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={`#projects/${doc.projectId}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    {doc.projectName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-bold uppercase">
                    {doc.type.split('/')[1] || doc.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500 text-sm">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => downloadDocument(doc.id)}
                      className="p-2 hover:bg-primary-50 text-neutral-400 hover:text-primary-600 rounded-md transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  No documents found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
