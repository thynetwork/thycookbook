export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (password.length >= 12) {
    score++;
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one lowercase letter');
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one uppercase letter');
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one special character (!@#$%^&*...)');
  }

  // Adjust score to be out of 4
  const finalScore = Math.min(Math.floor((score / 6) * 4), 4);

  return {
    score: finalScore,
    feedback,
    isStrong: finalScore >= 3 && feedback.length === 0,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Weak';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return '#e91e63'; // beet pink (accent-2)
    case 2:
      return '#ff8a00'; // mango orange (accent)
    case 3:
      return '#3f51b5'; // blue plate (accent-3)
    case 4:
      return '#0fb36a'; // fresh herb green (brand)
    default:
      return '#e91e63';
  }
}
