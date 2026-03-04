//Validate Select query only
export function isSelectQuery(query) {
  //check query is empty or not a string
  if (!query || typeof query !== "string") return false;
  const trimedQuery = query.trim();
  const isSelectFormat = /^select\b/i.test(trimedQuery);
  return isSelectFormat;
}

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "OUTER",
  "ON",
  "GROUP",
  "BY",
  "HAVING",
  "ORDER",
  "ASC",
  "DESC",
  "LIMIT",
  "OFFSET",
  "AS",
  "DISTINCT",
  "UNION",
  "ALL",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "BETWEEN",
  "LIKE",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "END",
];

export function normalizeQuery(query) {
  if (typeof query !== "string") return "";

  const keywordPattern = new RegExp(`\\b(${SQL_KEYWORDS.join("|")})\\b`, "gi");
  const lowerKeywords = (segment) =>
    segment.replace(keywordPattern, (token) => token.toLowerCase());

  // Normalize SQL syntax only; keep quoted literals untouched
  const parts = query.split(/('(?:''|[^'])*'|"(?:[^"]|"")*")/);

  return parts
    .map((part, index) => (index % 2 === 0 ? lowerKeywords(part) : part))
    .join("");
}
