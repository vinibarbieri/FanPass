import React from "react";

const NavLink = ({ href, children }) => (
  <li>
    <a href={href} className="text-white text-base px-4 py-4 rounded-md">
      {children}
    </a>
  </li>
);

export default NavLink;
