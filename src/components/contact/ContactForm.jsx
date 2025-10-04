import { Col, Row } from "react-bootstrap";
import { TextInput } from "../common/FormControls/TextInput";
import { SubmitButton } from "../common/FormControls/SubmitButton";
import { createContactMessageAction } from "@/action/contact-actions";
import { useActionState, useRef } from "react";
import { swAlert } from "@/helpers/sweetalert";

export const ContactForm = () => {

    const [state, formAction, isPending] = useActionState(
      createContactMessageAction
    );

    const refForm = useRef(null);

    if(state?.message){
        if(state.ok){
            swAlert(state.message, "success");
            refForm.current.reset();
        } else{
            swAlert(state.message, "error");
        }
    }

  return (
    <form className="contact-form" action={formAction} ref={refForm}>
      <Row>
        <Col md={6}>
          <TextInput
            className="mb-3"
            name="name"
            label="Your name"
            iconBefore="user"
            errorMessage={state?.errors?.name}
          />
        </Col>
        <Col md={6}>
          <TextInput
            className="mb-3"
            name="email"
            label="Your email"
            iconBefore="envelope"
            errorMessage={state?.errors?.email}
          />
        </Col>
         <Col md={6}>
          <TextInput
            className="mb-3"
            name="phonenumber"
            label="Your phone number"
            iconBefore="envelope"
            errorMessage={state?.errors?.email}
          />
        </Col>
        <Col xs={12}>
          <TextInput
            className="mb-3"
            name="subject"
            label="Your subject"
            iconBefore="tag"
            errorMessage={state?.errors?.subject}
          />
        </Col>
        <Col xs={12}>
          <TextInput
            className="mb-3"
            name="message"
            label="Your message"
            iconBefore="comment"
            errorMessage={state?.errors?.message}
          />
        </Col>
      </Row>
      <SubmitButton pending={isPending} />
    </form>
  );
};
