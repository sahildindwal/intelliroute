import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx";
import { GlobalContext } from "./GlobalContext.jsx";
import { getUserNameFromCookie } from "./utilities/cookie.utility.js";
import "./App.css";

function App() {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        // Load userName from cookie on mount/reload
        const userName = getUserNameFromCookie();
        if (userName) {
            console.log("App.jsx: Setting userName from cookie:", userName);
            dispatch({ type: "SET_USER_NAME", payload: userName });
        }
    }, [dispatch]);

    // Also set userName when user state changes
    useEffect(() => {
        if (state.user && !state.userName) {
            const userName = getUserNameFromCookie();
            if (userName) {
                console.log("App.jsx: User loaded, setting userName:", userName);
                dispatch({ type: "SET_USER_NAME", payload: userName });
            }
        }
    }, [state.user, state.userName, dispatch]);

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default App;
