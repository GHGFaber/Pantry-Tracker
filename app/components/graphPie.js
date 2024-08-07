import { React, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";

export default function pieGraph() {
  const [inventory, setInventory] = useState([
    { name: "Item A", quantity: 10 },
    { name: "Item B", quantity: 15 },
    { name: "Item C", quantity: 20 },
  ]);

  // Transform the inventory data to the format required by the PieChart component
  const chartData = inventory.map((item, index) => ({
    id: index,
    value: item.quantity,
    label: item.name,
  }));

  return (
    <PieChart
      series={[
        {
          data: chartData,
        },
      ]}
      width={400}
      height={200}
    />
  );
}
