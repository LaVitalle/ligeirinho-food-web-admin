import { useState, useEffect, useCallback } from "react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "pedido" | "sistema" | "alerta";
  read: boolean;
  createdAt: Date;
};

async function fetchNotificacoes(): Promise<Notification[]> {
  return [
    {
      id: "1",
      title: "Novo pedido",
      message: "Pedido #1042 recebido na Cantina Central.",
      type: "pedido",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Pedido cancelado",
      message: "Pedido #1038 foi cancelado pelo cliente.",
      type: "alerta",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ];
}

export function useNotifications(pollingMs = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    const data = await fetchNotificacoes();
    setNotifications(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, pollingMs);
    return () => clearInterval(interval);
  }, [load, pollingMs]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAllRead };
}
