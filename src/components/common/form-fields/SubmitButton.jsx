"use client";

import { Button } from "react-bootstrap";

export const SubmitButton = ({ title = "Submit", icon = "send", pending }) => {

    const iconSrc = pending ? "pi pi-spin pi-spinner" : `pi pi-${icon}`

  return <Button type="submit" variant="outline-primary" >
    {
        !!icon && (
            <i className={iconSrc}></i>
        )
    }
    &nbsp;
    {title}
  </Button>;
};
