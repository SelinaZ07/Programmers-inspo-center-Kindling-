import {Link} from "react-router-dom";

function Navbar() {
    return (
        <nav id="header">
            <Link to= "/">About</Link>
            <Link to="/inspirations">Inspirations</Link>
            <Link to="/profile">Profile</Link>
        </nav>
    );
}

export default Navbar;