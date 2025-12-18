// import { Socket } from 'socket.io-client';

// export const socketEmitAsPromise = (socket: Socket) => {
//   return <TData = any>(message: string, data: TData): Promise<any> => {
//     return new Promise((resolve, reject) => {
//       socket.emit(message, data, (response: WsResponse<TData>) => {
//         if (response.error) {
//           reject(response);
//         } else {
//           resolve(response);
//         }
//       });
//     })
//   }
// }
// https://github.com/reduxjs/redux-toolkit/discussions/3693#discussioncomment-6889103
