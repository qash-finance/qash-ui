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
  columnWidths?: Record<number, string>;
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
  columnWidths?: Record<number, string>;
}) => {
  const defaultHeaderClass = "px-3 py-2 text-center text-sm font-medium text-neutral-400 border-r border-[#292929]";

  return (
    <thead>
      <tr className="bg-[#181818]">
        {columns.map((column, index) => (
          <th
            key={column}
            className={`${defaultHeaderClass} ${
              index === 0 ? "rounded-tl-lg" : ""
            } ${index === columns.length - 1 && !actionColumn ? "rounded-tr-lg border-r-0" : ""} ${headerClassName}`}
            style={{ width: columnWidths[index] }}
          >
            {column}
          </th>
        ))}
        {actionColumn && (
          <th
            className={`${defaultHeaderClass} rounded-tr-lg border-r-0 ${headerClassName}`}
            style={{ width: columnWidths[columns.length] }}
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
  rowClassName = "",
  columnWidths = {},
}: {
  cells: React.ReactNode[];
  rowClassName?: string;
  columnWidths?: Record<number, string>;
}) => {
  const defaultRowClass = "bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]";

  return (
    <tr className={`${defaultRowClass} ${rowClassName}`}>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`px-3 py-2 text-center ${index === cells.length - 1 ? "" : "border-r border-zinc-800"}`}
          style={{ width: columnWidths[index] }}
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
  const defaultTableClass = "overflow-x-auto rounded-lg border border-zinc-800";

  const rows = data.map((rowData, index) => createTableRow(rowData, headers, actionRenderer, index));

  return (
    <div className={`${defaultTableClass} ${className}`}>
      <table className="w-full">
        <TableHeader
          columns={headers}
          headerClassName={headerClassName}
          actionColumn={actionColumn}
          columnWidths={columnWidths}
        />
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={index} cells={row} rowClassName={rowClassName} columnWidths={columnWidths} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
