"use client";

import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ( {children }) => {
    const [user, setUser] = useState(null)

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Update localStorage whenever user changes
    useEffect(() => {
        if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        } else {
        localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};