import React from 'react';

interface NavigationMenuProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  currentTab: string | null;
  setCurrentTab: (tab: string | null) => void;
  onClearSearch: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  setCurrentView, 
  setCurrentTab,
  onClearSearch 
}) => {
  const handleNav = (view: string, tab: string | null = null) => {
    setCurrentView(view);
    setCurrentTab(tab);
    onClearSearch();
  };

  // Helper for menu item styling
  const menuItemClasses = "block w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors";
  
  // Helper for unimplemented items
  const UnimplementedItem = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between w-full text-right px-4 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75">
      <span>{label}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" title="غير متوفر حالياً"></span>
    </div>
  );

  return (
    <nav className="hidden sm:flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1 mr-4" style={{ zIndex: 50 }}>
      {/* 1. عرض */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          عرض ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>كتب</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="absolute right-full top-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 py-2 -mr-1">
              <button onClick={() => handleNav('library')} className={menuItemClasses}>كتب المتون</button>
              <UnimplementedItem label="الكتب الخدمية" />
            </div>
          </div>

          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>أطراف</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="absolute right-full top-0 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 py-2 -mr-1">
              <button onClick={() => handleNav('atraf', 'list')} className={menuItemClasses}>قائمة الأطراف</button>
              <button onClick={() => handleNav('atraf', 'list')} className={menuItemClasses}>أطراف على الأسانيد</button>
              <button onClick={() => handleNav('atraf', 'comparison')} className={menuItemClasses}>متفق وزوائد المصنفات</button>
              <button onClick={() => handleNav('atraf', 'rwah_extra')} className={menuItemClasses}>زوائد الرواة عن المصنفين</button>
            </div>
          </div>

          <button onClick={() => handleNav('atraf', 'grouped')} className={menuItemClasses}>المتون المجمعة</button>
          <button onClick={() => handleNav('sciences', 'terms')} className={menuItemClasses}>تعريفات</button>
        </div>
      </div>

      {/* 2. رواة */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          رواة ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <button onClick={() => handleNav('narrators', 'search')} className={menuItemClasses}>قائمة الرواة</button>
          <button onClick={() => handleNav('narrators', 'books')} className={menuItemClasses}>رواة كتاب / كتب</button>
          <button onClick={() => handleNav('narrators', 'classification')} className={menuItemClasses}>تصنيفات خاصة بالرواة</button>
          <button onClick={() => handleNav('narrators', 'garh')} className={menuItemClasses}>ألفاظ الجرح والتعديل</button>
          <button onClick={() => handleNav('narrators', 'opinions')} className={menuItemClasses}>أقوال أهل العلم في أحوال الرواة</button>
        </div>
      </div>

      {/* 3. مكانز موضوعية */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          مكانز موضوعية ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <button onClick={() => handleNav('thematics', 'subject')} className={menuItemClasses}>شجرة الربط الموضوعي</button>
          <button onClick={() => handleNav('thematics', 'controversial')} className={menuItemClasses}>ربط بالمخالف</button>
        </div>
      </div>

      {/* 4. معاجم */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          معاجم ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <button onClick={() => handleNav('thematics', 'ghareeb')} className={menuItemClasses}>معجم غريب الحديث</button>
          <button onClick={() => handleNav('thematics', 'places')} className={menuItemClasses}>معجم الأماكن والبلدان</button>
        </div>
      </div>

      {/* 5. تطبيقات علوم الحديث */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          تطبيقات علوم الحديث ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <button onClick={() => handleNav('sciences', 'terms')} className={menuItemClasses}>تطبيقات المصطلح</button>
          <button onClick={() => handleNav('thematics', 'amthal_dates')} className={menuItemClasses}>أمثال الحديث النبوي</button>
          <button onClick={() => handleNav('thematics', 'amthal_dates')} className={menuItemClasses}>تواريخ المتون</button>
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>أقوال أهل العلم</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="absolute right-full top-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 py-2 -mr-1">
              <button onClick={() => handleNav('sciences', 'judgments')} className={menuItemClasses}>في الحكم على الحديث</button>
              <button onClick={() => handleNav('sciences', 'sciences')} className={menuItemClasses}>في علوم الحديث</button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. فهارس */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          فهارس ▾
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <button onClick={() => handleNav('sciences', 'quran')} className={menuItemClasses}>فهرس الآيات</button>
          <button onClick={() => handleNav('sciences', 'names')} className={menuItemClasses}>فهرس الأعلام</button>
          <button onClick={() => handleNav('sciences', 'poetry')} className={menuItemClasses}>فهرس الشعر</button>
        </div>
      </div>

      {/* 7. إحصائيات */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          إحصائيات ▾
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>الرواة</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="absolute right-full top-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 py-2 -mr-1">
              <button onClick={() => handleNav('statistics')} className={menuItemClasses}>الرواة</button>
              <button onClick={() => handleNav('statistics')} className={menuItemClasses}>رواة كتاب / كتب</button>
            </div>
          </div>

          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>الأحاديث</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="absolute right-full top-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 py-2 -mr-1">
              <button onClick={() => handleNav('statistics')} className={menuItemClasses}>الأطراف</button>
              <button onClick={() => handleNav('statistics')} className={menuItemClasses}>متفق وزوائد المصنفات</button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. مساعدة */}
      <div className="relative group">
        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1">
          مساعدة ▾
        </button>
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 top-full">
          <UnimplementedItem label="شروط وأحكام" />
          <UnimplementedItem label="خريطة الموقع" />
        </div>
      </div>
    </nav>
  );
};
