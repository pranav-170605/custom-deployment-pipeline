"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  Search,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
  Database,
  FileText,
  BarChart3,
  Package,
  Box
} from "lucide-react"

interface MenuItem {
  id: string
  icon: LucideIcon
  label: string
  path?: string
}

interface IconBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const IconBar: React.FC<IconBarProps> = ({ collapsed, onToggle }) => {
  const [expanded, setExpanded] = useState<boolean>(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const router = useRouter()
  const pathname = usePathname()

  // Listen for canvas render event to ensure proper initialization
  useEffect(() => {
    const handleCanvasRender = () => {
      // Initialize in collapsed state to match reference
      setExpanded(false)
    }

    // Listen for window resize to close expanded sidebar on small screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpanded(false)
      }
    }

    document.addEventListener("canvasRender", handleCanvasRender)
    window.addEventListener("resize", handleResize)
    
    return () => {
      document.removeEventListener("canvasRender", handleCanvasRender)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const menuItems: MenuItem[] = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "projects", icon: FileText, label: "Projects" },
    { id: "datasources", icon: Database, label: "Data Sources" },
    { id: "search", icon: Search, label: "Search" },
    { id: "help", icon: HelpCircle, label: "Help & Documentation" },
    { id: "settings", icon: Settings, label: "Workspace Settings" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "packages", icon: Package, label: "Packages" },
  ]

  const activeMenuItem = menuItems.find((item) => item.path === pathname) || menuItems[0]

  const toggleSidebar = (): void => {
    setExpanded((prevState) => !prevState)
    onToggle()
  }

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen((prevState) => !prevState)
  }

  const handleNavigation = (item: MenuItem) => {
    if (item.path) {
      router.push(item.path)
    }
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="block md:hidden fixed top-0 left-0 p-2 z-30">
        <button onClick={toggleMobileMenu} className="flex items-center p-1">
          <Box size={24} className="text-white" />
        </button>
      </div>

      {/* Mobile Menu - Only visible when toggled on small screens */}
      <div 
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "bg-opacity-50 visible" : "bg-opacity-0 invisible"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`bg-teal-700 text-white w-64 h-full flex flex-col transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Box size={24} />
              <h2 className="font-semibold ml-2">IK-EDA</h2>
            </div>
            <button onClick={toggleMobileMenu}>
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="w-full h-px bg-teal-600"></div>
          <div className="flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className="flex items-center w-full py-4 px-6 transition-colors hover:bg-teal-600"
              >
                <item.icon size={24} className="text-white" />
                <span className="ml-4 text-white">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop sidebar - Hidden on small screens, full height for all larger screens */}
      <div className="hidden md:block h-screen fixed left-0 top-0 z-20">
        <div 
          className={` text-white flex flex-col h-full transition-all duration-300 ease-in-out ${
            expanded ? "w-64" : "w-16"
          }`}
          style={{ backgroundColor: "#069987" }}
        >
          {/* Header with logo and chevron */}
          <div className={`p-4 flex items-center relative ${expanded ? "justify-start" : "justify-center"}`}>
            <Box size={24} className="text-white " />
            <div 
              className={`ml-2 whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                expanded ? "opacity-100" : "opacity-0 absolute"
              }`}
            >
              <span className="font-semibold text-white">IK-EDA</span>
            </div>
            <button
              onClick={toggleSidebar}
              className={`text-white flex items-center justify-center rounded-full p-1 hover:bg-gray-200 hover:text-teal-600 transition-colors ${
                expanded ? "absolute right-2" : "absolute right-0"
              }`}
            >
              {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          {/* Divider line */}
          <div className="w-full h-px bg-teal-600"></div>
          
          {/* Menu items */}
          <div className="flex-1 flex flex-col">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex items-center w-full py-4 ${
                  expanded ? "px-4 justify-start" : "justify-center"
                } transition-colors hover:bg-teal-600`}
              >
                <item.icon size={24} className="text-white" />
                <div 
                  className={`ml-4 whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                    expanded ? "opacity-100" : "opacity-0 absolute"
                  }`}
                >
                  <span className="text-white">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content area margin on medium screens and above - with smooth transition */}
      <div 
        className={`hidden md:block transition-all duration-300 ease-in-out ${
          expanded ? "md:ml-64" : "md:ml-16"
        }`}
      >
        {/* This div creates space for the main content area */}
      </div>
    </>
  )
}

export default IconBar