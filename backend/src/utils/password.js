const bcrypt = require('bcryptjs');
const passwordValidator = require('password-validator');

// Password complexity schema
const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8, 'Password must be at least 8 characters')
  .is().max(128, 'Password must not exceed 128 characters')
  .has().uppercase('Password must contain at least one uppercase letter')
  .has().lowercase('Password must contain at least one lowercase letter')
  .has().digits('Password must contain at least one digit')
  .has().not().spaces('Password must not contain spaces')
  .is().not().oneOf(['Password123', 'password123', '12345678', 'admin123', 'qwerty123']);

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const validatePassword = (password) => {
  const result = passwordSchema.validate(password, { details: true });
  return {
    isValid: result.length === 0,
    errors: result.length > 0 ? result : []
  };
};

const getPasswordRequirements = () => [
  { 
    rule: 'minLength', 
    message: 'At least 8 characters', 
    valid: (p) => p.length >= 8 
  },
  { 
    rule: 'uppercase', 
    message: 'At least one uppercase letter (A-Z)', 
    valid: (p) => /[A-Z]/.test(p) 
  },
  { 
    rule: 'lowercase', 
    message: 'At least one lowercase letter (a-z)', 
    valid: (p) => /[a-z]/.test(p) 
  },
  { 
    rule: 'digits', 
    message: 'At least one digit (0-9)', 
    valid: (p) => /[0-9]/.test(p) 
  },
  { 
    rule: 'noSpaces', 
    message: 'No spaces allowed', 
    valid: (p) => !/\s/.test(p) 
  }
];

const isCommonPassword = (password) => {
  const commonPasswords = [
    'password123', 'password', '12345678', 'qwerty', 'admin123',
    'welcome123', 'letmein123', 'password1', '123456789', '1234567890',
    'iloveyou123', 'sunshine123', 'princess123', 'football123', 'baseball123'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

const verifyPasswordStrength = (password) => {
  const requirements = getPasswordRequirements();
  const score = requirements.reduce((score, req) => {
    return score + (req.valid(password) ? 1 : 0);
  }, 0);
  
  let strength = 'Weak';
  if (score === 5) strength = 'Strong';
  else if (score >= 3) strength = 'Moderate';
  
  return { score, maxScore: 5, strength, requirements };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
  getPasswordRequirements,
  isCommonPassword,
  verifyPasswordStrength
};