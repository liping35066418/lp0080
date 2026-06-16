import { useEffect, useRef, useCallback } from 'react';
import type { ClientMessage, ServerMessage, EffectConfig } from '@/types';
import { useAppStore } from '@/store/useAppStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleMessageRef = useRef<((msg: ServerMessage) => void) | null>(null);
  const scheduleReconnectRef = useRef<(() => void) | null>(null);
  const isClosingRef = useRef(false);

  const setConfig = useAppStore((s) => s.setConfig);
  const setParticles = useAppStore((s) => s.setParticles);
  const addSignEvent = useAppStore((s) => s.addSignEvent);
  const setStats = useAppStore((s) => s.setStats);
  const setConnected = useAppStore((s) => s.setConnected);
  const reset = useAppStore((s) => s.reset);

  const handleMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case 'config':
          setConfig(msg.payload);
          break;
        case 'particle:update':
          setParticles(msg.payload);
          break;
        case 'sign:event':
          addSignEvent(msg.payload);
          break;
        case 'stats':
          setStats(msg.payload);
          break;
        case 'reset:done':
          reset();
          break;
        case 'pong':
          break;
      }
    },
    [setConfig, setParticles, addSignEvent, setStats, reset]
  );

  useEffect(() => {
    handleMessageRef.current = handleMessage;
  }, [handleMessage]);

  const connect = useCallback(() => {
    isClosingRef.current = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isClosingRef.current) {
          ws.close();
          return;
        }
        console.log('WebSocket connected');
        setConnected(true);

        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data: ServerMessage = JSON.parse(event.data);
          handleMessageRef.current?.(data);
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        if (isClosingRef.current) {
          return;
        }
        console.log('WebSocket disconnected');
        setConnected(false);
        scheduleReconnectRef.current?.();
      };

      ws.onerror = (err) => {
        if (isClosingRef.current) {
          return;
        }
        console.error('WebSocket error:', err);
        ws.close();
      };
    } catch (e) {
      if (isClosingRef.current) {
        return;
      }
      console.error('Failed to create WebSocket:', e);
      scheduleReconnectRef.current?.();
    }
  }, [setConnected]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, 2000);
  }, [connect]);

  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const updateConfig = useCallback(
    (partial: Partial<EffectConfig>) => {
      send({ type: 'config', payload: partial });
    },
    [send]
  );

  const startSimulation = useCallback(
    (interval: number, names?: string[]) => {
      send({ type: 'sim:start', payload: { interval, names } });
      useAppStore.getState().setSimRunning(true);
    },
    [send]
  );

  const stopSimulation = useCallback(() => {
    send({ type: 'sim:stop' });
    useAppStore.getState().setSimRunning(false);
  }, [send]);

  const triggerSign = useCallback(
    (name?: string) => {
      send({ type: 'sign', payload: { name: name || '' } });
    },
    [send]
  );

  const doReset = useCallback(() => {
    send({ type: 'reset' });
    useAppStore.getState().setSimRunning(false);
  }, [send]);

  useEffect(() => {
    connect();

    return () => {
      isClosingRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      const ws = wsRef.current;
      if (ws) {
        if (ws.readyState === WebSocket.CONNECTING) {
          // 连接还在握手中，等 onopen 触发后由标志位控制关闭
          // 不在这里调用 close，避免触发 onerror/onclose 的错误日志
        } else if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    };
  }, [connect]);

  return {
    updateConfig,
    startSimulation,
    stopSimulation,
    triggerSign,
    doReset,
  };
}
