import React from "react";
import "@/styles/showCSVData.css";
interface VendorData {
  _id?: string;
  vendor: string;
  DeliveryTime: number;
  ReliabilityScore: number;
}
const ShowCSVData2: React.FC<{ dataset: VendorData[] }> = ({ dataset }) => {
  return (
    <div>
      {dataset && dataset.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Delivery Time</th>
              <th>Reliability Score</th>
            </tr>
          </thead>
          <tbody>
            {dataset.map((vendor, index) => (
              <tr key={vendor._id || index}>
                <td>{vendor.vendor}</td>
                <td>{vendor.DeliveryTime}</td>
                <td>{vendor.ReliabilityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No vendor data available.</p>
      )}
    </div>
  );
};
export default ShowCSVData2;