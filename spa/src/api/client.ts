import type {
  Book,
  TocNode,
  HadithSummary,
  HadithJudgment,
  Chain,
  TakhreejItem,
  ShawahedData,
  CombinedMatn,
  NarratorSummary,
  CritiqueTerm,
  ScholarOpinion,
  AtrafResult,
  AtrafExtraResult,
  GroupedMtnResult,
  SubjectTreeNode,
  ControversialTreeNode,
  LexiconTreeNode,
  ServiceText,
  ScholarDefinition,
  ExpressionTreeNode,
  HadithJudgmentResult,
  HadithServiceResult,
  SurahIndex,
  VerseIndex,
  IndexCategoryNode,
  IndexItemNode,
  ShawahedItem,
  ServiceBookItem
} from '../types';

/**
 * Dynamic API base URL resolver.
 * Priority:
 *  1. VITE_API_BASE env var (set at build time for specific environments)
 *  2. Auto-detected from current page origin + path prefix
 *     - XAMPP dev:   http://localhost/Hadith/api/public/api/v1
 *     - Shared host: https://yourdomain.com/api/public/api/v1
 *     - Vite dev:    http://127.0.0.1:8000/api/v1 (fallback for `npm run dev`)
 */
function resolveApiBase(): string {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE as string;
  }
  // When running via Vite dev server (port 5173) fall back to artisan serve port
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://127.0.0.1:8000/api/v1';
  }
  // For XAMPP / shared hosting: derive the sub-path from the page URL
  // e.g. http://localhost/Hadith/index.html → origin = http://localhost, pathname prefix = /Hadith
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Strip the SPA filename to get the subfolder prefix (e.g. /Hadith or /)
    const pathParts = window.location.pathname.split('/');
    // Remove the filename (index.html or empty last segment)
    pathParts.pop();
    const subPath = pathParts.join('/'); // e.g. '/Hadith' or ''
    return `${origin}${subPath}/api/public/api/v1`;
  }
  return '/api/public/api/v1';
}

const API_BASE = resolveApiBase();

async function request<T>(path: string, method: string = 'GET', body?: Record<string, unknown>): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}/${path}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface TarqeemBounds {
  available: boolean;
  min_hadith?: number;
  max_hadith?: number;
  min_part?: number;
  max_part?: number;
  min_page?: number;
  max_page?: number;
}

export const api = {
  getHadithBooks: () =>
    request<{ success: boolean; books: Book[] }>('hadith-books')
      .then(res => ({
        ...res,
        books: res.books.map(b => ({ ...b, type: 'hadith' as const })),
      })),

  getServiceBooks: () =>
    request<{ success: boolean; books: Book[] }>('service-books')
      .then(res => ({
        ...res,
        books: res.books.map(b => ({ ...b, type: 'service' as const })),
      })),

  getAllBooks: async () => {
    const [hadithRes, serviceRes] = await Promise.all([
      request<{ success: boolean; books: Book[] }>('hadith-books'),
      request<{ success: boolean; books: Book[] }>('service-books'),
    ]);
    return {
      success: true,
      books: [
        ...hadithRes.books.map(b => ({ ...b, type: 'hadith' as const })),
        ...serviceRes.books.map(b => ({ ...b, type: 'service' as const })),
      ],
    };
  },

  getBookTarqeems: (bookId: number, part?: number | string, type: 'hadith' | 'service' = 'hadith') => {
    let path = `hadith-books/${bookId}/tarqeems?type=${type}`;
    if (part !== undefined && part !== '') {
      path += `&part=${part}`;
    }
    return request<Record<string, TarqeemBounds>>(path);
  },

  getToc: (bookId: number, type: 'hadith' | 'service' = 'hadith') =>
    request<{ success: boolean; book_id: number; toc: TocNode[] }>(`toc?book_id=${bookId}&type=${type}`),

  getChapterHadiths: (bookId: number, chapterId: number, page: number = 1, type: 'hadith' | 'service' = 'hadith') =>
    request<{ success: boolean; hadiths: HadithSummary[]; next_page?: number | null }>(`chapter?book_id=${bookId}&chapter_id=${chapterId}&page=${page}&type=${type}`),

  getHadithJudgments: (id: number) =>
    request<{ book_name: string; hadith_num: number; judgments: HadithJudgment[] }>(`hadith/judgments?id=${id}`),

  getHadithChains: (id: number) =>
    request<{ book_name: string; hadith_num: number; chains: Chain[] }>(`hadith/chains?id=${id}`),

  getHadithTakhreej: (id: number) =>
    request<{ book_name: string; hadith_num: number; book_id: number; takhreej: TakhreejItem[]; shawahed: ShawahedData; combined_matn: CombinedMatn | null }>(`hadith/takhreej?id=${id}`),

  getHadithShawahedList: (id: number) =>
    request<{ status: string; data: ShawahedItem[] }>(`hadith/${id}/shawahed`),

  getHadithServiceBooksList: (id: number) =>
    request<{ status: string; data: Record<string, ServiceBookItem[]> }>(`hadith/${id}/service-books`),

  getHadithByNum: (bookId: number, num: string | number, tarqeem: string = 'ID') =>
    request<{ success: boolean; hadith: HadithSummary }>(`hadith_by_num?book_id=${bookId}&num=${num}&tarqeem=${tarqeem}`),

  getHadithByPage: (bookId: number, page: number, part?: number, type: 'hadith' | 'service' = 'hadith') => {
    let path = `hadith_by_page?book_id=${bookId}&page=${page}&type=${type}`;
    if (part !== undefined && part > 0) {
      path += `&part=${part}`;
    }
    return request<{ success: boolean; hadiths: HadithSummary[] }>(path);
  },

  search: (q: string, bookId: number, page: number = 1, limit: number = 10) =>
    request<{ success: boolean; total: number; page: number; limit: number; results: HadithSummary[] }>(
      `search?q=${encodeURIComponent(q)}&book_id=${bookId}&page=${page}&limit=${limit}`
    ),

  getNarratorsList: (q: string, fields: string[] = ['Name']) =>
    request<{ success: boolean; results: NarratorSummary[] }>(
      `rwah_list?q=${encodeURIComponent(q)}&fields=${fields.join(',')}`
    ),

  getNarratorDetail: (id: number, tab?: string, page?: number) => {
    let path = `narrator?id=${id}`;
    if (tab) path += `&tab=${tab}`;
    if (page) path += `&page=${page}`;
    return request<any>(path);
  },

  getNarratorsByBook: (books: string, q: string) =>
    request<{ success: boolean; results: NarratorSummary[] }>(
      `rwah_books?books=${encodeURIComponent(books)}&q=${encodeURIComponent(q)}`
    ),

  getNarratorClassifications: (cat?: string, val?: string) => {
    let path = 'rwah_classification';
    if (cat && val) {
      path += `?cat=${encodeURIComponent(cat)}&val=${encodeURIComponent(val)}`;
    }
    return request<{
      success: boolean;
      tabaqat: string[];
      cities: string[];
      results: Array<{ ID: number; Name: string; DeathYear: string; Tabaqa: string; City: string }>;
    }>(path);
  },

  getCritiqueTerms: (q: string) =>
    request<{ success: boolean; results: CritiqueTerm[] }>(
      `rwah_garh?q=${encodeURIComponent(q)}`
    ),

  getScholarOpinions: (sci: number, q: string) =>
    request<{
      success: boolean;
      scientists: Array<{ ID: number; Name: string }>;
      results: ScholarOpinion[];
    }>(`rwah_opinions?sci=${sci}&q=${encodeURIComponent(q)}`),

  getTransmissionChain: (sanadId: number) =>
    request<{
      success: boolean;
      sanad_id: number;
      narrators: Array<{
        ID: number;
        Name: string;
        AbbName: string;
        Kunia: string;
        Laqab: string;
        Nasab: string;
        Tabaqa: string;
        DeathYear: string;
        MartabaIbnHajar: string;
      }>;
    }>(`sanad?sanad_id=${sanadId}`),

  getCombinedTransmissionChain: (sanadIds: number[]) =>
    request<{
      success: boolean;
      nodes: Array<{
        id: string;
        ID: number;
        Name: string;
        AbbName: string;
        Kunia: string;
        Laqab: string;
        Nasab: string;
        Tabaqa: string;
        DeathYear: string;
        MartabaIbnHajar: string;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
      }>;
    }>('combined_sanad', 'POST', { sanad_ids: sanadIds }),

  getCombinedTakhreejChain: (hadithIds: number[]) =>
    request<{
      success: boolean;
      nodes: Array<{
        id: string;
        ID: number;
        Name: string;
        AbbName: string;
        Kunia: string;
        Laqab: string;
        Nasab: string;
        Tabaqa: string;
        DeathYear: string;
        MartabaIbnHajar: string;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
      }>;
    }>('combined_sanad_takhreej', 'POST', { hadith_ids: hadithIds }),

  getLexiconWord: (wordId: number) =>
    request<{ success: boolean; word_id: number; descrp_id: number; content: string; annotations?: any }>(
      `lexicon?word_id=${wordId}`
    ),

  getHadithCommentary: (id: number) =>
    request<{ success: boolean; commentaries: { id: number; book_name: string; content: string }[] }>(`hadith/commentary?id=${id}`),

  getHadithThematicLinks: (id: number) =>
    request<{ success: boolean; nodes: any[] }>(`hadith/thematic?id=${id}`),

  getHadithAnalysis: (id: number) =>
    request<{ success: boolean; analysis: any[] }>(`hadith/analysis?id=${id}`),

  getHadithOccasions: (id: number) =>
    request<{ success: boolean; occasions: any[] }>(`hadith/occasions?id=${id}`),

  getAtrafList: (books: string, q: string, letter?: string) => {
    let path = `atraf_list?books=${encodeURIComponent(books)}&q=${encodeURIComponent(q)}`;
    if (letter) {
      path += `&letter=${encodeURIComponent(letter)}`;
    }
    return request<{ success: boolean; results: AtrafResult[] }>(path);
  },

  getAtrafAsaned: (books: string, rawy: string, text: string) =>
    request<{ success: boolean; results: AtrafResult[] }>(
      `atraf_asaned?books=${encodeURIComponent(books)}&rawy=${encodeURIComponent(rawy)}&text=${encodeURIComponent(text)}`
    ),

  getAtrafExtra: (src: number, tgt: number) =>
    request<{ success: boolean; results: AtrafExtraResult[] }>(
      `atraf_extra?src=${src}&tgt=${tgt}`
    ),

  getRwahExtra: (books: string, q: string) =>
    request<{ success: boolean; results: NarratorSummary[] }>(
      `rwah_extra?books=${encodeURIComponent(books)}&q=${encodeURIComponent(q)}`
    ),

  getGroupedMtn: (q: string, hadithMainId?: number) => {
    let path = 'grouped_mtn';
    if (hadithMainId !== undefined) {
      path += `?hadith_main_id=${hadithMainId}`;
    } else {
      path += `?q=${encodeURIComponent(q)}`;
    }
    return request<{ success: boolean; results?: GroupedMtnResult[]; group_hadiths?: ServiceText[] }>(path);
  },

  getSubjectTree: (subjectId?: number, parentId?: number, q?: string) => {
    let path = 'subject_tree';
    const params: string[] = [];
    if (subjectId !== undefined) params.push(`subject_id=${subjectId}`);
    if (parentId !== undefined) params.push(`parent_id=${parentId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; nodes?: SubjectTreeNode[]; subjects?: SubjectTreeNode[]; hadiths?: ServiceText[] }>(path);
  },

  getControversial: (nodeId?: number, parentId?: number, q?: string) => {
    let path = 'controversial';
    const params: string[] = [];
    if (nodeId !== undefined) params.push(`node_id=${nodeId}`);
    if (parentId !== undefined) params.push(`parent_id=${parentId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; nodes?: ControversialTreeNode[]; descriptions?: ServiceText[] }>(path);
  },

  getLexiconGhareeb: (itemId?: number, parentId?: number, q?: string) => {
    let path = 'lexicon_ghareeb';
    const params: string[] = [];
    if (itemId !== undefined) params.push(`item_id=${itemId}`);
    if (parentId !== undefined) params.push(`parent_id=${parentId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; items?: LexiconTreeNode[]; descriptions?: ServiceText[] }>(path);
  },

  getLexiconPlaces: (itemId?: number, parentId?: number, q?: string) => {
    let path = 'lexicon_places';
    const params: string[] = [];
    if (itemId !== undefined) params.push(`item_id=${itemId}`);
    if (parentId !== undefined) params.push(`parent_id=${parentId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; items?: LexiconTreeNode[]; descriptions?: ServiceText[] }>(path);
  },

  getAmthal: (q: string) =>
    request<{ success: boolean; results: { ID: number; Text: string }[] }>(
      `amthal?q=${encodeURIComponent(q)}`
    ),

  getDates: (q: string) =>
    request<{ success: boolean; results: { ID: number; Text: string }[] }>(
      `dates?q=${encodeURIComponent(q)}`
    ),

  getDefinitions: (nodeId: number) =>
    request<{ success: boolean; definitions: ScholarDefinition[] }>(
      `definitions?node_id=${nodeId}`
    ),

  getExpressionTree: (parentId?: number, q?: string) => {
    let path = 'expression_tree';
    const params: string[] = [];
    if (parentId !== undefined) params.push(`parent_id=${parentId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; nodes: ExpressionTreeNode[] }>(path);
  },

  getScSayHadith: (hadithMainId?: number, q?: string) => {
    let path = 'sc_say_hadith';
    const params: string[] = [];
    if (hadithMainId !== undefined) params.push(`hadith_main_id=${hadithMainId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; judgments?: HadithJudgmentResult[]; results?: HadithJudgmentResult[] }>(path);
  },

  getScSayScience: (hadithMainId?: number, typeId?: string | number, q?: string) => {
    let path = 'sc_say_science';
    const params: string[] = [];
    if (hadithMainId !== undefined) params.push(`hadith_main_id=${hadithMainId}`);
    if (typeId !== undefined) params.push(`type_id=${typeId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; services?: HadithServiceResult[]; results?: HadithServiceResult[]; types?: { ID: number; Name: string }[] }>(path);
  },

  getIndexVerses: (surahId?: number, verseNum?: number, q?: string) => {
    let path = 'index_verses';
    const params: string[] = [];
    if (surahId !== undefined) params.push(`surah_id=${surahId}`);
    if (verseNum !== undefined) params.push(`verse_num=${verseNum}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; surahs?: SurahIndex[]; verses?: VerseIndex[]; results?: ServiceText[] }>(path);
  },

  getIndexNames: (categoryId?: number, itemId?: number, q?: string) => {
    let path = 'index_names';
    const params: string[] = [];
    if (categoryId !== undefined) params.push(`category_id=${categoryId}`);
    if (itemId !== undefined) params.push(`item_id=${itemId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; subcategories?: IndexCategoryNode[]; items?: IndexItemNode[]; item?: IndexItemNode; hadiths?: ServiceText[]; services?: ServiceText[] }>(path);
  },

  getIndexPoetry: (itemId?: number, q?: string) => {
    let path = 'index_poetry';
    const params: string[] = [];
    if (itemId !== undefined) params.push(`item_id=${itemId}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) path += `?${params.join('&')}`;
    return request<{ success: boolean; results?: IndexItemNode[]; item?: IndexItemNode; hadiths?: ServiceText[]; services?: ServiceText[] }>(path);
  },

  getStatsRwah: () =>
    request<{ success: boolean; total: number; sahaba: number; thiqa: number; doafa: number }>('stats_rwah'),

  getStatsRwahBooks: (book1: number, book2: number) =>
    request<{ success: boolean; overlap: number }>(`stats_rwah_books?book1=${book1}&book2=${book2}`),

  getStatsAtraf: () =>
    request<{ success: boolean; stats: Array<{ BookName: string; Count: number }> }>('stats_atraf'),

  getMosannafatStats: (book1: number, book2: number) =>
    request<{
      success: boolean;
      book1: { id: number; title: string; total: number; additions: number };
      book2: { id: number; title: string; total: number; additions: number };
      agreed: number;
    }>(`stats_mosannafat?book1=${book1}&book2=${book2}`),

  register: (name: string, email: string, password: string, passwordConfirmation: string) =>
    request<{ success: boolean; user: { id: number; name: string; email: string }; token: string }>(
      'register',
      'POST',
      { name, email, password, password_confirmation: passwordConfirmation }
    ),

  login: (email: string, password: string) =>
    request<{ success: boolean; user: { id: number; name: string; email: string }; token: string }>(
      'login',
      'POST',
      { email, password }
    ),

  logout: () =>
    request<{ success: boolean; message: string }>('logout', 'POST'),

  getUser: () =>
    request<{ success: boolean; user: { id: number; name: string; email: string } }>('user'),

  getBookmarks: () =>
    request<{ success: boolean; bookmarks: HadithSummary[] }>('bookmarks'),

  toggleBookmark: (hadithMainId: number) =>
    request<{ success: boolean; bookmarked: boolean; message: string }>('bookmarks/toggle', 'POST', {
      hadith_main_id: hadithMainId,
    })
};


