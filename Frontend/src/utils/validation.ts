// Gmail validation rules with premium error messages
export const validateGmail = (email: string): { isValid: boolean; error?: string } => {
  // Gmail specific rules
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  
  if (!email) {
    return { isValid: false, error: '📧 Email is required' };
  }
  
  if (!gmailRegex.test(email)) {
    return { isValid: false, error: '🚫 Please use a valid Gmail address' };
  }
  
  // Gmail length restrictions
  const localPart = email.split('@')[0];
  if (localPart.length < 6) {
    return { isValid: false, error: '📏 Gmail username must be at least 6 characters' };
  }
  
  if (localPart.length > 30) {
    return { isValid: false, error: '📏 Gmail username cannot exceed 30 characters' };
  }
  
  // Gmail character restrictions
  if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
    return { isValid: false, error: '❌ Gmail username contains invalid characters' };
  }
  
  // Gmail cannot start or end with special characters
  if (/^[._%+-]|[._%+-]$/.test(localPart)) {
    return { isValid: false, error: '🔠 Gmail username cannot start or end with special characters' };
  }
  
  // Gmail cannot have consecutive dots
  if (/\.{2,}/.test(localPart)) {
    return { isValid: false, error: '🔍 Gmail username cannot have consecutive dots' };
  }
  
  return { isValid: true };
};

// Generic email validation used for login (accepts all domains)
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, error: '📧 Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: '🚫 Please use a valid email address' };
  }

  return { isValid: true };
};
// Password validation rules with enhanced strength detection
export const validatePassword = (password: string): { 
  isValid: boolean; 
  error?: string; 
  strength: 'weak' | 'medium' | 'strong' | 'excellent';
  score: number;
  suggestions: string[];
} => {
  const suggestions: string[] = [];
  
  if (!password) {
    return { 
      isValid: false, 
      error: '🔒 Password is required', 
      strength: 'weak',
      score: 0,
      suggestions: ['Password cannot be empty']
    };
  }
  
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: '📏 Password must be at least 8 characters long', 
      strength: 'weak',
      score: 0,
      suggestions: ['Add more characters to reach at least 8']
    };
  }
  
  if (password.length > 128) {
    return { 
      isValid: false, 
      error: '📏 Password cannot exceed 128 characters', 
      strength: 'weak',
      score: 0,
      suggestions: ['Shorten your password to 128 characters or less']
    };
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', '111111',
    'sunshine', 'iloveyou', 'trustno1', '000000', '123123', 'football'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { 
      isValid: false, 
      error: '⚠️ Password is too common, please choose a stronger one', 
      strength: 'weak',
      score: 0,
      suggestions: ['Avoid common dictionary words', 'Use a unique combination of characters']
    };
  }
  
  // Calculate password strength
  let score = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  
  // Length bonus (max 3 points)
  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Character variety bonus (max 4 points)
  if (hasLowercase) score += 1;
  if (hasUppercase) score += 1;
  if (hasNumbers) score += 1;
  if (hasSymbols) score += 1;
  
  // Bonus for multiple character types
  const characterTypes = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  if (characterTypes >= 3) score += 1;
  
  // Deduct points for patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1; // Repeated characters
    suggestions.push('Avoid repeating the same character multiple times');
  }
  
  if (/123|abc|qwe|asd|zxc|987|654|321/i.test(password)) {
    score -= 1; // Sequential patterns
    suggestions.push('Avoid simple keyboard patterns');
  }
  
  if (password.toLowerCase().includes('password')) {
    score -= 2; // Contains "password"
    suggestions.push('Avoid using the word "password"');
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(score, 10));
  
  let strength: 'weak' | 'medium' | 'strong' | 'excellent';
  if (score >= 8) strength = 'excellent';
  else if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  else strength = 'weak';
  
  // Generate suggestions for improvement
  if (!hasLowercase) suggestions.push('Add lowercase letters');
  if (!hasUppercase) suggestions.push('Add uppercase letters');
  if (!hasNumbers) suggestions.push('Add numbers');
  if (!hasSymbols) suggestions.push('Add special characters (!@#$%^&*)');
  if (password.length < 12) suggestions.push('Make it longer (at least 12 characters)');
  
  if (strength === 'weak' || strength === 'medium') {
    return { 
      isValid: false, 
      error: `🛡️ Password strength: ${strength}. ${suggestions[0] || 'Please strengthen your password'}`, 
      strength,
      score,
      suggestions: suggestions.slice(0, 3) // Return top 3 suggestions
    };
  }
  
  return { 
    isValid: true, 
    strength,
    score,
    suggestions: ['Great password! 🎉']
  };
};

// Username validation with premium suggestions
export const validateUsername = (username: string): { 
  isValid: boolean; 
  error?: string;
  suggestions?: string[];
} => {
  const suggestions: string[] = [];
  
  if (!username) {
    return { 
      isValid: false, 
      error: '👤 Username is required',
      suggestions: ['Choose a unique username']
    };
  }
  
  if (username.length < 3) {
    return { 
      isValid: false, 
      error: '📏 Username must be at least 3 characters long',
      suggestions: ['Add more characters to reach at least 3']
    };
  }
  
  if (username.length > 20) {
    return { 
      isValid: false, 
      error: '📏 Username cannot exceed 20 characters',
      suggestions: ['Shorten your username to 20 characters or less']
    };
  }
  
  // Username can only contain letters, numbers, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { 
      isValid: false, 
      error: '❌ Username can only contain letters, numbers, underscores, and hyphens',
      suggestions: ['Remove any special characters except _ and -']
    };
  }
  
  // Username cannot start or end with special characters
  if (/^[_-]|[_-]$/.test(username)) {
    return { 
      isValid: false, 
      error: '🔠 Username cannot start or end with underscores or hyphens',
      suggestions: ['Start and end with letters or numbers']
    };
  }
  
  // Username cannot have consecutive special characters
  if (/[_-]{2,}/.test(username)) {
    return { 
      isValid: false, 
      error: '🔍 Username cannot have consecutive underscores or hyphens',
      suggestions: ['Use only single underscores or hyphens']
    };
  }
  
  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'system', 'support', 'contact',
    'help', 'info', 'moderator', 'owner', 'official', 'team'
  ];
  
  if (reservedUsernames.includes(username.toLowerCase())) {
    suggestions.push('This username may be reserved, try a different one');
  }
  
  // Suggest improvements
  if (username.length < 5) {
    suggestions.push('Consider a longer username for better uniqueness');
  }
  
  if (!/[a-zA-Z]/.test(username)) {
    suggestions.push('Add some letters to make it more memorable');
  }
  
  return { 
    isValid: true,
    suggestions: suggestions.length > 0 ? suggestions : ['Perfect username! ✨']
  };
};

// Enhanced form validation with premium error handling
export const validateForm = (data: Record<string, any>, rules: Record<string, any>) => {
  const errors: Record<string, string> = {};
  const suggestions: Record<string, string[]> = {};
  const strengths: Record<string, 'weak' | 'medium' | 'strong' | 'excellent'> = {};
  const scores: Record<string, number> = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    if (rule.required && !value) {
      errors[field] = `📋 ${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      return;
    }
    
    if (value && rule.validator) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[field] = result.error || '❌ Invalid value';
      }
      
      // Store additional validation info
      if (result.suggestions) {
        suggestions[field] = result.suggestions;
      }
      if (result.strength) {
        strengths[field] = result.strength;
      }
      if (result.score !== undefined) {
        scores[field] = result.score;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    suggestions,
    strengths,
    scores
  };
};

// Premium validation UI helpers
export const getStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'excellent': return 'text-green-400';
    case 'strong': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'weak': return 'text-red-400';
    default: return 'text-textTertiary';
  }
};

export const getStrengthIcon = (strength: string): string => {
  switch (strength) {
    case 'excellent': return '🛡️✨';
    case 'strong': return '🛡️';
    case 'medium': return '⚠️';
    case 'weak': return '🔴';
    default: return '📋';
  }
};

// Real-time validation debouncer
export const debounceValidation = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};