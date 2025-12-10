
const microphoneService = {
  requestMicrophoneAccess: async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately as we just want to check permission/capability
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  },
  openAppSettings: async (): Promise<void> => {
    // Web browsers do not allow opening system settings programmatically.
    // We provide instructions instead.
    alert('Please click the lock icon in your browser address bar to enable microphone permissions.');
    return Promise.resolve();
  }
};

export default microphoneService;
