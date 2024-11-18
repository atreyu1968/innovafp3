export type ChartType = 'bar' | 'line' | 'pie' | 'table';

export interface ReportFilter {
  fieldId: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface ReportVisualization {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  formIds: string[];
  selectedFields: string[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface Report {
  id: string;
  title: string;
  description: string;
  visualizations: ReportVisualization[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  academicYearId: string;
  isPublic: boolean;
}