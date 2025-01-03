import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Suspense, lazy } from 'react';
import { BarLoader } from 'react-spinners';
import { ThemeProvider } from "@/components/theme-provider"

const LandingPage = lazy(() => import('@/pages/landing-page.jsx'))
const MainLayout = lazy(() => import('./main-layout.jsx'))
const Auth = lazy(() => import('@/pages/auth.jsx'))


function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <MainLayout />,
            children: [
                {
                    path: '/',
                    element: (
                        <Suspense fallback={<BarLoader className="w-full h-full " />}>
                            <LandingPage />
                        </Suspense>
                    )
                },
             
            ]
        },{
            path : '/auth',
            element : <Suspense fallback={<BarLoader className='w-full h-full'/>}><Auth /></Suspense>
        }
    ])

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    )

}

export default App
