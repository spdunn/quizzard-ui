import { Row, Col } from "react-bootstrap";
import Welcome from "./Welcome";
import Register from "../Register/Register"
import Login from "../Login/Login";
import { authState } from "../../state-slices/auth/auth-slice";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Main = () => {

  const auth = useSelector(authState);

  return (
    <Row className="d-flex justify-content-around">
      <Col md={7} style={{ height: "100%" }}>
        <Welcome />
      </Col>
      <aside className="col-md-4">
        { !auth.showLogin ? <Register /> : <Login /> }
      </aside>

      <Link to="multiplayer">Go To Multiplayer</Link>
    </Row>
  );
};

export default Main;
