function ResultTable({ title, result }) {
  return (
    <div className="result-table">
      <h6>{title}</h6>
      {!result[0]?.lc ? (
        <span className="empty-state">~ no response on stdout ~</span>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {result[0].lc.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result[0].values.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td
                    key={j}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ResultTable;
