import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AuthModal() {
    //the states
    const [isSignUp, setIsSignUp] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Sign in with Google or GitHub
    const handleOAuthLogin = async (provider) => {
        setErrorMessage("");
        setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
        redirectTo: window.location.origin,
        },
    });

    if (error) {
        console.error("OAuth login error:", error);
        setErrorMessage(error.message);
        setLoading(false);
    }};

    // Sign in or create an account with email/password
    const handleEmailAuth = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!email.trim() || !password) {
            setErrorMessage("Please enter your email and password.");
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            });

        if (error) {
            console.error("Sign up error:", error);
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        setSuccessMessage(
        "Account created! Check your email to verify your account."
        );
    } else {
        const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        });

        if (error) {
        console.error("Login error:", error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
        }
    }

    setLoading(false);
};

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <div className="auth-modal-header">

                    <img src="/logo.png" alt="Kindling" className="auth-modal-logo"/>
                    <h2>{isSignUp ? "Create your Kindling account" : "Welcome to Kindling"}</h2>

                    <p>{isSignUp
                        ? "Create an account to start sharing and exploring ideas."
                        : "Sign in to explore and share project ideas."}
                    </p>
                </div>

                <button type="button" className="oauth-button google-button"
                onClick={() => handleOAuthLogin("google")} disabled={loading}>
                Continue with Google
                </button>

                <button type="button" className="oauth-button github-button"
                onClick={() => handleOAuthLogin("github")} disabled={loading}>
                Continue with GitHub
                </button>

                <div className="auth-divider">
                <span>OR</span>
                </div>

                <form onSubmit={handleEmailAuth}>
                    <div className="auth-form-group">
                        <label htmlFor="auth-email">Email</label>

                        <input id="auth-email" type="email" value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="auth-password">Password</label>

                        <input id="auth-password" type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        />
                    </div>

                    {isSignUp && (
                        <div className="auth-form-group">
                            <label htmlFor="auth-confirm-password">
                                Confirm Password
                            </label>

                            <input id="auth-confirm-password" type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                setConfirmPassword(event.target.value)}
                                required
                            />
                        </div>
                    )}

                    {errorMessage && (
                        <p className="auth-error">{errorMessage}</p>
                    )}

                    {successMessage && (
                        <p className="auth-success">{successMessage}</p>
                    )}

                    <button type="submit" className="auth-submit-button" disabled={loading}>
                        {loading
                        ? "Please wait..."
                        : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                    </button>
                </form>

                <div className="auth-switch"> {isSignUp ? (
                    <p>Already have an account?{" "}
                        <button type="button" onClick={() => {
                            setIsSignUp(false);
                            setErrorMessage("");
                            setSuccessMessage("");
                            }}>
                            Sign in
                        </button>
                    </p>
                    ) : (
                    <p>Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => {
                            setIsSignUp(true);
                            setErrorMessage("");
                            setSuccessMessage("");
                            }}>
                            Create account
                        </button>
                    </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthModal;