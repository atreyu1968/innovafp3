import { create } from 'zustand';
import { Report, ReportVisualization } from '../types/report';
import { useFormStore } from './formStore';

interface ReportState {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (report: Report) => void;
  deleteReport: (reportId: string) => void;
  getReportData: (visualization: ReportVisualization) => any[];
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report],
    })),

  updateReport: (updatedReport) =>
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      ),
    })),

  deleteReport: (reportId) =>
    set((state) => ({
      reports: state.reports.filter((report) => report.id !== reportId),
    })),

  getReportData: (visualization) => {
    const formStore = useFormStore.getState();
    const responses = visualization.formIds.flatMap((formId) =>
      formStore.getResponsesByForm(formId)
    );

    // Aplicar filtros
    let filteredData = responses.filter((response) => {
      return visualization.filters.every((filter) => {
        const value = response.responses[filter.fieldId];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return value.includes(filter.value);
          case 'greater':
            return value > filter.value;
          case 'less':
            return value < filter.value;
          case 'between':
            return value >= filter.value[0] && value <= filter.value[1];
          default:
            return true;
        }
      });
    });

    // Agrupar datos si es necesario
    if (visualization.groupBy?.length) {
      const grouped = new Map();
      filteredData.forEach((response) => {
        const key = visualization.groupBy!.map(
          (field) => response.responses[field]
        ).join('-');
        
        const existing = grouped.get(key) || {
          count: 0,
          ...visualization.groupBy!.reduce((acc, field) => ({
            ...acc,
            [field]: response.responses[field],
          }), {}),
        };

        existing.count++;
        visualization.selectedFields.forEach((field) => {
          if (!visualization.groupBy!.includes(field)) {
            const value = response.responses[field];
            if (typeof value === 'number') {
              existing[field] = (existing[field] || 0) + value;
            }
          }
        });

        grouped.set(key, existing);
      });

      filteredData = Array.from(grouped.values());
    }

    // Ordenar datos
    if (visualization.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a.responses?.[visualization.sortBy!.field] ?? a[visualization.sortBy!.field];
        const bValue = b.responses?.[visualization.sortBy!.field] ?? b[visualization.sortBy!.field];
        return visualization.sortBy!.order === 'asc'
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }

    return filteredData;
  },
}));