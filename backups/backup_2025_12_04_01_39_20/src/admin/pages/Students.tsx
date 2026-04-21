import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { Search, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Student {
  email: string; // Primary key
  username: string;
  name: string;
  email_verified: boolean;
  created_at: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadStudents();
  }, [page, search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStudents(page, 20, search);

      // DEBUG: Check what fields students actually have
      console.log('✅ Students fetched:', data.students.length, 'students');
      if (data.students.length > 0) {
        console.log('📋 First student fields:', Object.keys(data.students[0]));
        console.log('🔍 First student data:', data.students[0]);
      }

      setStudents(data.students);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      logger.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleVerification = async (studentEmail: string, currentStatus: boolean) => {
    try {
      await adminService.updateStudentVerification(studentEmail, !currentStatus);
      loadStudents();
    } catch (error) {
      logger.error('Error updating verification:', error);
      alert('Failed to update verification status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student accounts</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by email, username, or name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVerification(student.email, student.email_verified)}
                        className="flex items-center gap-1"
                      >
                        {student.email_verified ? (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <CheckCircle size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            <XCircle size={14} />
                            Not Verified
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/students/${encodeURIComponent(student.email)}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && students.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-medium">{total}</span> students
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
