import type {
  // NotificationSocketClientToServerEvents,
  // NotificationSocketServerToClientEvents,
  NotificationCreationParamTypes,
  NotificationType,
  // NOTIFICATION_WEB_SOCKET_NS
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'
// import { SocketWebConnection } from '@dx/data-access-socket-io-web';

// export class NotificationSockets {
//   public static getSocket (userId: string) {
//     const socket = SocketWebConnection.createSocket<
//       NotificationSocketServerToClientEvents,
//       NotificationSocketClientToServerEvents
//     >(`${NOTIFICATION_WEB_SOCKET_NS}/${userId}`);

//     return socket;
//   }
// }

export const apiWebNotifications = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      { system: NotificationType[]; user: NotificationType[] },
      { userId: string }
    >({
      query: (payload) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `notification/user/${payload.userId}`,
      }),
      // async onCacheEntryAdded(
      //   paylaod,
      //   { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      // ) {
      //   const socket = NotificationSockets.getSocket(paylaod.userId);
      //   const connected = new Promise<void> (resolve => socket.on('connect', resolve));

      //   const listener = (data: NotificationType) => {
      //     updateCachedData((currentCacheData) => {
      //       currentCacheData.push(data);
      //     })
      //   };

      //   try {
      //     await cacheDataLoaded;
      //     await connected;
      //     socket.on('sendNotification', listener);
      //   } catch (err){
      //     console.error(err);
      //   }

      //   await cacheEntryRemoved;
      //   socket.removeListener('sendNotification', listener);
      // }
    }),

    markAllAsDismissed: build.mutation<{ success: boolean }, { userId: string }>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `notification/dismiss-all/${paylaod.userId}`,
      }),
    }),

    markAsDismissed: build.mutation<{ success: boolean }, { id: string; userId: string }>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `notification/dismiss/${paylaod.id}/${paylaod.userId}`,
      }),
    }),

    sendNotificationAppUpdate: build.mutation<{ success: boolean }, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: `notification/app-update`,
      }),
    }),

    sendNotificationToAll: build.mutation<
      { success: boolean },
      Partial<NotificationCreationParamTypes>
    >({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: `notification/all-users`,
      }),
    }),

    sendNotificationToUser: build.mutation<{ success: boolean }, NotificationCreationParamTypes>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: `notification/user`,
      }),
    }),

    testSockets: build.mutation<{ success: boolean }, { userId: string }>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: `notification/test/${paylaod.userId}`,
      }),
    }),
  }),

  overrideExisting: true,
})

export const fetchNotifications = apiWebNotifications.endpoints.getNotifications

export const {
  useLazyGetNotificationsQuery,
  useMarkAllAsDismissedMutation,
  useMarkAsDismissedMutation,
  useSendNotificationAppUpdateMutation,
  useSendNotificationToAllMutation,
  useSendNotificationToUserMutation,
  useTestSocketsMutation,
} = apiWebNotifications
