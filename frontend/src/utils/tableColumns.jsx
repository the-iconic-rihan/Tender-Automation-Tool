import FileActions, { UploadedFileActions } from "../components/home/fileList/FileActions";
import TenderActions from "../components/home/tenderFiles/TenderActions";
import { formattedDate } from "./dateFormats";

export const dashboardColumnData = [
  {
    accessorKey: "sr_no",
    header: "sr no",
    enableColumnFilter: false,
    sticky: true,
    stickyPosition: "left",
    stickyWidth: 0,
    width: 50,
  },
  {
    accessorKey: "tender_name",
    header: "TENDER NAME",
    sticky: true,
    stickyPosition: "left",
    stickyWidth: 58,
    width: 100,
    tooltip: true,
  },
  {
    accessorKey: "tender_number",
    header: "OPPN. NO",
    sticky: true,
    stickyPosition: "left",
    stickyWidth: 176,
    width: 50,
    tooltip: true,
  },
  {
    accessorKey: "published_date",
    header: "PBLSHD DT",
    width: 75,
  },
  {
    accessorKey: "uploaded_date",
    header: "UPLOADED DATE",
    width: 75,
  },
  {
    accessorKey: "uploaded_by",
    header: "UPLOADED BY",
    width: 100,
  },
  {
    accessorKey: "file_upload_status",
    header: "UPLOAD STATUS",
    cell: (info) => <span>{info.getValue()}</span>,
    width: 125,
  },
  {
    accessorKey: "tender_status",
    header: "TENDER STATUS",
    cell: (info) => <span>{info.getValue()}</span>,
    width: 125,
  },
  {
    accessorKey: "processing_time",
    header: "total Prcs time",
    width: 100,
  },
  {
    accessorKey: "total_count",
    header: "TOTAL PAGES",
    cell: (info) => <span>{info.getValue()}</span>,
    width: 65,
    enableColumnFilter: false,
  },
  {
    header: "ACTIONS",
    cell: TenderActions,
    sticky: true,
    stickyPosition: "right",
    stickyWidth: 0,
    width: 25,
  },
];

export const userDetailsColumnData = [
  {
    accessorKey: "sr_no",
    header: "Sr No",
    enableColumnFilter: false,
  },
  {
    accessorKey: "tender_name",
    header: "Tender Name",
    enableColumnFilter: false,
  },
  {
    accessorKey: "tender_number",
    header: "OPPN. NO",
    enableColumnFilter: false,
  },

  {
    accessorKey: "uploaded_date",
    header: "Uploaded Date",
    enableColumnFilter: false,
    cell: info => formattedDate(info.getValue())
  },
  {
    accessorKey: "uploaded_by",
    header: "Uploaded By",
    enableColumnFilter: false,
  },
  {
    accessorKey: "tender_status",
    header: "Tender status",
    enableColumnFilter: false,
  },
  {
    accessorKey: "total_pages_processed",
    header: "Total PAGES",
    enableColumnFilter: false,
  },
  {
    accessorKey: "division",
    header: "Division",
    enableColumnFilter: false,
  },
];

export const uploadingFileColumnData = [
  {
    accessorKey: "file_name",
    header: "file name",
  },
  {
    accessorKey: "tender_name",
    header: "tender name",
  },
  {
    accessorKey: "uploaded_date",
    header: "Upload Date",
  },
  {
    accessorKey: "uploaded_by",
    header: "Uploaded by",
  },
  {
    accessorKey: "file_upload_status",
    header: "upload status",
  },
  {
    accessorKey: "file_processing_status",
    header: "Processing status",
  },
  {
    header: "ACTIONS",
    cell: FileActions,
  },
];

export const fileColumnData = [
  {
    accessorKey: "tender_file_name",
    header: "file name",
  },
  {
    accessorKey: "tender_name",
    header: "tender name",
  },
  {
    accessorKey: "uploaded_date",
    header: "Upload Date",
  },
  {
    accessorKey: "uploaded_by",
    header: "Uploaded by",
  },
  {
    accessorKey: "file_upload_status",
    header: "upload status",
  },
  {
    accessorKey: "file_processing_status",
    header: "Processing status",
  },
  {
    header: "Actions",
    cell: UploadedFileActions
  },
];
