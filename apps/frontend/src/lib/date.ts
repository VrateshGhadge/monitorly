// frontend->src->lib->date.ts
import { formatDistanceToNowStrict } from "date-fns";

export function formatLastChecked(date: string, now = Date.now()) {
  if (!date) return "Never";

  const seconds = (now - new Date(date).getTime()) / 1000;

  if (seconds < 10) {
    return "Just now";
  }

  return `${formatDistanceToNowStrict(new Date(date), { addSuffix: true })}`;
}
// import { formatDistanceToNowStrict } from "date-fns";

// export function formatLastChecked(
//   date: string,
//   now = Date.now()
// ) {
//   if (!date) return "Never";

//   const seconds =
//     (now - new Date(date).getTime()) / 1000;

//   if (seconds < 10) {
//     return "Just now";
//   }

//   return `${formatDistanceToNowStrict(
//     new Date(date),
//     { addSuffix: true }
//   )}`;
// }

// // New helper for notification timestamps
// export function formatRelativeTime(date: string | Date) {
//   const timestamp =
//     typeof date === "string"
//       ? new Date(date).getTime()
//       : date.getTime();

//   const diff = Date.now() - timestamp;

//   const seconds = Math.floor(diff / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);

//   if (seconds < 60) return "Just now";
//   if (minutes < 60) return `${minutes} min ago`;
//   if (hours < 24) return `${hours} hr ago`;
//   if (days < 7) return `${days}d ago`;

//   return new Date(timestamp).toLocaleDateString();
// }
