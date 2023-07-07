import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useKeycloak } from "@react-keycloak/web";
import { Link } from 'react-router-dom';
//  <Nav.Link as={Link} to="/default-purchase-limits">Default Purchase Limits</Nav.Link>
const Navigation = () => {
  const { keycloak } = useKeycloak();
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">iNethi</Navbar.Brand>

          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home Page</Nav.Link>

            <Nav.Link as={Link} to="/services">Available Services</Nav.Link>
            <Nav.Link as={Link} to="/packages">Packages</Nav.Link>
            <Nav.Link as={Link} to="/purchase">Purchase</Nav.Link>
            <Nav.Link as={Link} to="/purchase-history">Purchase History</Nav.Link>
          </Nav>
      </Container>
    </Navbar>
  );
}

export default Navigation;
