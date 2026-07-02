export interface Book {
  ID: number;
  Title: string;
  Summary: string;
  AuthorID: number;
  AuthorName: string;
  AuthorDeath: number;
  category: string;
  type: 'hadith' | 'service';
}

export interface TocNode {
  MainID: number;
  ParentID: number | null;
  IsLeaf: boolean;
  Title: string;
  children?: TocNode[];
}

export interface BaseHadithData {
  MainID?: number;
  ID?: number;
  BookName?: string;
  HadithNum?: number | string;
  PartNum?: number;
  PageNum?: number;
  CleanContent: string;
  Annotations?: Annotation[] | string | null;
  Title?: string;
  ServiceFlags?: number;
}

export interface Annotation {
  type: string;
  start: number;
  length: number;
  linkId: number | null;
  parentIndex: number | null;
  attrs: Record<string, string> | null;
}

export interface HadithSummary {
  MainID: number;
  BookID: number;
  BookName: string;
  HadithNum: number;
  CleanContent: string;
  Annotations: Annotation[];
  PartNum: number;
  PageNum: number;
  ParentID?: number | null;
  ServiceFlags?: number;
}

export interface Breadcrumb {
  MainID: number;
  Title: string;
}

export interface HadithJudgment {
  Say: string;
  ScientistName: string;
}

export interface Chain {
  SanadID: number;
  SanadType: string;
  SanadTahdethID: number;
  SandRwah: string;
  HadithsCount: number;
}

export interface HadithDetail {
  MainID: number;
  BookID: number;
  BookName: string;
  HadithNum: number;
  CleanContent: string;
  Annotations: Annotation[];
  ParentID: number | null;
  PartNum: number;
  PageNum: number;
  TarqeemHarf: string;
}

export interface TakhreejItem {
  HadithMainID: number;
  BookID: number;
  BookName: string;
  HadithNum: number;
  Tarf: string;
  PartNum: number;
  PageNum: number;
}

export interface ShawahedComparison {
  SlaveMatnID: number;
  Comment: string;
  MatchSort: number;
  BookID: number;
  BookName: string;
  HadithNum: number;
  Tarf: string;
}

export interface ShawahedData {
  has_shawahed: boolean;
  comparisons: ShawahedComparison[];
}

export interface ShawahedItem {
  book_id: number;
  book_name: string;
  companion_name: string | null;
  part: number;
  page: number;
  tarqeem: string;
}

export interface ServiceBookItem {
  book_name: string;
  part: number;
  page: number;
  service_id: number;
}

export interface ScholarlySegment {
  type: 'text' | 'variant';
  text: string;
  id?: number;
  leadSpace?: string;
  trailSpace?: string;
  sources?: string;
}

export interface CombinedMatn {
  id: number;
  clean_matn: string;
  matn_annotations: Annotation[];
  asaned_comp: string;
  scholarly_matn: string;
  scholarly_sources: string;
  scholarly_segments: ScholarlySegment[];
}

export interface HadithDetailResponse {
  success: boolean;
  hadith: HadithDetail;
  breadcrumbs: Breadcrumb[];
  judgments: HadithJudgment[];
  chains: Chain[];
  takhreej: TakhreejItem[];
  shawahed: ShawahedData;
  combined_matn: CombinedMatn | null;
}

export interface NarratorSummary {
  ID: number;
  Name: string;
  AbbName: string;
  Kunia: string;
  Laqab: string;
  Tabaqa: string;
  DeathYear: string;
  HadithsCount: number;
  sheikhs?: string;
  talamidh?: string;
}

export interface NarratorDetail {
  ID: number;
  Name: string;
  AbbName: string;
  Kunia: string;
  Laqab: string;
  Nasab: string;
  Tabaqa: string;
  TabaqaNum: number;
  BirthYear: string;
  DeathYear: string;
  DeathYearNum: number;
  MartabaIbnHajar: string;
  MartabaZahabi: string;
  LivingCity: string;
  DeathCity: string;
  EsmShuhra: string;
  HadithsCount: number;
}

export interface NarratorDetailResponse {
  success: boolean;
  narrator: NarratorDetail;
  sheikhs: { ID: number; Name: string }[];
  talamidh: { ID: number; Name: string }[];
}

export interface CritiqueTerm {
  ID: number;
  Term: string;
  RwahCount: number;
}

export interface ScholarOpinion {
  RawyID: number;
  RawyName: string;
  Say: string;
  SaySort: number;
}

export interface AtrafResult {
  MainID: number;
  Text: string;
  BookName: string;
  HadithNum: number;
  PartNum: number;
  PageNum: number;
}

export interface AtrafExtraResult {
  MainID: number;
  Title: string;
  SrcCleanContent: string;
  SrcAnnotations: Annotation[] | null;
  TgtCleanContent: string;
  TgtAnnotations: Annotation[] | null;
}

export interface GroupedMtnResult {
  ID: number;
  HadithMainID: number;
  CleanMatn: string;
  MatnAnnotations: Annotation[] | null;
  AsanedComp: string;
  BookName: string;
  HadithNum: number;
}

export interface ThematicPathNode {
  ID: number;
  Title: string;
}

export interface HadithThematicLink {
  ID: number;
  Text: string;
  path: ThematicPathNode[];
}

export interface SubjectTreeNode {
  ID: number;
  SubjectTitle: string;
  ParentID: number;
  IsLeaf: boolean;
  NodeID: number;
  IsColored: boolean;
}

export interface ControversialTreeNode {
  ID: number;
  Text: string;
  ParentID: number;
  IsLeaf: boolean;
  NodeID: number;
  IsColored: boolean;
}

export interface LexiconTreeNode {
  ID: number;
  Text: string;
  LexiconID: number;
  ParentID: number;
  IsLeaf: boolean;
  LinkID: number;
  ResultsCount: number;
}

export interface ServiceText {
  MainID: number;
  BookName: string;
  HadithNum: number;
  PartNum: number;
  PageNum: number;
  Title: string;
  CleanContent: string;
  Annotations: Annotation[] | null;
  ServiceFlags?: number;
}

export interface ScholarDefinition {
  Say: string;
  ScholarName: string;
  BookName?: string;
  HadithNum?: number;
  PartNum?: number;
  PageNum?: number;
  ServiceMainID?: number;
}

export interface ExpressionTreeNode {
  ID: number;
  Text: string;
  ParentID: number;
  IsLeaf: boolean;
  NodeID: number;
}

export interface HadithJudgmentResult {
  MainID: number;
  BookName: string;
  HadithNum: number;
  Title: string;
  ScholarName: string;
  JudgmentText: string;
}

export interface HadithServiceResult {
  MainID: number;
  BookName: string;
  HadithNum: number;
  Title: string;
  ServiceTypeName: string;
}

export interface SurahIndex {
  ID: number;
  Name: string;
  HasTafsser: boolean;
  HasQera: boolean;
}

export interface VerseIndex {
  ID: number;
  SoraID: number;
  AyaNum: number;
  Text: string;
  SurahName?: string;
}

export interface IndexCategoryNode {
  ID: number;
  Title: string;
  ParentID: number;
  IsLeaf: boolean;
  Tag?: string;
}

export interface IndexItemNode {
  ID: number;
  Title: string;
  IndexID: number;
}

export type HadithServiceType = 'judgments' | 'chains' | 'sanad' | 'takhreeg' | 'combined' | 'commentary' | 'thematic' | 'analysis' | 'occasions' | 'compound';


