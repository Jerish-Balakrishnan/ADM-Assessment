import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, Languages } from 'lucide-react';

const schema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  targetLanguage: z.enum(["en", "es", "fr"], {
    errorMap: () => ({ message: "Invalid language selection" }),
  }),
});

const PromptForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      prompt: "",
      targetLanguage: "en",
    }
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset(); 
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="form-field">
        <label className="form-label" htmlFor="prompt">Your Query</label>
        <textarea
          id="prompt"
          className={`input-base ${errors.prompt ? 'has-error' : ''}`}
          rows="4"
          {...register("prompt")}
          placeholder="E.g., Analyze the current trends in sustainable energy..."
        />
        {errors.prompt && <div className="error-text">{errors.prompt.message}</div>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="targetLanguage">
          <Languages size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Target Language
        </label>
        <select id="targetLanguage" className="input-base" {...register("targetLanguage")}>
          <option value="en">English (Global)</option>
          <option value="es">Spanish (ES)</option>
          <option value="fr">French (FR)</option>
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={!isValid || isLoading}>
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <Send size={16} /> Run Analysis
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm;
