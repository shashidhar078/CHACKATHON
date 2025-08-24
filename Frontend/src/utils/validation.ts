// Gmail validation rules
export const validateGmail = (email: string): { isValid: boolean; error?: string } => {
  // Gmail specific rules
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!gmailRegex.test(email)) {
    return { isValid: false, error: 'Please use a valid Gmail address' };
  }
  
  // Gmail length restrictions
  const localPart = email.split('@')[0];
  if (localPart.length < 6) {
    return { isValid: false, error: 'Gmail username must be at least 6 characters' };
  }
  
  if (localPart.length > 30) {
    return { isValid: false, error: 'Gmail username cannot exceed 30 characters' };
  }
  
  // Gmail character restrictions
  if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
    return { isValid: false, error: 'Gmail username contains invalid characters' };
  }
  
  // Gmail cannot start or end with special characters
  if (/^[._%+-]|[._%+-]$/.test(localPart)) {
    return { isValid: false, error: 'Gmail username cannot start or end with special characters' };
  }
  
  // Gmail cannot have consecutive dots
  if (/\.{2,}/.test(localPart)) {
    return { isValid: false, error: 'Gmail username cannot have consecutive dots' };
  }
  
  return { isValid: true };
};

// Password validation rules
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password cannot exceed 128 characters', strength: 'weak' };
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password is too common, please choose a stronger one', strength: 'weak' };
  }
  
  // Calculate password strength
  let score = 0;
  
  // Length bonus
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Deduct points for patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns
  
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 4) strength = 'strong';
  else if (score >= 2) strength = 'medium';
  else strength = 'weak';
  
  if (strength === 'weak') {
    return { 
      isValid: false, 
      error: 'Password is too weak. Include uppercase, lowercase, numbers, and symbols', 
      strength 
    };
  }
  
  return { isValid: true, strength };
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username cannot exceed 30 characters' };
  }
  
  // Username can only contain letters, numbers, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  // Username cannot start or end with special characters
  if (/^[_-]|[_-]$/.test(username)) {
    return { isValid: false, error: 'Username cannot start or end with underscores or hyphens' };
  }
  
  // Username cannot have consecutive special characters
  if (/[_-]{2,}/.test(username)) {
    return { isValid: false, error: 'Username cannot have consecutive underscores or hyphens' };
  }
  
  return { isValid: true };
};

// Form validation
export const validateForm = (data: Record<string, any>, rules: Record<string, any>) => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    if (rule.required && !value) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      return;
    }
    
    if (value && rule.validator) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[field] = result.error || 'Invalid value';
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
