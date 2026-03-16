import { NavLink } from 'react-router-dom';

const LeftMenu = ({ name, navItems }) => {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
        <div className="sidebar-brand-text mx-3">{name}</div>
      </a>

      <hr className="sidebar-divider my-0"/>

      {navItems.map((item) => (
        <li className="nav-item" key={item.address}>
          <NavLink className="nav-link" to={item.address}>
            <i className={`fas fa-fw ${item.icon}`}></i>
            <span>{item.name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default LeftMenu;