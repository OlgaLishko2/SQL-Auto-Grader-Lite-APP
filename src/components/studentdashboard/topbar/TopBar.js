import React, { useState, useEffect } from "react";
import { auth, db } from "../../../firebase"; 
import { doc, getDoc } from "firebase/firestore";


const TopBar = () => {
const [userName, setUserName] = useState("");
    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().fullName);
                }
            }
        };
        fetchUserData();
    }, []);


    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <div className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     
                        <span className="text-gray-600 small" style={{ fontWeight: '500' }}>
                            {userName || "Student"}
                        </span>
                        
                   
                        <div style={{
                            width: '35px', 
                            height: '35px', 
                            backgroundColor: '#4e73df', 
                            borderRadius: '50%', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {userName ? userName.charAt(0).toUpperCase() : "S"}
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default TopBar;
