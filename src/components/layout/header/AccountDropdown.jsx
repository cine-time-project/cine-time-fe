import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

export default function AccountDropdown({ L, tNav }) {
  return (
    <NavDropdown
      title={
        <span className="account-title">
          <svg
            className="account-icon"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" />
            <path d="M12 13a9 9 0 0 0-9 9 1 1 0 0 0 1 1h16a1 1 0 0 0 1-1 9 9 0 0 0-9-9Zm-6.93 8a7 7 0 0 1 13.86 0Z" />
          </svg>{" "}
          {tNav("account")}
        </span>
      }
      id="user-dropdown"
      align="end"
    >
      <NavDropdown.Item as={Link} href={L("login")}>
        {tNav("login")}
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} href={L("register")}>
        {tNav("register")}
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} href={L("mytickets")}>
        {tNav("myTickets")}
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item as={Link} href={L("logout")}>
        {tNav("logout")}
      </NavDropdown.Item>
    </NavDropdown>
  );
}