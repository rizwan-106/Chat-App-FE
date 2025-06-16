// export function timeAgo(date) {
//   const now = new Date();
//   const past = new Date(date); 
//   const secondsAgo = Math.floor((now- past) / 1000);
//   if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
//   const minutesAgo = Math.floor(secondsAgo / 60);
//   if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
//   const hoursAgo = Math.floor(minutesAgo / 60);
//   if (hoursAgo < 24) return `${hoursAgo} hours ago`;
//   const daysAgo = Math.floor(hoursAgo / 24);
//   if (daysAgo < 30) return `${daysAgo} days ago`;
//   const monthsAgo = Math.floor(daysAgo / 30);
//   if (monthsAgo < 12) return `${monthsAgo} months ago`;
//   const yearsAgo = Math.floor(monthsAgo / 12);
//   return `${yearsAgo} years ago`;
// }


export function timeAgo(timeString) {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(+hours);
  date.setMinutes(+minutes);
  date.setSeconds(0);

  const now = new Date();
  let hoursAgo = now.getHours() - date.getHours();
  let minutesAgo = now.getMinutes() - date.getMinutes();

  if (hoursAgo < 0) hoursAgo += 24;
  if (minutesAgo < 0) {
    minutesAgo += 60;
    hoursAgo -= 1;
  }

  if (hoursAgo === 0 && minutesAgo === 0) return `just now`;
  if (hoursAgo === 0) return `${minutesAgo} min ago`;
  return `${hoursAgo} hr ${minutesAgo} min ago`;
}
