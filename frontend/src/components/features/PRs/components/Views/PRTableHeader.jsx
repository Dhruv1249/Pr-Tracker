function PRTableHeader() {
  return (
    <thead className="bg-surface-elev text-xs uppercase text-secondary">
      <tr>
        <th className="px-4 py-2 text-left font-medium">PR</th>
        <th className="px-4 py-2 text-left font-medium">Branch</th>
        <th className="px-4 py-2 text-left font-medium">Author</th>
        <th className="px-4 py-2 text-left font-medium">Status</th>
        <th className="px-4 py-2 text-left font-medium">Tags</th>
        <th className="px-4 py-2 text-left font-medium">Updated</th>
      </tr>
    </thead>
  );
}

export default PRTableHeader;