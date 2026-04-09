// Mock student books and languages data
export const mockStudentBooks = {
  books: [
    {
      id: 1,
      title: 'Mathematics Grade 9',
      subject: 'Mathematics',
      gradeLevel: '9',
      extractionStatus: 'done',
      description: 'Comprehensive mathematics textbook for grade 9 students',
    },
    {
      id: 2,
      title: 'English Literature',
      subject: 'English',
      gradeLevel: '10',
      extractionStatus: 'done',
      description: 'Classic and contemporary English literature texts',
    },
    {
      id: 3,
      title: 'Biology Fundamentals',
      subject: 'Science',
      gradeLevel: '9',
      extractionStatus: 'pending',
      description: 'Introduction to biology and life sciences',
    },
    {
      id: 4,
      title: 'History of Africa',
      subject: 'History',
      gradeLevel: '11',
      extractionStatus: 'done',
      description: 'Comprehensive history of African civilizations',
    },
    {
      id: 5,
      title: 'Chemistry Basics',
      subject: 'Science',
      gradeLevel: '10',
      extractionStatus: 'done',
      description: 'Fundamental chemistry concepts and reactions',
    },
    {
      id: 6,
      title: 'Geography World',
      subject: 'Geography',
      gradeLevel: '9',
      extractionStatus: 'done',
      description: 'World geography and physical features',
    },
  ],
  total: 6,
};

export const mockStudentLanguages = [
  { id: 1, name: 'Swahili', code: 'sw', active: true },
  { id: 2, name: 'French', code: 'fr', active: true },
  { id: 3, name: 'Spanish', code: 'es', active: true },
  { id: 4, name: 'Portuguese', code: 'pt', active: true },
  { id: 5, name: 'Arabic', code: 'ar', active: true },
  { id: 6, name: 'Amharic', code: 'am', active: true },
  { id: 7, name: 'Yoruba', code: 'yo', active: false },
  { id: 8, name: 'Igbo', code: 'ig', active: true },
];

// Mock delay function
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
