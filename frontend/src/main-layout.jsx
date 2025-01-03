import React from 'react';
import { Outlet } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"

const MainLayout = () => {
    return (
        <div className="app relative container mx-auto ">
            <header className='sticky min-h-16 w-full'><Header /></header>
            <main className='w-full'><Outlet /></main>
            <footer className=" fixed bottom-0 min-h-48 z-20 w-full flex justify-between items-center">
                <Footer />
            </footer>
        </div>
    )
}

export default MainLayout
