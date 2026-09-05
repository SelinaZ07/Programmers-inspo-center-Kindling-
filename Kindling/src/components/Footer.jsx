import {Link} from "react-router-dom";

function Footer () {
    return(
        <footer className="footer">
            <div className = "footer-content">
                <div className="footer-content">
                    <div className="footer-left">
                        <img src="/logo.png" alt="Kindling Logo" className= "footer-logo"/>

                        <span className="footer-title">Kindling</span>
                    </div>

                    <div className = "footer-links">
                        <Link to= "mailto:08selinazhang@gmail.com">Contact Us</Link>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
}

export default Footer;