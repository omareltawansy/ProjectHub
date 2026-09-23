import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// Dashboard section kept in the URL (?section=Projects) so refresh, back/forward
// and shared links all land on the same tab.
export function useSectionParam(defaultSection = 'Overview') {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') || defaultSection;

  const setSection = useCallback((next) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (!next || next === defaultSection) params.delete('section');
      else params.set('section', next);
      return params;
    });
  }, [setSearchParams, defaultSection]);

  return [section, setSection];
}
