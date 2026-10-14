import { useState } from 'react';

export function useMedicationReminderController(onConfirm?: () => void, onVoiceConfirm?: () => void) {
  const [confirmed, setConfirmed] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm?.();
  };

  const handleVoice = () => {
    setVoiceListening(true);
    // Preserve the existing simulated voice confirmation.
    setTimeout(() => {
      setVoiceListening(false);
      handleConfirm();
    }, 1500);
    onVoiceConfirm?.();
  };

  return { confirmed, voiceListening, handleConfirm, handleVoice };
}
