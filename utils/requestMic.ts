// Utility to request microphone access for browser environments
// This module provides helpers to check permission, request microphone access
// and stop media streams when done.

export type MicPermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

/**
 * Check microphone permission using the Permissions API if available.
 * Returns 'granted', 'denied', 'prompt', or 'unavailable' when the API isn't present.
 */
export async function checkMicPermission(): Promise<MicPermissionState> {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
        return 'unavailable';
    }

    try {
        const status = await (navigator as any).permissions.query({ name: 'microphone' as PermissionName });
        return status.state as MicPermissionState;
    } catch (err) {
        // Permissions API might not support 'microphone' in some browsers
        return 'unavailable';
    }
}

/**
 * Request microphone permission by calling getUserMedia. Returns the stream on success.
 * Returns null if permission is denied or an error occurs.
 */
export async function requestMic(): Promise<MediaStream | null> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return null;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
    } catch (err) {
        console.error('Failed to get microphone access', err);
        return null;
    }
}

/**
 * Stops all tracks on a stream and removes references to avoid memory leaks.
 */
export function stopStream(stream: MediaStream | null | undefined) {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
}

export default requestMic;
