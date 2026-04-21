import { supabase } from './supabase';

// Map subject names to exam IDs
// This maps database subject names to frontend exam IDs
const SUBJECT_TO_EXAM_MAP: Record<string, string> = {
  // Standard subjects
  'Mathematics': 'exam-1',
  'Physics': 'exam-2',
  'Chemistry': 'exam-3',
  'Biology': 'exam-4',
  'General Knowledge': 'exam-5',
  // DMLT-specific subjects (case-insensitive matching will be done)
  'Anatomy': 'exam-1',
  'Physiology': 'exam-2',
  'Biochemistry': 'exam-3',
  'Microbiology': 'exam-4',
  'Pathology': 'exam-5'
};

/**
 * Maps subject UUIDs to exam IDs
 * This handles the conversion from database UUIDs to frontend exam IDs
 */
export async function mapSubjectUUIDsToExamIds(subjectUUIDs: string[]): Promise<string[]> {
  try {
    console.log('[mapSubjectUUIDsToExamIds] Input UUIDs:', subjectUUIDs);
    
    // If already exam IDs, return as is
    if (subjectUUIDs.every(id => id.startsWith('exam-'))) {
      console.log('[mapSubjectUUIDsToExamIds] Already exam IDs, returning as is');
      return subjectUUIDs;
    }
    
    // Fetch subject names from database
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, name')
      .in('id', subjectUUIDs);
    
    if (error) {
      console.error('[mapSubjectUUIDsToExamIds] Error fetching subjects:', error);
      return subjectUUIDs; // Return original if error
    }
    
    if (!subjects || subjects.length === 0) {
      console.warn('[mapSubjectUUIDsToExamIds] No subjects found');
      return subjectUUIDs;
    }
    
    // Map to exam IDs with case-insensitive matching
    const examIds = subjects.map(subject => {
      // Try exact match first
      let examId = SUBJECT_TO_EXAM_MAP[subject.name];
      
      // If no exact match, try case-insensitive partial match
      if (!examId) {
        const subjectNameLower = subject.name.toLowerCase();
        for (const [key, value] of Object.entries(SUBJECT_TO_EXAM_MAP)) {
          if (subjectNameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(subjectNameLower)) {
            examId = value;
            break;
          }
        }
      }
      
      console.log(`[mapSubjectUUIDsToExamIds] ${subject.name} (${subject.id}) → ${examId || 'UNMAPPED'}`);
      return examId;
    }).filter(Boolean);
    
    console.log('[mapSubjectUUIDsToExamIds] Result:', examIds);
    return examIds;
  } catch (error) {
    console.error('[mapSubjectUUIDsToExamIds] Exception:', error);
    return subjectUUIDs; // Return original if exception
  }
}
