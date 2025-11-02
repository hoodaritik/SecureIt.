// Password validation rules
export const passwordValidation = {
  required: 'Password is required',
  minLength: {
    value: 6,
    message: 'Password must be at least 6 characters long',
  },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
};

// Master password validation (stricter)
export const masterPasswordValidation = {
  required: 'Master password is required',
  minLength: {
    value: 8,
    message: 'Master password must be at least 8 characters long',
  },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    message: 'Master password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
};

// Email validation
export const emailValidation = {
  required: 'Email is required',
  pattern: {
    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    message: 'Please enter a valid email address',
  },
};

// Username validation
export const usernameValidation = {
  required: 'Username is required',
  minLength: {
    value: 3,
    message: 'Username must be at least 3 characters long',
  },
  maxLength: {
    value: 30,
    message: 'Username cannot exceed 30 characters',
  },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: 'Username can only contain letters, numbers, and underscores',
  },
};

// URL validation (optional field)
export const urlValidation = {
  pattern: {
    value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+~#?&//=]*)$/,
    message: 'Please enter a valid URL starting with http:// or https://',
  },
};

// Password entry validation
export const passwordEntryValidation = {
  title: {
    required: 'Title is required',
    maxLength: {
      value: 100,
      message: 'Title cannot exceed 100 characters',
    },
  },
  username: {
    maxLength: {
      value: 100,
      message: 'Username cannot exceed 100 characters',
    },
  },
  password: {
    required: 'Password is required',
  },
  url: urlValidation,
  notes: {
    maxLength: {
      value: 1000,
      message: 'Notes cannot exceed 1000 characters',
    },
  },
  category: {
    maxLength: {
      value: 50,
      message: 'Category cannot exceed 50 characters',
    },
  },
};
