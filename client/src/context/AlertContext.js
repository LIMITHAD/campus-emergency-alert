import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [panicNotification, setPanicNotification] = useState(null);
  const alarmIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const listenerAttached = useRef(false);

  useEffect(() => {
    if (!user) return;

    // Poll until socket is available then attach listeners
    const attachListeners = () => {
      const socket = getSocket();
      if (!socket) return false;
      if (listenerAttached.current) return true;

      console.log('✅ AlertContext: Socket found, attaching listeners');
      listenerAttached.current = true;

      socket.on('newAlert', (data) => {
        console.log('🚨 newAlert received in AlertContext:', data);
        setActiveEmergency(data.alert);
        startAlarm();
      });

      socket.on('alertDeleted', ({ alertId }) => {
        setActiveEmergency(prev => (prev?._id === alertId ? null : prev));
      });

      socket.on('newPanicRequest', (data) => {
        if (user.role === 'admin') setPanicNotification(data);
      });

      return true;
    };

    // Try immediately
    if (!attachListeners()) {
      // If socket not ready yet, poll every 500ms
      const poll = setInterval(() => {
        if (attachListeners()) clearInterval(poll);
      }, 500);

      return () => clearInterval(poll);
    }
  }, [user]);

  // Cleanup listeners when user logs out
  useEffect(() => {
    if (!user) {
      listenerAttached.current = false;
      stopAlarm();
    }
  }, [user]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const times = [0, 0.35, 0.7];
      times.forEach(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + t);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + t + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3);
        osc.start(audioCtx.currentTime + t);
        osc.stop(audioCtx.currentTime + t + 0.3);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  };

  const startAlarm = () => {
    stopAlarm();
    playBeep();
    alarmIntervalRef.current = setInterval(playBeep, 2000);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}
  };

  const dismissEmergency = () => {
    stopAlarm();
    setActiveEmergency(null);
  };

  const dismissPanic = () => setPanicNotification(null);

  return (
    <AlertContext.Provider value={{
      activeEmergency, dismissEmergency,
      panicNotification, dismissPanic,
      stopAlarm,
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider');
  return ctx;
};
