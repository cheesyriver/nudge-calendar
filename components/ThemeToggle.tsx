"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

function ThemeToggle() {
    const {theme, setTheme } = useTheme()
    const [ mounted, setMounted ] = useState(false)

    const handleClick = () => {
        if(theme === "dark")setTheme("light")
        if(theme === "light")setTheme("dark")
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
        <button className="h-10 w-10 bg-(--base-color) rounded-full flex items-center justify-center px-2.5 hover:cursor-pointer hover:bg-(--base-variant) animate-pulse" />
        )
    }


    return (
        <Button className="h-10 w-10 rounded-full flex items-center justify-center px-2.5 hover:cursor-pointer hover:bg-(--base-variant) transition-all duration-[0.4s]" onClick={ handleClick }>
            {theme === "dark" ? <Moon className="size-6" />: <Sun className="size-6" />}
        </Button>
    )
}

export default ThemeToggle
