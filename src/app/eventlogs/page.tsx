"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { firestore } from "../../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
interface EventRecord {
  id: string;
  type: string;
  value?: string;
  status: string;
  timestamp: string;
}

const EventLogPage = () => {
  const [records, setRecords] = useState<EventRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const hardcodedUID = "Fy4pEk6L8nhSEfcS4MRS94Y4o373";

  // Fetch Firestore data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRef = collection(
          firestore,
          "users",
          hardcodedUID,
          "Eventlogs"
        );
        const q = query(collectionRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data: EventRecord[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<EventRecord, "id">),
        }));
        setRecords(data);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchData();
  }, []);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(records.length / rowsPerPage);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Event Log</h1>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          <HomeIcon className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 font-medium">Home</span>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <Table className="min-w-full border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-blue-500 text-white w-[120px]">
                Record ID
              </TableHead>
              <TableHead className="bg-green-500 text-white">Type</TableHead>
              <TableHead className="bg-indigo-500 text-white">Value</TableHead>
              <TableHead className="bg-purple-500 text-white">Status</TableHead>
              <TableHead className="bg-gray-500 text-white">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.map((record, idx) => (
              <TableRow
                key={record.id}
                className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.value ?? "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      record.status === "warning"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>{record.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex gap-4 mb-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="grid gap-4 mt-6 sm:hidden">
        {currentRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white shadow rounded-lg p-4 border"
          >
            <p className="text-sm font-semibold text-gray-600">Record ID</p>
            <p className="mb-2">{record.id}</p>

            <p className="text-sm font-semibold text-gray-600">Type</p>
            <p className="mb-2">{record.type}</p>

            <p className="text-sm font-semibold text-gray-600">Value</p>
            <p className="mb-2">{record.value ?? "-"}</p>

            <p className="text-sm font-semibold text-gray-600">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                record.status === "warning"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {record.status}
            </span>

            <p className="text-sm font-semibold text-gray-600 mt-2">
              Timestamp
            </p>
            <p>{record.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLogPage;
