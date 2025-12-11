import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationRequest {
  id: number;
  title: string;
  body: string;
  schedule?: {
    on?: {
      year?: number;
      month?: number;
      day?: number;
      hour?: number;
      minute?: number;
      second?: number;
    };
    at?: Date;
    every?: 'year' | 'month' | 'two-weeks' | 'week' | 'day' | 'hour' | 'minute' | 'second';
    count?: number;
  };
  smallIcon?: string;
  largeIcon?: string;
  iconColor?: string;
  sound?: string;
  vibrate?: boolean;
}

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const permission = await LocalNotifications.requestPermissions();
    console.log('Notification permission status:', permission);
    return permission.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a daily reminder notification at a specific time
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param title - Notification title
 * @param body - Notification body
 * @param id - Unique notification ID (default: 1)
 */
export const scheduleDailyNotification = async (
  hour: number = 9,
  minute: number = 0,
  title: string = '📚 Daily Vocab Reminder',
  body: string = 'Time to learn some new words!',
  id: number = 1
): Promise<void> => {
  try {
    // Check and request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    // Get current date/time
    const now = new Date();
    const scheduleTime = new Date();
    scheduleTime.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduleTime <= now) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    console.log(`Scheduling daily notification for ${scheduleTime.toLocaleTimeString()}`);

    // Schedule the notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          schedule: {
            at: scheduleTime,
            every: 'day', // Repeat daily
          },
          autoCancel: true,
          largeBody: body,
        },
      ],
    });

    console.log('Daily notification scheduled successfully');
  } catch (error) {
    console.error('Failed to schedule daily notification:', error);
  }
};

/**
 * Schedule a one-time notification
 */
export const scheduleOneTimeNotification = async (
  title: string,
  body: string,
  delaySeconds: number = 5,
  id: number = 999
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    const scheduleTime = new Date();
    scheduleTime.setSeconds(scheduleTime.getSeconds() + delaySeconds);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          schedule: {
            at: scheduleTime,
          },
          autoCancel: true,
        },
      ],
    });

    console.log('One-time notification scheduled');
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

/**
 * Cancel a notification by ID
 */
export const cancelNotification = async (id: number): Promise<void> => {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id }],
    });
    console.log(`Notification ${id} cancelled`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await LocalNotifications.cancelAll();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

/**
 * Get pending notifications
 */
export const getPendingNotifications = async (): Promise<any[]> => {
  try {
    const result = await LocalNotifications.getPending();
    return result.notifications || [];
  } catch (error) {
    console.error('Failed to get pending notifications:', error);
    return [];
  }
};

/**
 * Schedule a streak reminder notification
 */
export const scheduleStreakNotification = async (): Promise<void> => {
  try {
    await scheduleDailyNotification(
      9, // 9 AM
      0,
      '🔥 Keep Your Streak Alive!',
      'Come back to Daily Vocab to maintain your streak',
      2
    );
  } catch (error) {
    console.error('Failed to schedule streak notification:', error);
  }
};

/**
 * Schedule a goal reminder notification
 */
export const scheduleGoalReminderNotification = async (): Promise<void> => {
  try {
    await scheduleDailyNotification(
      18, // 6 PM
      0,
      '⏰ Daily Goal Reminder',
      'Have you completed your daily vocabulary goal?',
      3
    );
  } catch (error) {
    console.error('Failed to schedule goal reminder notification:', error);
  }
};

/**
 * Setup all default notifications
 */
export const setupAllNotifications = async (): Promise<void> => {
  try {
    await scheduleStreakNotification(); // 9 AM
    await scheduleGoalReminderNotification(); // 6 PM
    console.log('All notifications setup completed');
  } catch (error) {
    console.error('Failed to setup all notifications:', error);
  }
};

export default {
  requestNotificationPermissions,
  scheduleDailyNotification,
  scheduleOneTimeNotification,
  cancelNotification,
  cancelAllNotifications,
  getPendingNotifications,
  scheduleStreakNotification,
  scheduleGoalReminderNotification,
  setupAllNotifications,
};
