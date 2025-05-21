"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingCart, User, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useMobile } from "@/hooks/use-mobile"

const Navbar = () => {
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const { cartItems, cartTotal } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "Products",
      href: "/products",
      dropdown: [
        { name: "All Products", href: "/products" },
        { name: "Flower", href: "/products?category=flower" },
        { name: "Pre-Rolls", href: "/products?category=pre-rolls" },
        { name: "Edibles", href: "/products?category=edibles" },
        { name: "Concentrates", href: "/products?category=concentrates" },
        { name: "Accessories", href: "/products?category=accessories" },
      ],
    },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    {
      name: "Information",
      href: "#",
      dropdown: [
        { name: "FAQs", href: "/faqs" },
        { name: "Track Order", href: "/track-order" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Terms & Conditions", href: "/terms-conditions" },
      ],
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const toggleDropdown = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(index)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Greenfields Logo"
                width={180}
                height={100}
                className="mr-2"
              />
              {/* <span className={`text-xl font-bold gold-text ${isMenuOpen && isMobile ? "text-[#D4AF37]" : ""}`}>
                GREENFIELDS
              </span> */}
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <div key={index} className="relative group">
                  {link.dropdown ? (
                    <button
                      className={`flex items-center text-white hover:text-[#D4AF37] transition-colors ${
                        activeDropdown === index ? "text-[#D4AF37]" : ""
                      }`}
                      onClick={() => toggleDropdown(index)}
                    >
                      {link.name}
                      <ChevronDown size={16} className="ml-1" />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`text-white hover:text-[#D4AF37] transition-colors ${
                        pathname === link.href ? "text-[#D4AF37]" : ""
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {link.dropdown && (
                    <AnimatePresence>
                      {activeDropdown === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-black border border-[#333] shadow-lg z-50"
                        >
                          {link.dropdown.map((item, idx) => (
                            <Link
                              key={idx}
                              href={item.href}
                              className="block px-4 py-3 text-white hover:bg-[#111] hover:text-[#D4AF37] transition-colors"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-[#D4AF37] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* User Account */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="text-white hover:text-[#D4AF37] transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative" aria-label="Cart">
              <ShoppingCart size={20} className="text-white hover:text-[#D4AF37] transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-[#D4AF37] transition-colors relative z-50"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12 pl-10"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Button
                  className="absolute right-0 top-0 h-full bg-[#D4AF37] hover:bg-[#B8860B] text-black rounded-none px-4"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Search
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 pt-20"
          >
            <div className="container mx-auto px-4 h-full overflow-y-auto">
              <nav className="flex flex-col space-y-6 py-8">
                {navLinks.map((link, index) => (
                  <div key={index}>
                    {link.dropdown ? (
                      <div>
                        <button
                          className={`flex items-center justify-between w-full text-xl font-medium ${
                            activeDropdown === index ? "text-[#D4AF37]" : "text-white"
                          }`}
                          onClick={() => toggleDropdown(index)}
                        >
                          {link.name}
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${
                              activeDropdown === index ? "rotate-180 text-[#D4AF37]" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 ml-4 space-y-4 overflow-hidden"
                            >
                              {link.dropdown.map((item, idx) => (
                                <Link
                                  key={idx}
                                  href={item.href}
                                  className="block text-beige hover:text-[#D4AF37] transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={`text-xl font-medium ${
                          pathname === link.href ? "text-[#D4AF37]" : "text-white"
                        } hover:text-[#D4AF37] transition-colors`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <div className="border-t border-[#333] py-6 mt-6">
                <div className="flex flex-col space-y-4">
                  <Link
                    href={isAuthenticated ? "/account" : "/login"}
                    className="flex items-center text-white hover:text-[#D4AF37] transition-colors"
                  >
                    <User size={20} className="mr-2" />
                    {isAuthenticated ? "My Account" : "Login / Register"}
                  </Link>
                  <Link href="/cart" className="flex items-center text-white hover:text-[#D4AF37] transition-colors">
                    <ShoppingCart size={20} className="mr-2" />
                    Cart ({cartItems.length}) - ${cartTotal.toFixed(2)}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
