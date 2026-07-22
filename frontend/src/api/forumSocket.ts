import {Client, type IMessage, type StompSubscription} from "@stomp/stompjs";
import type {ForumRealtimeEvent} from "../types/forum";

function getAccessToken() {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
}

function getSocketUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!configuredBaseUrl || configuredBaseUrl.startsWith("/")) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }

  return configuredBaseUrl
    .replace(/^http:/, "ws:")
    .replace(/^https:/, "wss:")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "") + "/ws";
}

export function createForumSocketClient(onConnect?: (client: Client) => void) {
  const client = new Client({
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: getAccessToken()
      ? {
          Authorization: `Bearer ${getAccessToken()}`,
        }
      : {},
    brokerURL: getSocketUrl(),
    onConnect: () => onConnect?.(client),
  });

  return client;
}

export function subscribeForumEvent<T>(
  client: Client,
  destination: string,
  handler: (event: ForumRealtimeEvent<T>) => void
): StompSubscription {
  return client.subscribe(destination, (message: IMessage) => {
    handler(JSON.parse(message.body) as ForumRealtimeEvent<T>);
  });
}
