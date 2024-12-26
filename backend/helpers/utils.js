

export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (Array.isArray(email)) {
    return email.every(validateEmail);
  } else {
    return regex.test(email);
  }
};
