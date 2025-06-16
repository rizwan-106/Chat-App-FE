export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const daysDiff = (now - date) / (1000 * 60 * 60 * 24);

  const options = { hour: "numeric", minute: "numeric", hour12: false };

  if (isToday) {
    return date.toLocaleTimeString([], options);
  } else if (isYesterday) {
    return "Yesterday";
  } else if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  } else {
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}
