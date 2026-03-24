import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
                {items.map((item, index) => (
                    <li key={index} className={`breadcrumb-item${index === items.length - 1 ? " active" : ""}`}>
                        {index === items.length - 1 ? item.label : <Link to={item.path}>{item.label}</Link>}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
