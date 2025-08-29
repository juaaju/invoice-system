"use client";
import { useEffect, useState } from "react";

type Spreadsheet = {
  id: string;
  name: string;
  spreadsheetUrl: string;
  userId: string;
};

export default function DashboardClient() {
  const [sheets, setSheets] = useState<Spreadsheet[]>([]);

  useEffect(() => {
    fetch("/api/spreadsheets")
      .then(res => res.json())
      .then((data) => setSheets(data as Spreadsheet[]));
  }, []);

  return (
    <div>
      <h1>My Spreadsheets</h1>
      <ul>
        {sheets.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}
