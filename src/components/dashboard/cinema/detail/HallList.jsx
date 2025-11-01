"use client";
import { Accordion } from "react-bootstrap";
import HallCard from "./HallCard";

export default function HallList({ halls }) {
  if (!halls.length)
    return <p className="text-muted">No halls found for this cinema.</p>;

  return (
    <Accordion>
      {halls.map((hall, index) => (
        <Accordion.Item eventKey={index.toString()} key={hall.id}>
          <Accordion.Header>
            {hall.name}{" "}
            <span className="text-muted ms-2">
              ({hall.isSpecial ? "Special" : "Standard"})
            </span>
          </Accordion.Header>
          <Accordion.Body>
            <HallCard hall={hall} />
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
