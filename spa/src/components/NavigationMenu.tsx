import React from 'react';

interface NavigationMenuProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  currentTab: string | null;
  setCurrentTab: (tab: string | null) => void;
  onClearSearch: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  currentView,
  currentTab,
  setCurrentView, 
  setCurrentTab,
  onClearSearch 
}) => {
  const handleNav = (view: string, tab: string | null = null) => {
    setCurrentView(view);
    setCurrentTab(tab);
    onClearSearch();
  };

  const isTabActive = (view: string, tab: string | null) => {
    if (view === 'library') {
      if (tab === 'primary') return currentView === 'library' && (currentTab === null || currentTab === 'primary');
      if (tab === 'auxiliary') return currentView === 'library' && currentTab === 'auxiliary';
    }
    return currentView === view && currentTab === tab;
  };

  const getMenuItemClasses = (view: string, tab: string | null = null) => {
    const active = isTabActive(view, tab);
    return `block w-full text-right px-4 py-2 text-sm transition-colors ${
      active 
        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-semibold' 
        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300'
    }`;
  };

  const getHeaderButtonClasses = (isActive: boolean) => {
    return `px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
      isActive 
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm border border-emerald-500/10' 
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
    }`;
  };
  
  // Helper for unimplemented items
  const UnimplementedItem = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between w-full text-right px-4 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75">
      <span>{label}</span>
      <span className="navigation-menu-badge-6" title="غير متوفر حالياً"></span>
    </div>
  );

  return (
    <nav className="navigation-menu-element-7" style={{ zIndex: 50 }}>
      {/* 1. عرض */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'library' || currentView === 'atraf')}>
          عرض ▾
        </button>
        <div className="navigation-menu-card-2">
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>كتب</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="navigation-menu-card-4">
              <button onClick={() => handleNav('library', 'primary')} className={getMenuItemClasses('library', 'primary')}>كتب المتون</button>
              <button onClick={() => handleNav('library', 'auxiliary')} className={getMenuItemClasses('library', 'auxiliary')}>الكتب الخدمية</button>
            </div>
          </div>

          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>أطراف</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="navigation-menu-card-8">
              <button onClick={() => handleNav('atraf', 'list')} className={getMenuItemClasses('atraf', 'list')}>قائمة الأطراف</button>
              <button onClick={() => handleNav('atraf', 'list')} className={getMenuItemClasses('atraf', 'list')}>أطراف على الأسانيد</button>
              <button onClick={() => handleNav('atraf', 'comparison')} className={getMenuItemClasses('atraf', 'comparison')}>متفق وزوائد المصنفات</button>
              <button onClick={() => handleNav('atraf', 'rwah_extra')} className={getMenuItemClasses('atraf', 'rwah_extra')}>زوائد الرواة عن المصنفين</button>
            </div>
          </div>

          <button onClick={() => handleNav('atraf', 'grouped')} className={getMenuItemClasses('atraf', 'grouped')}>المتون المجمعة</button>
          <button onClick={() => handleNav('sciences', 'terms')} className={getMenuItemClasses('sciences', 'terms')}>تعريفات</button>
        </div>
      </div>

      {/* 2. رواة */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'narrators')}>
          رواة ▾
        </button>
        <div className="navigation-menu-card-2">
          <button onClick={() => handleNav('narrators', 'search')} className={getMenuItemClasses('narrators', 'search')}>قائمة الرواة</button>
          <button onClick={() => handleNav('narrators', 'books')} className={getMenuItemClasses('narrators', 'books')}>رواة كتاب / كتب</button>
          <button onClick={() => handleNav('narrators', 'classification')} className={getMenuItemClasses('narrators', 'classification')}>تصنيفات خاصة بالرواة</button>
          <button onClick={() => handleNav('narrators', 'garh')} className={getMenuItemClasses('narrators', 'garh')}>ألفاظ الجرح والتعديل</button>
          <button onClick={() => handleNav('narrators', 'opinions')} className={getMenuItemClasses('narrators', 'opinions')}>أقوال أهل العلم في أحوال الرواة</button>
        </div>
      </div>

      {/* 3. مكانز موضوعية */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'thematics' && ['subject', 'controversial'].includes(currentTab || ''))}>
          مكانز موضوعية ▾
        </button>
        <div className="navigation-menu-card-2">
          <button onClick={() => handleNav('thematics', 'subject')} className={getMenuItemClasses('thematics', 'subject')}>شجرة الربط الموضوعي</button>
          <button onClick={() => handleNav('thematics', 'controversial')} className={getMenuItemClasses('thematics', 'controversial')}>ربط بالمخالف</button>
        </div>
      </div>

      {/* 4. معاجم */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'thematics' && ['ghareeb', 'places'].includes(currentTab || ''))}>
          معاجم ▾
        </button>
        <div className="navigation-menu-card-2">
          <button onClick={() => handleNav('thematics', 'ghareeb')} className={getMenuItemClasses('thematics', 'ghareeb')}>معجم غريب الحديث</button>
          <button onClick={() => handleNav('thematics', 'places')} className={getMenuItemClasses('thematics', 'places')}>معجم الأماكن والبلدان</button>
        </div>
      </div>

      {/* 5. تطبيقات علوم الحديث */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(
          (currentView === 'sciences' && ['terms', 'judgments', 'sciences'].includes(currentTab || '')) ||
          (currentView === 'thematics' && currentTab === 'amthal_dates')
        )}>
          تطبيقات علوم الحديث ▾
        </button>
        <div className="navigation-menu-card-2">
          <button onClick={() => handleNav('sciences', 'terms')} className={getMenuItemClasses('sciences', 'terms')}>تطبيقات المصطلح</button>
          <button onClick={() => handleNav('thematics', 'amthal_dates')} className={getMenuItemClasses('thematics', 'amthal_dates')}>أمثال الحديث النبوي</button>
          <button onClick={() => handleNav('thematics', 'amthal_dates')} className={getMenuItemClasses('thematics', 'amthal_dates')}>تواريخ المتون</button>
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>أقوال أهل العلم</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="navigation-menu-card-4">
              <button onClick={() => handleNav('sciences', 'judgments')} className={getMenuItemClasses('sciences', 'judgments')}>في الحكم على الحديث</button>
              <button onClick={() => handleNav('sciences', 'sciences')} className={getMenuItemClasses('sciences', 'sciences')}>في علوم الحديث</button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. فهارس */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'sciences' && ['quran', 'names', 'poetry'].includes(currentTab || ''))}>
          فهارس ▾
        </button>
        <div className="navigation-menu-card-9">
          <button onClick={() => handleNav('sciences', 'quran')} className={getMenuItemClasses('sciences', 'quran')}>فهرس الآيات</button>
          <button onClick={() => handleNav('sciences', 'names')} className={getMenuItemClasses('sciences', 'names')}>فهرس الأعلام</button>
          <button onClick={() => handleNav('sciences', 'poetry')} className={getMenuItemClasses('sciences', 'poetry')}>فهرس الشعر</button>
        </div>
      </div>

      {/* 7. إحصائيات */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(currentView === 'statistics')}>
          إحصائيات ▾
        </button>
        <div className="navigation-menu-card-2">
          
          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>الرواة</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="navigation-menu-card-4">
              <button onClick={() => handleNav('statistics')} className={getMenuItemClasses('statistics')}>الرواة</button>
              <button onClick={() => handleNav('statistics')} className={getMenuItemClasses('statistics')}>رواة كتاب / كتب</button>
            </div>
          </div>

          <div className="relative group/nested">
            <button className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex justify-between items-center">
              <span>الأحاديث</span>
              <span className="text-[10px]">◀</span>
            </button>
            <div className="navigation-menu-card-4">
              <button onClick={() => handleNav('statistics')} className={getMenuItemClasses('statistics')}>الأطراف</button>
              <button onClick={() => handleNav('statistics')} className={getMenuItemClasses('statistics')}>متفق وزوائد المصنفات</button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. مساعدة */}
      <div className="relative group">
        <button className={getHeaderButtonClasses(false)}>
          مساعدة ▾
        </button>
        <div className="navigation-menu-card-10">
          <UnimplementedItem label="شروط وأحكام" />
          <UnimplementedItem label="خريطة الموقع" />
        </div>
      </div>
    </nav>
  );
};
