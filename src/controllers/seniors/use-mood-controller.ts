import { useState } from 'react';

import type { MoodValue } from '@/models/seniors/mood';

export function useMoodController(onSelect?: (mood: MoodValue) => void) {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (mood: MoodValue) => {
    setSelected(mood);
    setShowFeedback(true);
    onSelect?.(mood);
    setTimeout(() => setShowFeedback(false), 3500);
  };

  return { selected, showFeedback, handleSelect };
}
