"use client";

import Nav from "react-bootstrap/Nav";
import Link from "next/link";
import { config } from "@/helpers/config";

const menuItems = Object.entries(config.contact.info);

export const ContactMenu = (props) => {
  return (
    <Nav {...props} className="contact-menu">
      {menuItems.map((item) => (
        <Nav.Link key={item[0]} href={item[1].link} as={Link}>
          <i className={item[1].icon}></i>
          &nbsp;
          {item[1].value}
        </Nav.Link>
      ))}
    </Nav>
  );
};
