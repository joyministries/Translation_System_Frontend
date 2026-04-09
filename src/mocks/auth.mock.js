// Mock login responses for testing
export const mockAuthResponses = {
  admin: {
    token: 'mock_admin_token_12345',
    user: {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      institution: 'Daystar University',
    },
  },
  student: {
    token: 'mock_student_token_67890',
    user: {
      id: 2,
      email: 'student@example.com',
      name: 'Student User',
      role: 'student',
      institution: 'Daystar University',
    },
  },
};

// Mock delay function
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
