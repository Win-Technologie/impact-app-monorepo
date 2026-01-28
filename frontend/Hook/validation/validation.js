/**
 * Valide le nom de l'utilisateur.
 * @param {string} name - Le nom à valider.
 * @returns {string} Renvoie un message d'erreur si le nom est invalide, sinon une chaîne vide.
 */

//on veut une fonction qui vérifie toutes les rules
//en fonction d'une rule on a une condition

export const validateName = (name) => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  const chars = name.length;
  if (chars === 0) {
    return "Le nom est requis";
  }
  if (chars < 3) {
    return "Votre nom doit avoir au moins 3 characteres";
  }
  if (!nameRegex.test(name)) {
    return "Votre nom doit contenir des lettres";
  }
  return "";
};

/**
 * Valide le numéro de téléphone de l'utilisateur.
 * @param {string} phone - Le numéro de téléphone à valider.
 * @returns {string} Renvoie un message d'erreur si le numéro de téléphone est invalide, sinon une chaîne vide.
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return "Le format n'est pas valide 5149951234";
  }
  return "";
};

/**
 * Valide l'adresse de l'utilisateur.
 * @param {string} address - L'adresse à valider.
 * @returns {string} Renvoie un message d'erreur si l'adresse est invalide, sinon une chaîne vide.
 */
export const validateAddress = (address) => {
  const chars = address.length;
  if (chars === 0) {
    return "L'adresse est requis";
  }
  if (chars < 3) {
    return "Votre adresse doit avoir au moins 3 characteres";
  }
  return "";
};
/**
 * Valider description.
 * @param {string} description - La description à valider.
 * @returns {string} Renvoie un message d'erreur si la description est invalide, sinon une chaîne vide.
 */
export const validateDescription = (description) => {
  const chars = description.length;
  if (chars === 0) {
    return "La description est requis";
  }
  if (chars < 4) {
    return "Votre description doit avoir au moins 4 characteres";
  }
  return "";
};
/**
 * Valide le nom de l'entreprise de l'utilisateur.
 * @param {string} organization - L'adresse à valider.
 * @returns {string} Renvoie un message d'erreur si le nom de l'entreprise est invalide, sinon une chaîne vide.
 */
export const validateOrganization = (organization) => {
  const chars = organization.length;
  if (chars === 0) {
    return "Le nom de votre entreprise est requis";
  }
  if (chars < 3) {
    return "Le nom de votre entreprise doit avoir au moins 3 characteres";
  }
  return "";
};

/**
 * Valide une adresse email.
 * Vérifie si l'email est non-vide et suit un format standard (utilisant une expression régulière).
 * @param {*} email  L'adresse email à valider.
 * @returns {string} Message d'erreur si l'email est invalide, sinon chaîne vide.
 */
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const chars = email.length;
  if (chars === 0) {
    return "Le courriel est requis";
  }

  if (!emailRegex.test(email)) {
    return "Le courriel n'est pas valide";
  }
  return "";
};

/**
 * Valide un mot de passe selon des critères spécifiques.
 * @param {*} password  le mot de passe à valider
 * @returns {string} Message d'erreur spécifique si le mot de passe est invalide, sinon chaîne vide.
 */
export const validatePassword = (password) => {
  const validateLowerCase = /[a-z]/;
  const validateUpperCase = /[A-Z]/;
  const validateNumber = /\d/;
  const validateSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  const requiredChars = 8;

  if (password.length < requiredChars) {
    return "Au moins 8 caractères";
  }
  if (!validateLowerCase.test(password)) {
    return "Une lettre minuscule est requise ";
  }
  if (!validateUpperCase.test(password)) {
    return "Une lettre majuscule est requise ";
  }
  if (!validateNumber.test(password)) {
    return "Au moins une chiffre est requise ";
  }
  if (!validateSpecialChar.test(password)) {
    return "Caractère spécial est requise ";
  }
  return "";
};

/**
 * Vérifie si deux mots de passe sont identiques.
 * @param {*} password Le mot de passe principal à vérifier.
 * @param {*} confirmPassword Le mot de passe de confirmation à comparer.
 * @returns {string} Message d'erreur si les mots de passe ne correspondent pas, sinon chaîne vide.
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Les mots de passe ne correspondent pas";
  }
  return "";
};

/**
 * Vérifie si un champ de saisie est vide.
 * @param {*} input  Le contenu du champ de saisie à vérifier.
 * @returns {string} Message d'erreur si le champ est vide, sinon une chaîne vide.
 */
export const inputEmpty = (input) => {
  if (input.length === 0) {
    return "Le champs est requis";
  }
  return "";
};

/**
 * Vérifie si une valeur d'entrée est indéfinie.
 * @param {*} input La valeur d'entrée à vérifier.
 * @returns Message d'erreur si l'entrée est indéfinie, sinon une chaîne vide.
 */
export const inputUndefined = (input) => {
  if (input === undefined || input.length === 0) {
    return "Le rôle est requis";
  }

  return "";
};
