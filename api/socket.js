/**
 * Singleton Socket.IO client connection.
 *
 * Import this module anywhere in the app to get the same socket instance.
 * The socket connects automatically when first imported.
 *
 * Usage:
 *   import socket from '../api/socket';
 *   socket.on('reviewAdded', ({ stallId, review }) => { ... });
 *   socket.off('reviewAdded');
 */
import { io } from 'socket.io-client';
import config from '../config';

const socket = io(config.serverPath, {
  transports: ['websocket'],   // required for React Native (no long-polling fallback)
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on('connect',         () => console.log('🔌 Socket connected:', socket.id));
socket.on('disconnect',      ()  => console.log('🔌 Socket disconnected'));
socket.on('connect_error',   (e) => console.warn('🔌 Socket error:', e.message));

export default socket;
