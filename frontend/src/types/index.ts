export interface User {
  _id: string;
  email?: string;
  name: string;
  avatar?: string;
  auth_provider?: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  _id: string;
  user_id: string;
  title: string;
  topic: string;
  description?: string;
  status: "creating" | "ready" | "error";
  statistics: WorkspaceStatistics;
  graph_ids: string[];
  timeline_id?: string;
  literature_review_id?: string;
  roadmap_id?: string;
  research_gap_id?: string;
  last_sync?: string;
  search_history: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceStatistics {
  papers: number;
  authors: number;
  datasets: number;
  methods: number;
  citations: number;
}

export interface Paper {
  _id: string;
  workspace_id: string;
  title: string;
  abstract: string;
  summary?: string;
  year: number;
  venue?: string;
  doi?: string;
  pdf_url?: string;
  paper_url?: string;
  citation_count: number;
  keywords: string[];
  methods: string[];
  datasets: string[];
  authors: AuthorBrief[];
  references: string[];
  citations: string[];
  related_papers: string[];
  implementation_links: string[];
  paper_source: string;
  embedding_id?: string;
  created_at: string;
}

export interface AuthorBrief {
  name: string;
  id?: string;
  institution?: string;
}

export interface Author {
  _id: string;
  name: string;
  institution?: string;
  country?: string;
  orcid?: string;
  h_index: number;
  citation_count: number;
  paper_count: number;
  topics: string[];
  papers: string[];
  coauthors: { name: string; id?: string; paper_count: number }[];
  created_at: string;
}

export interface Dataset {
  _id: string;
  name: string;
  description?: string;
  task?: string;
  classes?: number;
  size?: string;
  license?: string;
  homepage?: string;
  papers: string[];
  benchmarks: string[];
  leaderboards: LeaderboardEntry[];
  evaluation_metrics: string[];
}

export interface LeaderboardEntry {
  model: string;
  metric: string;
  value: number;
  paper_id?: string;
  year?: number;
}

export interface Method {
  _id: string;
  name: string;
  category: string;
  description: string;
  papers: string[];
  related_methods: string[];
  datasets: string[];
  architectures: string[];
}

export interface Session {
  _id: string;
  workspace_id: string;
  session_number: number;
  created_at: string;
  papers_read: number;
  new_papers: string[];
  generated_reviews: string[];
  notes: string[];
  queries: string[];
  roadmap_version?: number;
}

export interface Note {
  _id: string;
  workspace_id: string;
  paper_id?: string;
  title: string;
  markdown: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  _id: string;
  user_id: string;
  entity_type: "paper" | "author" | "dataset" | "method" | "concept";
  entity_id: string;
  created_at: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "paper" | "author" | "dataset" | "method" | "concept" | "topic" | "institution";
  size?: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  type: "cites" | "uses" | "improves" | "compares" | "written_by" | "introduced" | "related";
  weight?: number;
}

export interface TimelineEvent {
  year: number;
  type: "paper" | "dataset" | "method" | "breakthrough" | "benchmark";
  title: string;
  description: string;
  paper_id?: string;
}

export interface LiteratureReview {
  _id: string;
  workspace_id: string;
  sections: ReviewSection[];
  created_at: string;
  updated_at: string;
}

export interface ReviewSection {
  title: string;
  content: string;
  citations: string[];
}

export interface Roadmap {
  _id: string;
  workspace_id: string;
  steps: RoadmapStep[];
  created_at: string;
}

export interface RoadmapStep {
  day: number;
  title: string;
  description: string;
  papers: string[];
  type: "survey" | "foundational" | "implementation" | "sota" | "project";
}

export interface Concept {
  _id: string;
  name: string;
  description: string;
  category: string;
  papers: string[];
  related_concepts: string[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: string[];
  confidence?: number;
  evidence_chain?: EvidenceChain[];
}

export interface EvidenceChain {
  claim: string;
  supporting_papers: string[];
  confidence: number;
}

export interface ResearchDNA {
  field_maturity: number;
  innovation_speed: number;
  research_saturation: number;
  dataset_diversity: number;
  benchmark_stability: number;
  industry_adoption: number;
  academic_interest: number;
  commercial_interest: number;
  research_momentum: number;
  open_opportunity_score: number;
  dominant_methods: string[];
  emerging_methods: string[];
  declining_methods: string[];
  top_authors: string[];
  top_institutions: string[];
  top_conferences: string[];
  key_datasets: string[];
  key_challenges: string[];
}

export interface AnalyticsData {
  total_papers: number;
  total_authors: number;
  total_institutions: number;
  total_datasets: number;
  total_methods: number;
  total_citations: number;
  average_citations: number;
  current_sota?: string;
  publication_trend: { year: number; count: number }[];
  citation_growth: { year: number; citations: number }[];
  method_popularity: { name: string; count: number }[];
  dataset_popularity: { name: string; count: number }[];
  venue_distribution: { name: string; count: number }[];
  institution_distribution: { name: string; count: number }[];
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}
