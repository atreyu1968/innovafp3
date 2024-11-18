import React from 'react';
import { FileText, Calendar, Download } from 'lucide-react';
import { Report } from '../../types/report';

interface ReportListProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  onExport: (report: Report) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onReportClick, onExport }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {reports.map((report) => (
          <li key={report.id}>
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <button
                onClick={() => onReportClick(report)}
                className="flex-1 text-left hover:bg-gray-50 rounded-md p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <p className="ml-3 text-sm font-medium text-gray-900">
                      {report.title}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.isPublic ? 'Público' : 'Privado'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {report.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>
                      Actualizado: {new Date(report.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => onExport(report)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-500"
                title="Exportar informe"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;