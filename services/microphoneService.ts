

import { Capacitor } from '@capacitor/core';

export const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
        // Use browser getUserMedia which will trigger native permission prompt on Android/iOS
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        stream.getTracks().forEach(t => t.stop());
        console.log('Microphone permission granted');
        return true;
    } catch (err) {
        console.error('requestMicrophoneAccess failed:', err);
        // Log the specific error code/name for debugging
        if (err instanceof DOMException) {
            console.error('DOMException name:', err.name, 'code:', err.code);
            if (err.name === 'NotAllowedError') {
                console.warn('User denied microphone permission or browser does not have permission');
            } else if (err.name === 'NotFoundError') {
                console.warn('No microphone device found');
            }
        }
        return false;
    }
};

export const openAppSettings = async (): Promise<void> => {
    const win = window as any;
    try {
        if (Capacitor.isNativePlatform()) {
            // Use Capacitor App plugin to open app settings
            if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.App) {
                const platform = Capacitor.getPlatform();
                const settingsUrl = platform === 'android' 
                    ? 'package:' + (await win.Capacitor.Plugins.App.getInfo?.())?.appId
                    : 'app-settings:';
                
                try {
                    await win.Capacitor.Plugins.App.openUrl({ url: settingsUrl });
                } catch (e) {
                    console.warn('Direct app open failed, trying intent:', e);
                    // Fallback: try opening with Android intent
                    if (platform === 'android') {
                        window.open('android.settings.APPLICATION_DETAILS_SETTINGS', '_blank');
                    }
                }
            }
        } else {
            // Web fallback
            window.open('app-settings:', '_blank');
        }
    } catch (e) {
        console.warn('openAppSettings failed:', e);
    }
};

export const hasMicrophonePermission = async (): Promise<boolean> => {
    try {
        // Try to access microphone - if it succeeds, permission is granted
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        stream.getTracks().forEach(t => t.stop());
        console.log('Microphone permission check: granted');
        return true;
    } catch (e) {
        console.error('hasMicrophonePermission check failed:', e);
        if (e instanceof DOMException) {
            console.error('DOMException name:', e.name, 'code:', e.code);
        }
        return false;
    }
};
export const getIsMiui = async (): Promise<{ isMiui: boolean } | null> => {
    try {
        const ua = navigator.userAgent || '';
        if (/miui|xiaomi|redmi/i.test(ua)) return { isMiui: true };
        return { isMiui: false };
    } catch (e) {
        return null;
    }
};

export default {
    requestMicrophoneAccess,
    openAppSettings,
    hasMicrophonePermission,
    getIsMiui,
};

