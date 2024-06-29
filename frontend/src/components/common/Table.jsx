/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/Table.css";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { fuzzyFilter } from "../../utils/tableUtils";
import { useNavigate } from "react-router-dom";

import asc from "../../assets/images/asc_sort.svg";
import desc from "../../assets/images/desc_sort.svg";
import sort from "../../assets/images/sort.svg";
import search_icon from "../../assets/images/search_icon.svg";

import BackIcon from "../common/BackIcon";
import NextIcon from "../common/NextIcon";
import { useDispatch, useSelector } from "react-redux";
import { updateTenderDetails } from "../../features/upload/UploadSlice";
import DebouncedInput from "./DebouncedInput";

import { Tooltip } from "react-tooltip";
import Modal from "./Modal";
import { useWebSocketContext } from "../../utils/WebSocketContext";
import {
  getErrorToast,
  getInfoToast,
  getSuccessToast,
} from "../../utils/useToast";
import {
  getTenderFiles,
  markTenderFailed,
} from "../../features/dashboard/dashboardSlice";

/*
  @PROPS DESCRIPTION
  columnData => array of columns created using createColumnHelper() method from react-table.
  tableData => Data to be displayed in a table component.
  filterValue => Current value of a search input field.
  setFilterValue => Function to update the filterValue prop.
  rowsPerPage => Number of rows displayed per page in pagination.
  canNavigate => A boolean value that determines if a user can navigate to a different page on clicking a row
  viewPaginationBtn => Boolean value to determine if a page can navigate
*/

// let tableContainer;
const Table = ({
  columnData,
  tableData,
  filterValue,
  setFilterValue,
  columnFilters,
  setColumnFilters,
  rowsPerPage = 5,
  viewPaginationBtn = true,
  canNavigate = false,
  resetTableDataOnChange = true,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sendJsonMessage } = useWebSocketContext();
  const upload = useSelector((state) => state.upload);
  const user = useSelector((state) => state.auth);

  useEffect(() => {
    table.getState().pagination.pageSize = rowsPerPage;

    // tableContainer = document.querySelector(".table");
  }, []);

  const columns = useMemo(() => columnData, []);

  const table = useReactTable({
    data: tableData,
    columns,

    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter: filterValue,
      columnFilters,
    },

    onGlobalFilterChange: setFilterValue,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: fuzzyFilter,
    autoResetPageIndex: resetTableDataOnChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === "name") {
      if (table.getState().sorting[0]?.id !== "name") {
        table.setSorting([{ id: "name", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  const navigateHandler = (row) => {
    if (canNavigate) {
      if (
        typeof row.tender_status === "string" &&
        row.tender_status.toLowerCase() === "succeeded"
      ) {
        dispatch(updateTenderDetails(row));
        navigate("/page/category");
      } else if (
        typeof row.tender_status === "string" &&
        row.tender_status.toLowerCase() === "pending"
      ) {
        setIsModalOpen(true);
        dispatch(updateTenderDetails(row));
      } else if (
        typeof row.tender_status === "string" &&
        row.file_upload_status.toLowerCase() === "no file uploaded"
      ) {
        dispatch(updateTenderDetails(row));
        navigate("/page/upload/upload-files");
      } else if (
        // (typeof row.tender_status === "string" &&
        //   row.tender_status.toLowerCase() === "failed") ||
        typeof row.tender_status === "string" &&
        row.file_upload_status.toLowerCase() === "file uploaded" &&
        typeof row.tender_status === "string" &&
        row.tender_status.toLowerCase() !== "failed"
      ) {
        return;
      } else {
        dispatch(updateTenderDetails(row));
        navigate("/page/file-list");
      }
    }
  };

  const sendQueueHandler = (resumeProcess) => {
    if (resumeProcess) {
      sendJsonMessage({
        tender_number: `${upload.tenderNo}`,
      });
      getSuccessToast("Processing started successfully", 2999);
      dispatch(getTenderFiles(user.division));
    } else {
      const data = new FormData();
      data.append("tender_number", upload.tenderNo);
      data.append("resume_processing", false);
      setIsModalOpen(false);

      dispatch(markTenderFailed(data))
        .unwrap()
        .then(() => {
          dispatch(getTenderFiles(user.division));
          getInfoToast("Operation processed successfully");
        })
        .catch((err) => getErrorToast(err));
    }
  };

  return (
    <div className="table-container">
      <div className="table">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    id={`table-hc-${header.id}`}
                    className={`${!header.column.getCanSort()
                      ? "unsorter-header"
                      : "sorted-header"
                      } ${!header.column.getCanFilter()
                        ? "unfiltered-header"
                        : "filtered-header"
                      } ${header.column.columnDef.sticky ? "sticky-col" : ""}`}
                    style={
                      header.column.columnDef.sticky
                        ? {
                          [header.column.columnDef.stickyPosition]:
                            header.column.columnDef.stickyWidth,
                          width: header.column.columnDef.width,
                          top: 0,
                          zIndex: 20,
                        }
                        : {
                          width: header.column.columnDef.width,
                          maxWidth: header.column.columnDef.width,
                          minWidth: header.column.columnDef.width,
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }
                    }
                  >
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanSort() ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.15rem",
                              }}
                              {...{
                                className: header.column.getCanSort()
                                  ? "header"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              <small>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </small>
                              {{
                                asc: (
                                  <img
                                    style={{ cursor: "pointer" }}
                                    src={asc}
                                  />
                                ),
                                desc: (
                                  <img
                                    style={{ cursor: "pointer" }}
                                    src={desc}
                                  />
                                ),
                              }[header.column.getIsSorted()] ?? (
                                  <img style={{ cursor: "pointer" }} src={sort} />
                                )}
                            </div>
                          ) : (
                            <p>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </p>
                          )}

                          {header.column.getCanFilter() ? (
                            <div className="column-search">
                              <div className="search-icon-container">
                                <img src={search_icon} alt="" />
                              </div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => navigateHandler(row.original)}
                className="table_body-row"
                style={{
                  // cursor: canNavigate ? "pointer" : "default",
                  cursor: "default",
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  let id = String(cell.renderValue())
                    .toLowerCase()
                    .replaceAll(" ", "-");
                  const colId = String(cell.column.id);
                  return (
                    <td
                      className={`table_body-row-cell ${colId + "-" + id} ${cell.column.columnDef.sticky && "sticky-col"
                        }`}
                      key={cell.id}
                      style={
                        cell.column.columnDef.sticky
                          ? {
                            [cell.column.columnDef.stickyPosition]:
                              cell.column.columnDef.stickyWidth,
                            width: cell.column.columnDef.width,
                            maxWidth: cell.column.columnDef.width,
                            minWidth: cell.column.columnDef.width,
                          }
                          : {
                            width: cell.column.columnDef.width,
                            maxWidth: cell.column.columnDef.width,
                            minWidth: cell.column.columnDef.width,
                          }
                      }
                      {...(cell.column.columnDef.tooltip
                        ? {
                          "data-tooltip-id": "header-tooltip",
                        }
                        : {})}
                      {...(cell.column.columnDef.tooltip
                        ? {
                          "data-tooltip-content": cell.renderValue(),
                        }
                        : {})}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewPaginationBtn && (
        <div className="table-navigation-container">
          <p>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
            <button
              className="pagination-btn"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <BackIcon disabled={!table.getCanPreviousPage()} />
            </button>
            <button
              disabled={!table.getCanNextPage()}
              className="pagination-btn"
              onClick={() => table.nextPage()}
            >
              <NextIcon disabled={!table.getCanNextPage()} />
            </button>
          </p>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>
          Application encountered error in processing files. For details please refer the mail sent to the registered email Id. Do you want to proceed for category generation excluding the files with error?
        </p>
        <div className="unt_modal-btn-container">
          <button onClick={() => sendQueueHandler(true)}>Yes</button>
          <button onClick={() => sendQueueHandler(false)}>No</button>
        </div>
      </Modal>
      <Tooltip style={{ zIndex: 100 }} id="header-tooltip" />
    </div>
  );
};

export default Table;

function Filter({ column, table }) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  return typeof firstValue === "number" ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={columnFilterValue?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old) => [value, old?.[1]])
          }
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={columnFilterValue?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old) => [old?.[0], value])
          }
          className="w-24 border shadow rounded"
        />
      </div>
    </div>
  ) : (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value, i) => (
          <option value={value} key={i} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ""}
        onChange={(value) => column.setFilterValue(value)}
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
    </>
  );
}
