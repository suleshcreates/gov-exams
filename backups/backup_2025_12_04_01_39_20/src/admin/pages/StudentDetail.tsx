import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  User,
  CreditCard,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface Student {
  id: string;
  email: string;
  username: string;
  name: string;
  email_verified: boolean;
  is_verified: boolean;
  phone?: string;
  created_at: string;
  auth_user_id?: string;
}

interface UserPlan {
  id: string;
  plan_name: string;
  price_paid: number;
  exam_access: string[];
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface ExamResult {
  id: string;
  exam_title: string;
  exam_id: string;
  set_number: number;
  score: number;
  total_questions: number;
  accuracy: number;
  time_taken: number;
  created_at: string;
}

interface Analytics {
  totalExams: number;
  averageScore: number;
  passRate: number;
}

const StudentDetail = () => {
  const { email: encodedEmail } = useParams<{ email: string }>();
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : '';

  const [student, setStudent] = useState<Student | null>(null);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' }); // Email cannot be edited
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (email) {
      loadStudentData();
    }
  }, [email]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading data for email:', email);

      // First get student data
      const studentData = await adminService.getStudentById(email);
      console.log('✅ Student data:', studentData);

      // Then use student name to fetch related data
      const [plansData, historyData, analyticsData] = await Promise.all([
        adminService.getStudentPlans(studentData.name),
        adminService.getStudentExamHistory(studentData.name),
        adminService.getStudentAnalytics(studentData.name),
      ]);

      console.log('📋 Plans data:', plansData);
      console.log('📊 History data:', historyData);
      console.log('📈 Analytics data:', analyticsData);

      setStudent(studentData);
      setEditForm({
        name: studentData.name,
        phone: studentData.phone || ''
      });
      setPlans(plansData);
      setExamHistory(historyData);
      setAnalytics(analyticsData);
    } catch (error) {
      logger.error('Error loading student data:', error);
      console.error('❌ Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (student) {
      setEditForm({
        name: student.name,
        phone: student.phone || ''
      });
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!student) return;

    // Validation
    if (!editForm.name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setSaving(true);
      const updates: { name?: string; phone?: string } = {};
      if (editForm.name !== student.name) updates.name = editForm.name;
      if (editForm.phone !== student.phone) updates.phone = editForm.phone;

      if (Object.keys(updates).length > 0) {
        const updatedStudent = await adminService.updateStudentInfo(student.email, updates);
        setStudent(updatedStudent);
      }
      setIsEditing(false);
    } catch (error) {
      logger.error('Error updating student:', error);
      alert('Failed to update student information');
    } finally {
      setSaving(false);
    }
  };

  const toggleVerification = async () => {
    if (!student) return;

    try {
      await adminService.updateStudentVerification(student.id, !student.email_verified);
      setStudent({ ...student, email_verified: !student.email_verified, is_verified: !student.is_verified });
    } catch (error) {
      logger.error('Error updating verification:', error);
      alert('Failed to update verification status');
    }
  };

  const deactivatePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to deactivate this plan?')) return;

    try {
      await adminService.deactivateUserPlan(planId);
      loadStudentData();
    } catch (error) {
      logger.error('Error deactivating plan:', error);
      alert('Failed to deactivate plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Link to="/admin/students" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/students"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600 mt-1">Student Details</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Student Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Edit Info
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="text-gray-400 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Email (Primary Key)</p>
              <p className="font-medium">{student.email}</p>
              {isEditing && (
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="text-gray-400 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Full Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              ) : (
                <p className="font-medium">{student.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="text-gray-400 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-400">{student.username}</p>
              <p className="text-xs text-gray-400">Read-only</p>
            </div>
          </div>

          {(student.phone || isEditing) && (
            <div className="flex items-start gap-3">
              <User className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                ) : (
                  <p className="font-medium">{student.phone}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Registration Date</p>
              <p className="font-medium">{new Date(student.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {student.email_verified ? (
              <CheckCircle className="text-green-500 mt-1" size={20} />
            ) : (
              <XCircle className="text-red-500 mt-1" size={20} />
            )}
            <div>
              <p className="text-sm text-gray-500">Verification Status</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {student.email_verified ? 'Verified' : 'Not Verified'}
                </p>
                <button
                  onClick={toggleVerification}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>

          {student.auth_user_id && (
            <div className="flex items-start gap-3">
              <User className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Auth User ID</p>
                <p className="font-mono text-xs">{student.auth_user_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Exams Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalExams}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.min(analytics.totalExams * 10, 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(analytics.totalExams * 10, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {analytics.totalExams >= 10 ? 'Excellent activity!' : `${10 - analytics.totalExams} more to milestone`}
              </p>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageScore}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Performance</span>
                <span className={`font-semibold ${analytics.averageScore >= 85 ? 'text-green-600' :
                  analytics.averageScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {analytics.averageScore >= 85 ? 'Excellent' :
                    analytics.averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${analytics.averageScore >= 85 ? 'bg-green-600' :
                    analytics.averageScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  style={{ width: `${analytics.averageScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Target: 85% for pass grade
              </p>
            </div>
          </div>

          {/* Pass Rate Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="text-purple-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Pass Rate (85%+)</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.passRate}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Success Rate</span>
                <span>{analytics.passRate >= 70 ? '🎯' : analytics.passRate >= 50 ? '👍' : '📈'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${analytics.passRate >= 70 ? 'bg-purple-600' :
                    analytics.passRate >= 50 ? 'bg-purple-400' :
                      'bg-purple-300'
                    }`}
                  style={{ width: `${analytics.passRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((analytics.totalExams * analytics.passRate) / 100)} exams passed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Plans */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard size={20} />
            Active Plans
          </h2>
        </div>
        <div className="p-6">
          {plans.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No plans found</p>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const isExpired = plan.expires_at && new Date(plan.expires_at) < new Date();
                const isActive = plan.is_active && !isExpired;

                return (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{plan.plan_name}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Price: ₹{plan.price_paid}</p>
                          <p>Purchased: {new Date(plan.purchased_at).toLocaleDateString()}</p>
                          {plan.expires_at && (
                            <p>Expires: {new Date(plan.expires_at).toLocaleDateString()}</p>
                          )}
                          <div>
                            <p className="font-medium mt-2">Exam Access:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.exam_access.map((exam, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {exam}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <button
                          onClick={() => deactivatePlan(plan.id)}
                          className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exam History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Exam History</h2>
        </div>
        <div className="overflow-x-auto">
          {examHistory.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg font-medium">No exam history found</p>
              <p className="text-gray-400 text-sm mt-1">Results will appear here once the student takes an exam</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Set
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examHistory.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{result.exam_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                          Set {result.set_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {result.score} / {result.total_questions}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((result.score / result.total_questions) * 100).toFixed(0)}% correct
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${result.accuracy >= 85
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : result.accuracy >= 60
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                              }`}
                          >
                            {result.accuracy >= 85 ? '✓' : result.accuracy >= 60 ? '○' : '✗'} {result.accuracy}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{Math.floor(result.time_taken / 60)}m</span>
                          <span className="text-gray-400">{result.time_taken % 60}s</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total: <span className="font-semibold text-gray-900">{examHistory.length}</span> exams</span>
                  <span className="text-gray-600">Latest: <span className="font-semibold text-gray-900">{new Date(examHistory[0]?.created_at).toLocaleDateString()}</span></span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
