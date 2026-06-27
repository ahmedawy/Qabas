import React from 'react';

interface AlphabetBarProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
}

const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

export const AlphabetBar: React.FC<AlphabetBarProps> = ({ selectedLetter, onSelectLetter }) => {
  return (
    <div className="alphabet-bar-stack-1">
      <div className="alphabet-bar-wrapper-2">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          التصفح الأبجدي للأطراف (أ - ي)
        </span>
        {selectedLetter && (
          <button
            onClick={() => onSelectLetter(null)}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>إلغاء التصفية</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center md:justify-start direction-rtl">
        <button
          onClick={() => onSelectLetter(null)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            selectedLetter === null
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-250 border border-slate-200 dark:border-slate-800'
          }`}
        >
          الكل
        </button>

        {ARABIC_LETTERS.map((letter) => {
          const isSelected = selectedLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => onSelectLetter(letter)}
              className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.08] ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-250 border border-slate-200 dark:border-slate-800 hover:scale-[1.03]'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
