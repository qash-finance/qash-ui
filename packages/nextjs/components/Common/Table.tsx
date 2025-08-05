import React from "react";

export type CellContent = string | React.ReactNode;

interface TableProps {
  headers: string[];
  data: Record<string, CellContent>[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  actionColumn?: boolean;
  actionRenderer?: (rowData: Record<string, CellContent>, index: number) => React.ReactNode;
  columnWidths?: Record<string, string>;
}

const createTableRow = (
  data: Record<string, CellContent>,
  headers: string[],
  actionRenderer?: (rowData: Record<string, CellContent>, index: number) => React.ReactNode,
  index?: number,
): React.ReactNode[] => {
  const row = headers.map(header => {
    const cellData = data[header];

    // If it's already a React node, return as is
    if (React.isValidElement(cellData)) {
      return cellData;
    }

    // If it's a string, wrap in appropriate styling
    if (typeof cellData === "string") {
      return <span className="text-white">{cellData}</span>;
    }

    // For other types, render as is
    return cellData;
  });

  // Add action column if renderer is provided
  if (actionRenderer && index !== undefined) {
    row.push(actionRenderer(data, index));
  }

  return row;
};

const TableHeader = ({
  columns,
  headerClassName = "",
  actionColumn = false,
  columnWidths = {},
}: {
  columns: string[];
  headerClassName?: string;
  actionColumn?: boolean;
  columnWidths?: Record<string, string>;
}) => {
  const defaultHeaderClass = "px-3 py-2 text-sm font-medium text-neutral-400 border-r border-[#292929]";

  return (
    <thead>
      <tr className="bg-[#181818]">
        {columns.map((column, index) => (
          <th
            key={column}
            className={`${defaultHeaderClass} ${index === 0 ? "text-left" : "text-center"} ${
              index === 0 ? "rounded-tl-lg" : ""
            } ${index === columns.length - 1 && !actionColumn ? "rounded-tr-lg border-r-0" : ""} ${headerClassName}`}
            style={{ width: columnWidths[index.toString()] }}
          >
            {column}
          </th>
        ))}
        {actionColumn && (
          <th
            className={`${defaultHeaderClass} rounded-tr-lg border-r-0 text-center ${headerClassName}`}
            style={{ width: "10%" }}
          >
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
};

const TableRow = ({
  cells,
  headers,
  rowClassName = "",
  columnWidths = {},
}: {
  cells: React.ReactNode[];
  headers: string[];
  rowClassName?: string;
  columnWidths?: Record<string, string>;
}) => {
  const defaultRowClass = "bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]";

  return (
    <tr className={`${defaultRowClass} ${rowClassName}`}>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`px-3 py-2 ${index === 0 ? "text-left" : "text-center"} ${
            index === cells.length - 1 ? "" : "border-r border-zinc-800"
          }`}
          style={{ width: columnWidths[index.toString()] }}
        >
          {cell}
        </td>
      ))}
    </tr>
  );
};

export function Table({
  headers,
  data,
  className = "",
  headerClassName = "",
  rowClassName = "",
  actionColumn = false,
  actionRenderer,
  columnWidths = {},
}: TableProps) {
  const defaultTableClass = "overflow-x-auto table-scrollbar rounded-lg border border-zinc-800";

  return (
    <div className={`${defaultTableClass} ${className}`}>
      <table className="w-full table-fixed">
        <TableHeader
          columns={headers}
          headerClassName={headerClassName}
          actionColumn={actionColumn}
          columnWidths={columnWidths}
        />
        <tbody>
          {data.map((rowData, index) => {
            const row = createTableRow(rowData, headers, actionRenderer, index);
            return (
              <TableRow
                key={index}
                cells={row}
                headers={headers}
                rowClassName={rowClassName}
                columnWidths={columnWidths}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
