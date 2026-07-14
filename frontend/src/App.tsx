import { useEffect } from 'react';
import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {appRoutes} from "./routes/appRoutes.tsx";
import {useAuthStore} from "./stores/authStore.ts";

const router = createBrowserRouter(appRoutes)

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <RouterProvider router={router} />
  )
}
