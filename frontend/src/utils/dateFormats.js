export const tenderDateFormat = (date) => {
  const dt = new Date(date);

  return `${dt.toLocaleString("default", {
    month: "short",
  })} ${dt.getDate()}, ${dt.getFullYear()}, ${dt.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  })}`;
};

export const getISTDate = () => {
  const dateIST = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const dateParts = dateIST.split(",")[0].split("/");
  const [day, month, year] = dateParts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const formattedDate = (dt) => {
  const dateList = dt.split("-").reverse().join("-");

  return dateList;
};

export const formatDateFromDateString = (dateStr) => {
  const dt = new Date(dateStr);

  return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;
};

export const getTimeDifference = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return "-";
  }

  try {
    const date1 = new Date(fromDate);
    const date2 = new Date(toDate);

    const timeDifferenceInSeconds = Math.abs(
      (date2.getTime() - date1.getTime()) / 1000
    );
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
    const remainingSeconds = (timeDifferenceInSeconds % 60).toFixed(0);

    return `${hours > 0 ? `${hours} ${hours > 1 ? 'hrs' : 'hr'}` : ''} ${minutes > 0 ? `${minutes} ${minutes > 1 ? 'mins' : 'min'}` : ''} ${remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds > 1 ? 'secs' : 'sec'}` : ''}`
  } catch (error) {
    return "-";
  }
};

export const convertHoursToMins = (n) => {
  if (isNaN(n)) {
    return n;
  }

  const num = n * 60;
  const hours = Math.floor(num / 60);
  const minutes = (num % 60).toFixed(0);

  return `${hours} ${hours > 1 ? "hours" : "hour"} ${minutes} mins`;
};
