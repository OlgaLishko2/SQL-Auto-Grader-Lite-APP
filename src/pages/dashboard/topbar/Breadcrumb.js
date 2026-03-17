import { Link } from "react-router-dom";

function Breadcrumb({ items }) {
  return (
    <ol className="breadcrumb p-0 bg-transparentbreadcrumb p-0 bg-transparent mb-0  align-items-center">
      {items.map((item, index) => (
        <li
          key={index}
          className={`breadcrumb-item ${item.active ? "active" : ""}`}
        >
          {item.active ? item.label : <Link to={item.link}>{item.label}</Link>}
        </li>
      ))}
    </ol>
  );
}

export default Breadcrumb;