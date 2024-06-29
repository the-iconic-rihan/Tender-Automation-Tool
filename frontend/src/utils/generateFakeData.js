import { faker } from "@faker-js/faker";

const getStatus = (arr) => arr[Math.floor(Math.random() * arr.length)];

const formatDate = (date) => {
  const dt = new Date(date);

  return `${dt.toLocaleString("default", {
    month: "short",
  })} ${dt.getDate()}, ${dt.getFullYear()}, ${dt.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  })}`;
};

export const getDashboradTableData = (len) => {
  const data = [];

  for (let i = 0; i < len; i++) {
    data.push({
      sr_no: i + 1,
      tender_name: faker.system.fileName(),
      tender_number: faker.number.int({ min: 1000, max: 9999 }),
      publishing_date: formatDate(
        faker.date.between({
          from: "2021-01-01T00:00:00.000Z",
          to: "2022-01-01T00:00:00.000Z",
        })
      ),
      upload_date: formatDate(
        faker.date.between({
          from: "2022-01-01T00:00:00.000Z",
          to: "2023-01-01T00:00:00.000Z",
        })
      ),
      uploaded_by: faker.person.fullName(),
      file_upload_status: getStatus([
        "No File Uploaded",
        "File Uploading",
        "File Uploaded",
      ]),
      tender_status: getStatus([
        "No File Uploaded",
        "Uploading",
        "Processing",
        "Succeeded",
      ]),
    });
  }

  return data;
};
