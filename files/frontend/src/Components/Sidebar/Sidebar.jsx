import React, { useState, useEffect } from 'react';
import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import menu_icon from '../../assets/menu-icon.png';
import logo from '../../assets/logo.png';

const Sidebar = ({role}) => {
    console.log(role);
    const [mobileMenu, setMobileMenu] = useState(false);
    const toggleMenu = () => {
        setMobileMenu(prev => !prev);
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className={isMobile ? "" : "sidebar"}>
            <img src={logo} alt='' className='logo' />
            <ul className={mobileMenu ? '' : 'hide-mobile-menu'}>
                <li><Link className='text' to='/home'>Home</Link></li>
                {/* <li><Link className='text' to='/model'>Predict</Link></li> */}
                <li><Link className='text' to={role === "client" ? "/user-dashboard" :
                               role === "officer" ? "/officer-dashboard" :
                               role === "manager" ? "/manager-dashboard" : "/home"}>
        Dashboard
    </Link> </li>
                <li><Link className='text' to="/history">History</Link></li>
                <li><Link className='text' to='/home'>Contact us</Link></li>
                <li><span className='text logout' onClick={handleLogout}>Logout</span></li> {/* 👈 Add this */}
            </ul>
            <img src={menu_icon} alt="" className='menu-icon' onClick={toggleMenu} />
        </nav>
    );
};

export default Sidebar;
