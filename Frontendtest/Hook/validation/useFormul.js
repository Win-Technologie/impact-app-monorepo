import { useState, useEffect, useCallback, useReducer } from 'react';

function formulReducer(state, action) {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.validationErrors,
        },
      };
    case 'UPDATE_SINGLE_ERROR':
      const { key } = action.payload;
      const { [key]: _, ...newErrors } = state.errors;

      return {
        ...state,
        errors: newErrors,
      };
    case 'UPDATE_VALUES':
      return {
        ...state,
        values: { ...state.values, [action.payload.key]: action.payload.value },
      };
    case 'UPDATE_SUBMIT':
      return {
        ...state,
        isSubmitted: action.payload,
      };
    case 'UPDATE_ALL_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };
    default:
      break;
  }
}

export default function useFormul(initialValues, validate, fnCallback) {
  const [state, dispatch] = useReducer(formulReducer, {
    errors: {},
    isSubmitted: false,
    values: initialValues,
  });

  const validateField = useCallback(
    (key, value) => {
      const validationErrors = validate({ ...state.values, [key]: value });
      //on vérifie l'objet que retourne validate avec la valeur donné dans le handleChange
      if (validationErrors[key] !== state.errors[key]) {
        dispatch({
          type: 'SET_ERROR',
          payload: { key: key, validationErrors: validationErrors[key] },
        });

        //on met à jour l'erreur selon ce que contient l'objet retourné par validate
      }
    },
    [state.errors, validate, state.values]
  );

  const handleChange = useCallback(
    (key, value) => {
      dispatch({ type: 'UPDATE_VALUES', payload: { key: key, value: value } });
      if (state.isSubmitted) {
        validateField(key, value);
      }
    },
    [state.isSubmitted, validateField]
  );

  const handleBlur = useCallback(
    (key) => {
      const value = state.values[key];
      validateField(key, value);
    },
    [validateField, state.values]
  );

  const handleSubmit = useCallback(async () => {
    dispatch({ type: 'UPDATE_SUBMIT', payload: true });
    const validationErrors = validate(state.values);
    dispatch({ type: 'UPDATE_ALL_ERRORS', payload: validationErrors });
    if (Object.values(validationErrors).every((item) => item === '')) {
      try {
        await fnCallback(state.values);
      } catch (error) {
        console.error(error);
      }

      //  dispatch({type:"UPDATE_SUBMIT", payload:false});
      //  dispatch({type:"UPDATE_IS_ERRORS", payload:false});
    }
  }, [validate, state.values]);

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}