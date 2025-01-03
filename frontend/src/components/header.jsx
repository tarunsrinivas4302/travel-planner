import React, { useState } from 'react';
import { useEffect } from 'react';
import { ModeToggle } from './theme-toggle';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-white"}`}>
            <div className="flex-end">
                <ModeToggle />
            </div>
        </div>
    )
}

export default Header
