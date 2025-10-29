"use client";

import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";

export const BackButton = ({
  title = "Return Back",
  icon = "arrow-circle-left",
  ...rest
}) => {

    const router = useRouter();

    const handleClick = () => {
        router.back();
    }

  return <Button type="button" variant="outline-secondary" {...rest} onClick={handleClick}>
    {
        icon && (
            <>
            <i className={`pi pi-${icon}`}></i>
            </>
        )
    }
  </Button>;
};
