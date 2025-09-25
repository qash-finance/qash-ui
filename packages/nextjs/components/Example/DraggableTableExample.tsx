import React, { useState } from "react";
import { Table, CellContent } from "../Common/Table";

const DraggableTableExample = () => {
  const [tableData, setTableData] = useState<Record<string, CellContent>[]>([
    { name: "John Doe", email: "john@example.com", role: "Admin" },
    { name: "Jane Smith", email: "jane@example.com", role: "User" },
    { name: "Bob Johnson", email: "bob@example.com", role: "Moderator" },
    { name: "Alice Brown", email: "alice@example.com", role: "User" },
  ]);

  const handleDragEnd = (newData: Record<string, CellContent>[]) => {
    setTableData(newData);
    console.log("New order:", newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Draggable Table Example</h2>
      <p className="text-gray-600 mb-6">
        Drag the rows by the handle icon to reorder them. The order will be logged to the console.
      </p>

      <Table
        headers={["Name", "Email", "Role"]}
        data={tableData}
        draggable={true}
        onDragEnd={handleDragEnd}
        className="max-w-4xl"
      />

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Current Order:</h3>
        <ol className="list-decimal list-inside">
          {tableData.map((row, index) => (
            <li key={index} className="text-sm">
              {row.name} - {row.role}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default DraggableTableExample;
