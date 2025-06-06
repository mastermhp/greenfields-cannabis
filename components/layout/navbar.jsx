"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Package,
  ShoppingCart,
  Gift,
  LogOut,
  Settings,
  ShieldIcon as ShieldUser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"

// Particle animation component - client-side only
const ParticleEffect = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/40"
          initial={{
            x: `${Math.random() * 100 - 50}%`,
            y: `${Math.random() * 100 - 50}%`,
            opacity: 0.1 + Math.random() * 0.3,
          }}
          animate={{
            x: [`${Math.random() * 100 - 50}%`, `${Math.random() * 100 - 50}%`, `${Math.random() * 100 - 50}%`],
            y: [`${Math.random() * 100 - 50}%`, `${Math.random() * 100 - 50}%`, `${Math.random() * 100 - 50}%`],
            opacity: [0.1 + Math.random() * 0.3, 0.5, 0.1 + Math.random() * 0.3],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

// Animated nav link component
const NavLink = ({ href, name, isActive }) => {
  return (
    <Link href={href} className="group relative">
      <div className="flex items-center space-x-1.5 px-1 py-1">
        <span
          className={`relative font-medium transition-all duration-1000 ${isActive ? "text-[#D4AF37]" : "text-white group-hover:text-[#D4AF37]"}`}
        >
          {name}
        </span>
      </div>

      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/80 via-[#F5D76E] to-[#D4AF37]/80"
        initial={{ width: isActive ? "100%" : "0%" }}
        animate={{ width: isActive ? "100%" : "0%" }}
        exit={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-md bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
        whileHover={{ opacity: 1 }}
      />
    </Link>
  )
}

// Dropdown menu component with enhanced animations
const DropdownMenu = ({ items, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 1,
          }}
          className="absolute top-full left-0 mt-1 w-56 z-50 overflow-hidden"
        >
          <motion.div
            className="bg-gradient-to-b from-black to-[#111] border border-[#333] shadow-[0_0_25px_rgba(212,175,55,0.15)] rounded-md backdrop-blur-md"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 * idx }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all duration-1000"
                  onClick={onClose}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Cart notification badge with pulse animation
const CartBadge = ({ count }) => {
  return (
    <div className="absolute -top-2 -right-2">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
        <div className="absolute inset-0 rounded-full bg-[#D4AF37] blur-sm opacity-50 animate-pulse" />
        <div className="bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center relative z-10">
          {count}
        </div>
      </motion.div>
    </div>
  )
}

// Main Navbar component
const Navbar = () => {
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const { cartItems = [], cartTotal } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef(null)
  const controls = useAnimation()

  // Enhanced nav links
  const navLinks = [
    { name: "HOME", href: "/" },
    {
      name: "PRODUCTS",
      href: "/products",
      dropdown: [
        { name: "All Products", href: "/products" },
        { name: "Flower", href: "/products?category=flower" },
        { name: "Pre-Rolls", href: "/products?category=pre-rolls" },
        { name: "Edibles", href: "/products?category=edibles" },
        { name: "Concentrates", href: "/products?category=concentrates" },
        { name: "Accessories", href: "/products?category=accessories" },
        { name: "Cansdales", href: "/products?category=cansdales" },
        { name: "Apparel", href: "/products?category=apparel" },
      ],
    },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
    {
      name: "INFORMATION",
      href: "#",
      dropdown: [
        { name: "FAQs", href: "/faqs" },
        { name: "Track Order", href: "/track-order" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Terms & Conditions", href: "/terms-conditions" },
      ],
    },
  ]

  // Determine account link based on user role
  const getAccountLink = () => {
    if (!isAuthenticated) return "/login"
    return user?.role === "admin" ? "/admin" : "/account"
  }

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
        controls.start({
          height: "70px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        })
      } else {
        setIsScrolled(false)
        controls.start({
          height: "90px",
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(0, 0, 0, 0)",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [controls])

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 300)
    }
  }, [isSearchOpen])

  // Close mobile menu and dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking outside dropdown container
      if (activeDropdown !== null && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null)
      }

      // Close mobile menu if clicking outside mobile menu container
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-menu-container") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)

    // Body scroll lock for mobile menu
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen, activeDropdown])

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setActiveDropdown(null)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 },
    },
  }

  // Action button variants
  const actionButtonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={controls}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-1000"
      >
        {/* Gradient border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

        {/* Particle effect background */}
        <ParticleEffect />

        <div className="container mx-auto px-4 ">
          <div className="flex items-center justify-between h-full ">
            {/* Logo with animation */}
            <Link href="/" className="relative z-50 cursor-pointer">
              <motion.div
                className="flex items-center "
                variants={logoVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <div className="relative">
                  <motion.div
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0 opacity-0"
                    animate={{
                      opacity: [0, 0.5, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <Image src="/logo.png" alt="Greenfields Logo" width={100} height={100} className="object-cover w-28 h-28" />
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation with enhanced animations */}
            {!isMobile && (
              <motion.nav
                className="hidden md:flex items-center space-x-6  p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {navLinks.map((link, index) => (
                  <div key={index} className="relative group dropdown-container">
                    {link.dropdown ? (
                      <div
                        className="relative"
                        onMouseEnter={() => !isMobile && setActiveDropdown(index)}
                        onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                      >
                        <button
                          className="flex items-center space-x-1.5 px-1 py-1 group"
                          onClick={() => isMobile && toggleDropdown(index)}
                        >
                          <span
                            className={`relative font-medium transition-all duration-1000 ${
                              activeDropdown === index ? "text-[#D4AF37]" : "text-white group-hover:text-[#D4AF37]"
                            }`}
                          >
                            {link.name}
                          </span>
                          <motion.div
                            animate={{ rotate: activeDropdown === index ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-all duration-1000 ${
                                activeDropdown === index ? "text-[#D4AF37]" : "text-white group-hover:text-[#D4AF37]"
                              }`}
                            />
                          </motion.div>
                        </button>

                        <DropdownMenu
                          items={link.dropdown}
                          isOpen={activeDropdown === index}
                          onClose={() => setActiveDropdown(null)}
                        />
                      </div>
                    ) : (
                      <NavLink href={link.href} name={link.name} isActive={pathname === link.href} />
                    )}
                  </div>
                ))}
              </motion.nav>
            )}

            {/* Action Buttons with enhanced animations */}
            <motion.div
              className="flex items-center space-x-3 md:space-x-5   p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Search Button */}
              <motion.button
                variants={actionButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="relative cursor-pointer"
                aria-label="Search"
              >
                <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <Search size={24} className="text-white hover:text-[#D4AF37] transition-colors duration-1000" />
                {isSearchOpen && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#D4AF37] rounded-full"
                    layoutId="navIndicator"
                  />
                )}
              </motion.button>

              {/* User Account - Updated to redirect based on role */}
              <motion.div
                variants={actionButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="relative hidden sm:block"
              >
                <Link href={getAccountLink()} className="relative cursor-pointer" aria-label="Account">
                  <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/40 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
                  {user?.role === "admin" ? (
                    <ShieldUser
                      size={24}
                      className="bg-[#D4AF37]/90 h-full w-full rounded-full text-white hover:text-[#D4AF37] transition-colors duration-1000"
                    />
                  ) : (
                    <User size={24} className="text-white hover:text-[#D4AF37] transition-all duration-700" />
                  )}
                  {(pathname === "/account" || pathname === "/admin" || pathname === "/login") && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#D4AF37] rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </Link>
              </motion.div>

              {/* Loyalty */}
              <motion.div
                variants={actionButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="relative hidden sm:block"
              >
                <Link href="/loyalty" className="relative cursor-pointer" aria-label="Loyalty">
                  <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/40 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
                  <Sparkles size={24} className="text-white hover:text-[#D4AF37] transition-colors duration-1000" />
                  {pathname === "/loyalty" && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#D4AF37] rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </Link>
              </motion.div>

              {/* Cart with animated badge */}
              <motion.div
                variants={actionButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="relative cursor-pointer "
              >
                <Link href="/cart" className="relative cursor-pointer " aria-label="Cart">
                  <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/40 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
                  <ShoppingBag size={24} className="text-white hover:text-[#D4AF37] transition-colors duration-1000" />
                  {cartItems.length > 0 && <CartBadge count={cartItems.length} />}
                  {pathname === "/cart" && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#D4AF37] rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </Link>
              </motion.div>

              {/* Mobile Menu Toggle with animation */}
              {isMobile && (
                <motion.button
                  variants={actionButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(!isMenuOpen)
                  }}
                  className="relative z-50 p-2 mobile-menu-toggle"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                  <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/10 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X size={24} className="text-[#D4AF37]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu size={24} className="text-white hover:text-[#D4AF37] transition-colors duration-1000" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Enhanced Search Bar with animations */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-4"
              >
                <motion.form
                  onSubmit={handleSearch}
                  className="relative"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37]" size={18} />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products..."
                      className="pl-12 pr-32 py-6 bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-md h-14 text-white placeholder:text-gray-400 focus:ring-[#D4AF37]/30 focus:ring-2 transition-all duration-1000"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsSearchOpen(false)}
                        className="text-gray-400 hover:text-white hover:bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#D4AF37] text-black font-medium px-4 rounded-md transition-all duration-1000"
                      >
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Quick search suggestions */}
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-[#333] rounded-md shadow-lg z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    <div className="p-3 border-b border-[#333]">
                      <p className="text-sm text-gray-400">Popular Searches</p>
                    </div>
                    <div className="p-2">
                      {["Indica", "Sativa", "Hybrid", "Pre-Rolls", "Edibles"].map((term, i) => (
                        <motion.button
                          key={i}
                          type="button"
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-white hover:bg-[#D4AF37]/10 rounded-md transition-colors duration-200"
                          onClick={() => {
                            setSearchQuery(term)
                            searchInputRef.current?.focus()
                          }}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <Search size={14} className="text-gray-400" />
                          <span>{term}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Enhanced Mobile Menu with animations and effects */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 /95 backdrop-blur-md z-40 mobile-menu-container"
            style={{ paddingTop: "90px" }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#D4AF37]/5 blur-[100px]"
                animate={{
                  x: [50, -50, 50],
                  y: [50, -30, 50],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-[#D4AF37]/5 blur-[80px]"
                animate={{
                  x: [-30, 30, -30],
                  y: [30, -50, 30],
                }}
                transition={{
                  duration: 18,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="container mx-auto px-4 h-full overflow-y-auto py-8 pointer-events-auto">
              {/* User info if authenticated */}
              {isAuthenticated && (
                <motion.div
                  className="mb-8 bg-[#111] border border-[#333] rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      {user?.role === "admin" ? (
                        <Settings size={24} className="text-[#D4AF37]" />
                      ) : (
                        <User size={24} className="text-[#D4AF37]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.name || "User"}</p>
                      <p className="text-gray-400 text-sm">{user?.email || "user@example.com"}</p>
                      {user?.role === "admin" && <p className="text-[#D4AF37] text-xs font-medium">Administrator</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Main navigation */}
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    {link.dropdown ? (
                      <div className="mb-2">
                        <button
                          className="flex items-center justify-between w-full p-3 text-xl font-medium text-white hover:bg-[#D4AF37]/10 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleDropdown(index)
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={activeDropdown === index ? "text-[#D4AF37]" : "text-white"}>
                              {link.name}
                            </span>
                          </div>
                          <motion.div
                            animate={{ rotate: activeDropdown === index ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown
                              size={20}
                              className={activeDropdown === index ? "text-[#D4AF37]" : "text-white"}
                            />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {activeDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-10 mt-1 space-y-1 overflow-hidden"
                            >
                              {link.dropdown.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: 0.05 * idx }}
                                >
                                  <Link
                                    href={item.href}
                                    className="flex items-center space-x-2 p-3 text-gray-300 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      closeMenu()
                                    }}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70" />
                                    <span>{item.name}</span>
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center space-x-3 p-3 text-xl font-medium rounded-lg transition-all duration-200 ${
                          pathname === link.href
                            ? "text-[#D4AF37] bg-[#D4AF37]/10"
                            : "text-white hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          closeMenu()
                        }}
                      >
                        <span>{link.name}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Quick actions */}
              <motion.div
                className="mt-8 border-t border-[#333] pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <p className="text-gray-400 text-sm mb-4 px-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    className="flex flex-col items-center justify-center p-4 bg-[#111] border border-[#333] rounded-lg hover:border-[#D4AF37]/50 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeMenu()
                    }}
                  >
                    <ShoppingCart size={24} className="text-[#D4AF37] mb-2" />
                    <span className="text-white text-sm">Cart ({cartItems.length})</span>
                  </Link>

                  <Link
                    href="/loyalty"
                    className="flex flex-col items-center justify-center p-4 bg-[#111] border border-[#333] rounded-lg hover:border-[#D4AF37]/50 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeMenu()
                    }}
                  >
                    <Gift size={24} className="text-[#D4AF37] mb-2" />
                    <span className="text-white text-sm">Rewards</span>
                  </Link>

                  <Link
                    href={getAccountLink()}
                    className="flex flex-col items-center justify-center p-4 bg-[#111] border border-[#333] rounded-lg hover:border-[#D4AF37]/50 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeMenu()
                    }}
                  >
                    {user?.role === "admin" ? (
                      <Settings size={24} className="text-[#D4AF37] mb-2" />
                    ) : (
                      <User size={24} className="text-[#D4AF37] mb-2" />
                    )}
                    <span className="text-white text-sm">{user?.role === "admin" ? "Admin Panel" : "Account"}</span>
                  </Link>

                  <Link
                    href="/track-order"
                    className="flex flex-col items-center justify-center p-4 bg-[#111] border border-[#333] rounded-lg hover:border-[#D4AF37]/50 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeMenu()
                    }}
                  >
                    <Package size={24} className="text-[#D4AF37] mb-2" />
                    <span className="text-white text-sm">Track Order</span>
                  </Link>
                </div>
              </motion.div>

              {/* Footer actions */}
              {isAuthenticated ? (
                <motion.div
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <button
                    className="flex items-center space-x-2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle logout
                      closeMenu()
                    }}
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center space-x-2 w-full p-3 bg-[#D4AF37] text-black font-medium rounded-lg hover:bg-[#B8860B] transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeMenu()
                    }}
                  >
                    <User size={18} />
                    <span>Sign In / Register</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
