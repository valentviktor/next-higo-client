"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getPaginationRowModel, // Ditambahkan untuk TanStack Table v8
  getSortedRowModel, // Ditambahkan untuk TanStack Table v8
  getFilteredRowModel, // Ditambahkan untuk TanStack Table v8
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

interface Customer {
  Number: number;
  "Name of Location": string;
  "Login Hour": string;
  "Login Date": string;
  Name: string;
  Age: number;
  gender: string;
  Email: string;
  "No Telp": string;
  "Brand Device": string;
  "Digital Interest": string;
  "Location Type": string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

const CustomerTable: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [locationTypeOptions, setLocationTypeOptions] = useState<string[]>([]);
  const [brandDeviceOptions, setBrandDeviceOptions] = useState<string[]>([]);
  const [digitalInterestOptions, setDigitalInterestOptions] = useState<
    string[]
  >([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [genderRes, locationRes, brandRes, digitalRes] =
          await Promise.all([
            api.get("/customers/filters/gender"),
            api.get("/customers/filters/Location%20Type"),
            api.get("/customers/filters/Brand%20Device"),
            api.get("/customers/filters/Digital%20Interest"),
          ]);
        setGenderOptions(genderRes.data.data);
        setLocationTypeOptions(locationRes.data.data);
        setBrandDeviceOptions(brandRes.data.data);
        setDigitalInterestOptions(digitalRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (paginationState.pageIndex + 1).toString(),
        limit: paginationState.pageSize.toString(),
      });

      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      if (globalFilter) {
        params.append("search", globalFilter);
      }

      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, filter.value as string);
        }
      });

      const response = await api.get(`/customers?${params.toString()}`);
      setData(response.data.data);
      setPaginationInfo(response.data.pagination);
    } catch (err: any) {
      setError("Failed to fetch data: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    paginationState.pageIndex,
    paginationState.pageSize,
    sorting,
    globalFilter,
    columnFilters,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleColumnFilterChange = (id: string, value: string) => {
    setColumnFilters((prev) => {
      const newFilters = prev.filter((f) => f.id !== id);
      if (value) {
        newFilters.push({ id, value });
      }
      return newFilters;
    });
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSortingChange = (updater: any) => {
    setSorting(updater);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "number_sequence",
        header: "No.",
        enableSorting: false,
        cell: (info) => {
          const calculatedNumber =
            paginationInfo.currentPage * paginationInfo.limit -
            paginationInfo.limit +
            info.row.index +
            1;
          return calculatedNumber;
        },
        size: 50,
      },
      {
        accessorKey: "Name",
        header: "Customer Name",
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Email",
        header: "Email",
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        enableSorting: true,
        cell: (info) => info.getValue(),
        filterFn: "equals",
      },
      {
        accessorKey: "Age",
        header: "Age",
        enableSorting: true,
        cell: (info) => {
          const ageValue = info.getValue() as number;
          const currentYear = new Date().getFullYear();
          return currentYear - ageValue;
        },
      },
      {
        accessorKey: "Name of Location",
        header: "Location",
        enableSorting: true,
        cell: (info) => info.getValue(),
        filterFn: "equals",
      },
      {
        accessorKey: "Location Type",
        header: "Location Type",
        enableSorting: true,
        cell: (info) => info.getValue(),
        filterFn: "equals",
      },
      {
        accessorKey: "Brand Device",
        header: "Brand Device",
        enableSorting: true,
        cell: (info) => info.getValue(),
        filterFn: "equals",
      },
      {
        accessorKey: "Digital Interest",
        header: "Digital Interest",
        enableSorting: true,
        cell: (info) => info.getValue(),
        filterFn: "equals",
      },
      {
        accessorKey: "Date",
        header: "Login Date",
        enableSorting: true,
        cell: (info) => {
          const dateValue = info.getValue() as string;
          const [month, day, year] = dateValue.split("/");
          const date = new Date(`${year}-${month}-${day}`);
          return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "Login Hour",
        header: "Login Hour",
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
    ],
    [paginationInfo.currentPage, paginationInfo.limit]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: paginationState,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPaginationState,
    pageCount: paginationInfo.totalPages,
  });

  const startItem = (paginationInfo.currentPage - 1) * paginationInfo.limit + 1;
  const endItem = Math.min(
    paginationInfo.currentPage * paginationInfo.limit,
    paginationInfo.totalItems
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mt-6 relative">
      <h2 className="text-md text-gray-600 font-semibold mb-4 flex items-center">
        Customer Data{" "}
        {loading && (
          <span className="ms-3 italic text-gray-400 text-sm">Loading ...</span>
        )}
      </h2>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => handleGlobalFilterChange(e.target.value)}
          placeholder="Search all columns..."
          className="px-3 py-2 text-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        />

        <select
          value={
            (columnFilters.find((f) => f.id === "gender")?.value as string) ||
            ""
          }
          onChange={(e) => handleColumnFilterChange("gender", e.target.value)}
          className="px-3 py-2 text-gray-400 border rounded-md bg-white outline-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Gender</option>
          {genderOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={
            (columnFilters.find((f) => f.id === "locationType")
              ?.value as string) || ""
          }
          onChange={(e) =>
            handleColumnFilterChange("locationType", e.target.value)
          }
          className="px-3 py-2 text-gray-400 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Location Type</option>
          {locationTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={
            (columnFilters.find((f) => f.id === "brandDevice")
              ?.value as string) || ""
          }
          onChange={(e) =>
            handleColumnFilterChange("brandDevice", e.target.value)
          }
          className="px-3 py-2 text-gray-400 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Brand Device</option>
          {brandDeviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={
            (columnFilters.find((f) => f.id === "digitalInterest")
              ?.value as string) || ""
          }
          onChange={(e) =>
            handleColumnFilterChange("digitalInterest", e.target.value)
          }
          className="px-3 py-2 text-gray-400 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Digital Interest</option>
          {digitalInterestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500 italic"
                >
                  No data available with current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-gray-700 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 hover:text-gray-100 transition-colors"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-gray-700 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 hover:text-gray-100 transition-colors"
          >
            {">"}
          </button>
        </div>

        {paginationInfo.totalItems > 0 && (
          <span className="text-sm text-gray-700">
            Showing{" "}
            <strong>
              {startItem} - {endItem}
            </strong>{" "}
            of <strong>{paginationInfo.totalItems.toLocaleString()}</strong> items
          </span>
        )}
        {paginationInfo.totalItems === 0 && !loading && (
          <span className="text-sm text-gray-500 italic">
            No items to display.
          </span>
        )}

        <select
          value={paginationState.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="px-3 py-1 text-gray-700 border rounded-md"
        >
          {[10, 25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>

      {loading && data.length > 0 && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-gray-100 rounded-lg shadow-lg">
            <p className="text-gray-600 text-sm">Loading more data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;