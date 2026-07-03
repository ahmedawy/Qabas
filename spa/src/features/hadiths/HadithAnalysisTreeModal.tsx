import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Tag,
  Info,
  HelpCircle,
  Users,
  User,
  GitCommit,
  MessageCircle,
  Mic,
  Scale,
  CheckCircle,
  Folder,
  Bookmark,
  Eye,
  ExternalLink,
  Network,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
}

interface HadithAnalysisTreeModalProps {
  hadithId: number;
  onClose: () => void;
}

const IconMapper: React.FC<{ name?: string; className?: string }> = ({ name, className = "w-4 h-4" }) => {
  switch (name) {
    case 'BookOpen': return <BookOpen className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'Info': return <Info className={className} />;
    case 'HelpCircle': return <HelpCircle className={className} />;
    case 'Users': return <Users className={className} />;
    case 'User': return <User className={className} />;
    case 'GitCommit': return <GitCommit className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    case 'Mic': return <Mic className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'CheckCircle': return <CheckCircle className={className} />;
    case 'Folder': return <Folder className={className} />;
    case 'Bookmark': return <Bookmark className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'ExternalLink': return <ExternalLink className={className} />;
    default: return <Network className={className} />;
  }
};

const TreeNodeView: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first two levels
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="font-sans text-right dir-rtl select-text">
      <div 
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all ${
          hasChildren ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
        }`}
      >
        {hasChildren ? (
          <span className="text-slate-400 dark:text-slate-500">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        ) : (
          <span className="w-4"></span>
        )}

        <span className="text-slate-500 dark:text-slate-400">
          <IconMapper name={node.icon} />
        </span>

        <span className={`text-sm ${
          level === 0 
            ? 'font-bold text-slate-900 dark:text-white text-base' 
            : hasChildren 
              ? 'font-semibold text-slate-800 dark:text-slate-200' 
              : 'text-slate-650 dark:text-slate-350 leading-relaxed font-serif'
        }`}>
          {node.label}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="mr-6 pr-3 border-r border-slate-105 dark:border-slate-800 flex flex-col gap-1 mt-1">
          {node.children!.map((child) => (
            <TreeNodeView key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const HadithAnalysisTreeModal: React.FC<HadithAnalysisTreeModalProps> = ({
  hadithId,
  onClose,
}) => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    let active = true;
    setLoading(true);
    setError(null);

    api.getHadithAnalysisTree(hadithId)
      .then((res) => {
        if (active) {
          if (res.success && res.data) {
            setTreeData(res.data);
          } else {
            setError('فشل في تحميل هيكلية شجرة التحليل');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'حدث خطأ أثناء تحميل شجرة التحليل');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hadithId, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-sans text-sm font-medium">جاري تحميل شجرة التحليل...</p>
        </div>
      </div>
    );
  }

  if (error || !treeData) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">حدث خطأ</h3>
          <p className="text-slate-600 dark:text-slate-400 font-sans text-sm">{error || 'لم يتم العثور على بيانات شجرة التحليل'}</p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="hadith-detail-modal-card-17 dir-rtl shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            aria-label="Close"
            title="إغلاق (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="hadith-detail-modal-stack-19">
            <span className="hadith-detail-modal-text-20">
              شجرة تحليل الحديث الشاملة
            </span>
            <h2 className="hadith-detail-modal-title-21 text-right">
              {treeData?.label || 'مخطط العلاقات والإسناد'}
            </h2>
          </div>
        </div>

        {/* Content Tree */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-100/40 dark:bg-slate-900/20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <TreeNodeView node={treeData} level={0} />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};
