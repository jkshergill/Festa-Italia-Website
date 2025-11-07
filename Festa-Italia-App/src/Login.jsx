import { useEffect } from 'react';
import './Login.css';

function Login() {
    useEffect(() => {
        document.body.id = 'login-body-id';
        document.body.className = 'login-body';
    }, []);
    return (
        <div className="form__container">
            <form autoComplete="off" className="form" method="POST">
                <p className="form__title">Login</p>
                <p className="form__message">Login now to view your dashboard</p>
                    <div className="form__group">
                        <label>
                            <input type="text" name="FirstName" placeholder="First Name" required />
                        </label>
                        <label>
                            <input type="text" name="LastName" placeholder="Last Name" required />
                        </label>
                    </div>
                    <label>
                        <input type="text" name="Email" placeholder="Email" required />
                    </label>
                    <label>
                        <input type="password" name="Password" placeholder="Password" required />
                    </label>
                    <button type="submit" className="form__submit">Submit</button>
                    <p className="form__login--redirect">Don't have an account? <a href="#" className="form__signup--link">Sign Up</a></p>
                    <p className="form__forgot-password"><a href="#" className="form__forgot-password--link">Forgot Password?</a></p>
            </form>
        </div>
    );
}

export default Login;
