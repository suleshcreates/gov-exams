import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to home page's contact form section
        navigate('/#contact-form', { replace: true });
    }, [navigate]);

    return null;
};

export default ContactUs;
