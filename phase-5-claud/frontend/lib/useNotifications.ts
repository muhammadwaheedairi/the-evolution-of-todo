'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserId } from './api';

interface Notification {
  type: string;
  event?: string;
  task_id?: number;
  title?: string;
  message: string;
}

export function useNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  }, []);

  const showBrowserNotification = useCallback((notification: Notification) => {
    // Sound play karo
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch (e) {}

    // Browser notification
    if (permissionGranted && 'Notification' in window) {
      new Notification('TaskFlow', {
        body: notification.message,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: `task-${notification.task_id}`,
      });
    }
  }, [permissionGranted]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    console.log('🔌 Connecting WebSocket user_id:', userId);

    const newSocket = io('http://taskflow.local', {
      path: '/ws/socket.io',
      auth: { user_id: userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('notification', (data: Notification) => {
      console.log('📬 Notification:', data);
      setNotifications(prev => [data, ...prev].slice(0, 10));
      showBrowserNotification(data);
    });

    newSocket.on('connected', (data) => {
      console.log('🔔 Connected to notification service:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing WebSocket');
      newSocket.close();
    };
  }, [showBrowserNotification]);

  return {
    socket,
    notifications,
    isConnected,
    permissionGranted,
    requestPermission,
    clearNotifications: () => setNotifications([]),
  };
}
