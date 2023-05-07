export function wait(number: number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}

export function getRelativeDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diff < minute) {
    return "just now";
  } else if (diff < hour) {
    const minutesAgo = Math.floor(diff / minute);
    return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
  } else if (diff < day) {
    const hoursAgo = Math.floor(diff / hour);
    return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  } else if (diff < week) {
    const daysAgo = Math.floor(diff / day);
    return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  } else if (diff < month) {
    const weeksAgo = Math.floor(diff / week);
    return `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;
  } else if (diff < year) {
    const monthsAgo = Math.floor(diff / month);
    return `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;
  } else {
    const yearsAgo = Math.floor(diff / year);
    return `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
  }
}
