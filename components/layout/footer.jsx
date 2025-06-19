"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import NewsletterForm from "@/components/forms/newsletter-form"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState({
    siteName: "Greenfields Cannabis",
    siteDescription:
      "Premium cannabis products crafted with care. Experience the difference with our luxury selection of cannabis flower, edibles, concentrates, and more.",
    contactEmail: "info@greenfields.com",
    contactPhone: "+1 (800) 420-6969",
    address: "123 Cannabis Boulevard\nLos Angeles, CA 90210",
    businessHours: "Monday - Friday: 9:00 AM - 8:00 PM\nSaturday - Sunday: 10:00 AM - 6:00 PM",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()

        if (data.success && data.data) {
          setSettings((prev) => ({
            ...prev,
            ...data.data,
            socialLinks: {
              ...prev.socialLinks,
              ...(data.data.socialLinks || {}),
            },
          }))
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    fetchSettings()
  }, [])

  return (
    <footer className="bg-black border-t border-[#222] pt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <Image src="/logo.png" alt="Greenfields Logo" width={200} height={10} className="mr-2" />
            </div>
            <p className="text-beige mb-6">{settings.siteDescription}</p>
            <div className="flex space-x-4">
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 gold-text">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-beige hover:text-[#D4AF37] transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-beige hover:text-[#D4AF37] transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-beige hover:text-[#D4AF37] transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-beige hover:text-[#D4AF37] transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-beige hover:text-[#D4AF37] transition-colors flex items-center">
                  <ArrowRight size={14} className="mr-2" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-beige hover:text-[#D4AF37] transition-colors flex items-center"
                >
                  <ArrowRight size={14} className="mr-2" />
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 gold-text">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" />
                <span className="text-beige">{settings.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-[#D4AF37] mr-3 flex-shrink-0" />
                <span className="text-beige">{settings.contactPhone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-[#D4AF37] mr-3 flex-shrink-0" />
                <span className="text-beige">{settings.contactEmail}</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Business Hours:</h4>
              <div className="text-beige whitespace-pre-line">{settings.businessHours}</div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 gold-text">Newsletter</h3>
            <p className="text-beige mb-4">
              Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#222] mt-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-beige text-sm mb-4 md:mb-0">
              © {currentYear} {settings.siteName}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/terms-conditions" className="text-beige hover:text-[#D4AF37] text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/shipping-policy" className="text-beige hover:text-[#D4AF37] text-sm transition-colors">
                Shipping Policy
              </Link>
              <Link href="#" className="text-beige hover:text-[#D4AF37] text-sm transition-colors">
                Privacy Policy
              </Link>
              <div className="text-beige text-sm">
                <span className="text-[#D4AF37]">21+</span> Age Verification Required
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
