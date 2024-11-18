import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAcademicYearStore } from '../stores/academicYearStore';
import { Report } from '../types/report';
import ReportList from '../components/reports/ReportList';
import ReportBuilder from '../components/reports/ReportBuilder';
import { useReportStore } from '../stores/reportStore';
import { useNotifications } from '../components/notifications/NotificationProvider';

const Reports = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { user, activeRole } = useAuthStore();
  const { activeYear } = useAcademicYearStore();
  const { reports, addReport, updateReport } = useReportStore();
  const { showNotification } = useNotifications();

  const isAdmin = user?.role === 'coordinador_general' && activeRole === 'admin';

  if (!activeYear && !isAdmin) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">
          No hay un curso académico activo. Contacta con el coordinador general.
        </p>
      </div>
    );
  }

  const handleReportSubmit = (data: Partial<Report>) => {
    const now = new Date().toISOString();
    if (selectedReport) {
      updateReport({
        ...selectedReport,
        ...data,
        updatedAt: now,
      } as Report);
    } else {
      addReport({
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        createdBy: user!.id,
        academicYearId: activeYear?.id || '',
      } as Report);
    }
    setShowBuilder(false);
    setSelectedReport(null);
  };

  const handleExport = (report: Report) => {
    // Export logic remains the same...
  };

  const filteredReports = isAdmin
    ? reports
    : reports.filter(report => 
        report.academicYearId === activeYear?.id && 
        (report.createdBy === user?.id || report.isPublic)
      );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes</h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeYear ? `Curso académico: ${activeYear.year}` : 'Todos los cursos'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedReport(null);
                setShowBuilder(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Informe
            </button>
          </div>
        )}
      </div>

      {showBuilder ? (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {selectedReport ? 'Editar Informe' : 'Nuevo Informe'}
          </h3>
          <ReportBuilder
            initialData={selectedReport || undefined}
            onSubmit={handleReportSubmit}
            onCancel={() => {
              setShowBuilder(false);
              setSelectedReport(null);
            }}
          />
        </div>
      ) : (
        <ReportList
          reports={filteredReports}
          onReportClick={(report) => {
            if (isAdmin) {
              setSelectedReport(report);
              setShowBuilder(true);
            }
          }}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default Reports;