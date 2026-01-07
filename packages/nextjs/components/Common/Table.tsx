import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableFooter } from "./TableFooter";

export type CellContent = string | React.ReactNode;

interface TableProps {
  headers: (string | React.ReactNode)[];
  data: Record<string, CellContent>[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((rowData: Record<string, CellContent>, index: number) => string);
  actionColumn?: boolean;
  actionRenderer?: (rowData: Record<string, CellContent>, index: number) => React.ReactNode;
  columnWidths?: Record<string, string>;
  draggable?: boolean;
  onDragEnd?: (newData: Record<string, CellContent>[]) => void;
  selectedRows?: number[];
  showFooter?: boolean;
  footerRenderer?: () => React.ReactNode;
  showPagination?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onRowClick?: (rowData: Record<string, CellContent>, index: number) => void;
  noDataMessage?: string;
}

const createTableRow = (
  data: Record<string, CellContent>,
  headers: (string | React.ReactNode)[],
  actionRenderer?: (rowData: Record<string, CellContent>, index: number) => React.ReactNode,
  index?: number,
): React.ReactNode[] => {
  const row = headers.map(header => {
    // Extract the key from the header for data lookup
    const headerKey = typeof header === "string" ? header : `header-${headers.indexOf(header)}`;
    const cellData = data[headerKey];

    // If it's already a React node, return as is
    if (React.isValidElement(cellData)) {
      return cellData;
    }

    // If it's a string, wrap in appropriate styling
    if (typeof cellData === "string") {
      return <span style={{ color: "var(--color-table-row-text)" }}>{cellData}</span>;
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

const getRowClasses = (isSelected: boolean, customRowClass?: string) => {
  const hasPaddingClass = customRowClass && /\bpy-/.test(customRowClass);
  const defaultPadding = hasPaddingClass ? "" : "py-2";

  return `border-b last:border-b-0 transition-colors ${defaultPadding} ${
    isSelected
      ? "bg-[var(--color-table-row-selected-background)]"
      : "bg-[var(--color-table-row-background)] hover:bg-[var(--color-table-row-background-hover)]"
  }`;
};

const getRowStyle = () => ({
  color: "var(--color-table-row-text)",
  borderColor: "var(--color-table-row-border)",
});

const tableBodyStyle = "overflow-y-auto flex-1";
const getTableClass = (headerClassName: string = "", className: string = "", showPagination: boolean = false) => {
  const baseClass = "overflow-x-auto table-scrollbar border flex flex-col";
  const roundedClass = headerClassName.includes("!rounded-none")
    ? ""
    : showPagination
      ? "rounded-t-2xl"
      : "rounded-2xl";
  return `${baseClass} ${roundedClass} ${className}`;
};
const tableStyle = {
  borderColor: "var(--color-table-row-border)",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
};

const SortableTableRow = ({
  id,
  cells,
  headers,
  rowClassName = "",
  columnWidths = {},
  isDragging = false,
  isSelected = false,
}: {
  id: string;
  cells: React.ReactNode[];
  headers: (string | React.ReactNode)[];
  rowClassName?: string | ((rowData: Record<string, CellContent>, index: number) => string);
  columnWidths?: Record<string, string>;
  isDragging?: boolean;
  isSelected?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const customClass = typeof rowClassName === "string" ? rowClassName : "";
  const defaultRowClass = getRowClasses(isSelected, customClass);
  const rowStyle = getRowStyle();
  const hasPaddingClass = customClass && /\b(py-|p-)/.test(customClass);
  const tdPadding = hasPaddingClass ? `px-3 ${customClass}` : "px-3 py-2";

  return (
    <tr
      ref={setNodeRef}
      style={{ ...style, ...rowStyle }}
      className={`${defaultRowClass} ${isSortableDragging ? "z-50" : ""}`}
      {...attributes}
    >
      <td
        className={`${tdPadding} cursor-grab active:cursor-grabbing`}
        style={{
          width: "40px",
          borderColor: "var(--color-table-row-border)",
        }}
        {...listeners}
      >
        <div className="flex items-center justify-center w-3">
          <img src="/misc/table-dnd-icon.svg" alt="Drag handle" className="w-full" />
        </div>
      </td>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`${tdPadding} text-table-row-text ${index === 0 ? "text-left" : "text-center"}`}
          style={{
            width: columnWidths[index.toString()],
            borderColor: "var(--color-table-row-border)",
          }}
        >
          {cell}
        </td>
      ))}
    </tr>
  );
};

const TableHeader = ({
  columns,
  headerClassName = "",
  actionColumn = false,
  columnWidths = {},
  draggable = false,
}: {
  columns: (string | React.ReactNode)[];
  headerClassName?: string;
  actionColumn?: boolean;
  columnWidths?: Record<string, string>;
  draggable?: boolean;
}) => {
  const defaultHeaderClass = `px-3 py-2 text-sm font-medium`;
  const headerStyle = {
    backgroundColor: "var(--color-table-header-background)",
    color: "var(--color-table-header-text)",
    borderColor: "var(--color-table-header-border)",
  };

  return (
    <thead>
      <tr style={headerStyle}>
        {draggable && (
          <th
            className={`border-b-1 ${defaultHeaderClass} rounded-tl-2xl text-center `}
            style={{
              width: "40px",
              backgroundColor: "var(--color-table-header-background)",
              color: "var(--color-table-header-text)",
              borderColor: "var(--color-table-header-border)",
            }}
          >
            <div className="flex items-center justify-center w-3"></div>
          </th>
        )}
        {columns.map((column, index) => {
          // If it's already a React node, return as is
          const cellContent = React.isValidElement(column) ? (
            column
          ) : (
            <span style={{ color: "var(--color-table-header-text)" }}>{column}</span>
          );

          return (
            <th
              key={index}
              className={`border-b-1 ${defaultHeaderClass} ${index === 0 ? "text-left" : "text-center"} ${
                index === 0 && !draggable ? "rounded-tl-2xl" : ""
              } ${index === columns.length - 1 && !actionColumn ? "rounded-tr-2xl" : ""} ${headerClassName}`}
              style={{
                width: columnWidths[index.toString()],
                backgroundColor: "var(--color-table-header-background)",
                color: "var(--color-table-header-text)",
                borderColor: "var(--color-table-header-border)",
              }}
            >
              {cellContent}
            </th>
          );
        })}
        {actionColumn && (
          <th
            className={`${defaultHeaderClass} rounded-tr-lg text-center ${headerClassName}`}
            style={{
              width: "10%",
              backgroundColor: "var(--color-table-header-background)",
              color: "var(--color-table-header-text)",
              borderColor: "var(--color-table-header-border)",
            }}
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
  isSelected = false,
  onClick,
}: {
  cells: React.ReactNode[];
  headers: (string | React.ReactNode)[];
  rowClassName?: string | ((rowData: Record<string, CellContent>, index: number) => string);
  columnWidths?: Record<string, string>;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  const customClass = typeof rowClassName === "string" ? rowClassName : "";
  const defaultRowClass = getRowClasses(isSelected, customClass);
  const rowStyle = getRowStyle();
  const hasPaddingClass = customClass && /\b(py-|p-)/.test(customClass);
  const tdPadding = hasPaddingClass ? `px-3 ${customClass}` : "px-3 py-2";

  return (
    <tr className={`${defaultRowClass} ${onClick ? "cursor-pointer" : ""}`} style={rowStyle} onClick={onClick}>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`${tdPadding} text-table-row-text ${index === 0 ? "text-left" : "text-center"}`}
          style={{
            width: columnWidths[index.toString()],
            borderColor: "var(--color-table-row-border)",
          }}
        >
          {cell}
        </td>
      ))}
    </tr>
  );
};

const EmptyRow = ({
  headers,
  actionColumn,
  draggable,
  noDataMessage,
}: {
  headers: (string | React.ReactNode)[];
  actionColumn: boolean;
  draggable: boolean;
  noDataMessage?: string;
}) => {
  return (
    <tr>
      <td
        colSpan={headers.length + (actionColumn ? 1 : 0) + (draggable ? 1 : 0)}
        className="m-auto pt-[50px] text-center"
        style={{
          backgroundColor: "var(--color-table-row-background)",
          color: "var(--color-table-row-text)",
        }}
      >
        <img src="/misc/hexagon-magnifer-icon.svg" alt="No data" className="w-20 m-auto" />
        <span className="text-sm tracking-tight leading-4 text-text-secondary">
          {noDataMessage ? noDataMessage : "No results found"}
        </span>
      </td>
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
  draggable = false,
  onDragEnd,
  selectedRows = [],
  showFooter = true,
  footerRenderer,
  showPagination = false,
  currentPage = 1,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  onRowClick,
  noDataMessage,
}: TableProps) {
  const [items, setItems] = useState(data);

  // Sync local state with data prop changes
  useEffect(() => {
    setItems(data);
  }, [data]);

  // Calculate paginated data
  const paginatedData = showPagination ? data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : data;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((_, index) => `row-${index}` === active.id);
      const newIndex = items.findIndex((_, index) => `row-${index}` === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      setItems(newItems);
      onDragEnd?.(newItems);
    }
  };

  if (draggable) {
    return (
      <div
        className="flex flex-col h-full rounded-2xl"
        style={{ backgroundColor: paginatedData.length > 0 ? "" : "var(--color-background)" }}
      >
        <div className={getTableClass(headerClassName, className, showPagination)} style={tableStyle}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full table-auto">
              <TableHeader
                columns={headers}
                headerClassName={headerClassName}
                actionColumn={actionColumn}
                columnWidths={columnWidths}
                draggable={draggable}
              />
              <tbody className={tableBodyStyle}>
                {items.length === 0 ? (
                  <EmptyRow
                    headers={headers}
                    actionColumn={actionColumn}
                    draggable={draggable}
                    noDataMessage={noDataMessage}
                  />
                ) : (
                  <SortableContext
                    items={items.map((_, index) => `row-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((rowData, index) => {
                      const row = createTableRow(rowData, headers, actionRenderer, index);
                      const rowClass = typeof rowClassName === "function" ? rowClassName(rowData, index) : rowClassName;
                      return (
                        <SortableTableRow
                          key={`row-${index}`}
                          id={`row-${index}`}
                          cells={row}
                          headers={headers}
                          rowClassName={rowClass}
                          columnWidths={columnWidths}
                          isSelected={selectedRows.includes(index)}
                        />
                      );
                    })}
                  </SortableContext>
                )}
              </tbody>

              {selectedRows.length > 0 && showFooter && (
                <tfoot>
                  <tr>
                    <td
                      colSpan={headers.length + (actionColumn ? 1 : 0) + (draggable ? 1 : 0)}
                      className="px-5 py-2 bg-app-background/80 backdrop-blur-md border-t border-primary-divider/50 rounded-b-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-sm">Select all ({selectedRows.length})</span>
                        {footerRenderer && footerRenderer()}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </DndContext>
        </div>
        {showPagination && (
          <TableFooter
            totalRows={data.length}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full rounded-2xl"
      style={{ backgroundColor: paginatedData.length > 0 ? "" : "var(--color-background)" }}
    >
      <div className={getTableClass(headerClassName, className, showPagination)} style={tableStyle}>
        <table className="w-full table-auto relative">
          <TableHeader
            columns={headers}
            headerClassName={headerClassName}
            actionColumn={actionColumn}
            columnWidths={columnWidths}
            draggable={draggable}
          />
          <tbody className={tableBodyStyle}>
            {paginatedData.length === 0 ? (
              <EmptyRow headers={headers} actionColumn={actionColumn} draggable={draggable} />
            ) : (
              paginatedData.map((rowData, index) => {
                const row = createTableRow(rowData, headers, actionRenderer, index);
                const rowClass = typeof rowClassName === "function" ? rowClassName(rowData, index) : rowClassName;
                return (
                  <TableRow
                    key={index}
                    cells={row}
                    headers={headers}
                    rowClassName={rowClass}
                    columnWidths={columnWidths}
                    isSelected={selectedRows.includes(index)}
                    onClick={() => onRowClick?.(rowData, index)}
                  />
                );
              })
            )}
          </tbody>

          {selectedRows.length > 0 && showFooter && (
            <tfoot>
              <tr>
                <td
                  colSpan={headers.length + (actionColumn ? 1 : 0)}
                  className="px-5 py-2 bg-app-background/80 backdrop-blur-md border-t border-primary-divider/50 rounded-b-2xl"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Select all ({selectedRows.length})</span>
                    {footerRenderer && footerRenderer()}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {showPagination && (
        <TableFooter
          totalRows={data.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </div>
  );
}
