import axios from "axios";
import { toast, Bounce } from "react-toastify";

export async function handleSubmit(operation, username, password, confirmPassword, setGlobalIsLoggedIn, setGlobalUsername, navigate) {
    try {
        let response;
        const apiUrl = 'http://localhost:3000'; // Change to your local server URL
        
        if (operation === 'login') {
            response = await axios.post(`${apiUrl}/login`,
                { username, password },
            );
        } else if (operation === 'signup') {
            response = await axios.post(`${apiUrl}/signup`,
                { username, password, confirmPassword },
            );
        } else {
            response = await axios.get(`${apiUrl}/logout`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                }
            );
        }
        
        const data = response.data;
        
        if (data.status === 'success') {
            toast.success(`${data.message}`, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });

            setGlobalUsername(username);
            if (operation === 'logout') {
                setGlobalIsLoggedIn(false);
                sessionStorage.removeItem('jwt_token');
            } else {
                setGlobalIsLoggedIn(true);
                sessionStorage.setItem('jwt_token', data.jwt_token);
            }
            navigate('/');
        } else {
            console.log(data.message);
            toast.error(`${data.message}`, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            navigate('/register');
        }
    } catch (e) {
        console.log(e.message);
        toast.error(`Error while ${operation}`, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    }
}
