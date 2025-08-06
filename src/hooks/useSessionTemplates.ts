import { useState, useEffect } from 'react';
import { sessionTemplates } from '../data/sessionTemplates';
import { SessionTemplate } from '../types';

export function useSessionTemplates() {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading for consistency with other hooks
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Use static data for now
        setTemplates(sessionTemplates);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const getTemplate = (id: string): SessionTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  return {
    templates,
    loading,
    error,
    getTemplate,
    refetch: () => setTemplates(sessionTemplates),
  };
}