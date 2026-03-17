import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReportData } from '../services/reportService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Reports = () => {
  const { userData } = useAuth();
  const [reportType, setReportType] = useState('personnel');
  const [filters, setFilters] = useState({ branch: '', department: '', unitId: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    const reportData = await fetchReportData(reportType, userData, filters);
    setData(reportData);
    setLoading(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${reportType.toUpperCase()} Report`, 10, 10);
    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map(item => Object.values(item)),
    });
    doc.save(`${reportType}_report.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${reportType}_report.xlsx`);
  };

  const canExport = userData?.role !== 'staff';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reports & Export</h1>
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-col">
          <label className="text-sm font-bold text-stone-600 mb-1">Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="p-2 border rounded">
            <option value="personnel">Personnel</option>
            <option value="units">Units</option>
            <option value="materials">Materials</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-stone-600 mb-1">Branch</label>
          <input placeholder="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})} className="p-2 border rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-stone-600 mb-1">Department</label>
          <input placeholder="Department" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})} className="p-2 border rounded" />
        </div>
        <div className="flex flex-col justify-end">
          <button onClick={generateReport} className="bg-stone-900 text-white p-2 rounded px-6">Generate Report</button>
        </div>
        {canExport && data.length > 0 && (
          <div className="flex flex-col justify-end gap-2 flex-row">
            <button onClick={exportPDF} className="bg-blue-600 text-white p-2 rounded">Export PDF</button>
            <button onClick={exportExcel} className="bg-green-600 text-white p-2 rounded">Export Excel</button>
          </div>
        )}
      </div>
      {loading ? <p>Loading...</p> : (
        <table className="w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="border-b">
              {data.length > 0 && Object.keys(data[0]).map(key => <th key={key} className="p-4 text-left">{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b">
                {Object.values(item).map((val: any, j) => <td key={j} className="p-4">{String(val)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
