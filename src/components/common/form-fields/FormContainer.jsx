import { Card, Col, Container, Row } from "react-bootstrap"

export const FormContainer = ({children}) => {
  return (
    <Container>
        <Row className="justify-content-center">
            <Col md={7} lg={6}
            >

                <Card>
                    <Card.Body className="p-4">
                        {children}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
  )
}
