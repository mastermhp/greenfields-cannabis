import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-[#222] pt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <Image
                src="/logo.png"
                alt="Greenfields Logo"
                width={200}
                height={10}
                className="mr-2"
              />
              {/* <span className="text-xl font-bold gold-text">GREENFIELDS</span> */}
            </div>
            <p className="text-beige mb-6">
              Premium cannabis products crafted with care. Experience the difference with our luxury selection of
              cannabis flower, edibles, concentrates, and more.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-colors w-10 h-10 flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
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
                <span className="text-beige">123 Cannabis Boulevard, Los Angeles, CA 90210</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-[#D4AF37] mr-3 flex-shrink-0" />
                <span className="text-beige">+1 (800) 420-6969</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-[#D4AF37] mr-3 flex-shrink-0" />
                <span className="text-beige">info@greenfields.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Business Hours:</h4>
              <p className="text-beige">Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p className="text-beige">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 gold-text">Newsletter</h3>
            <p className="text-beige mb-4">
              Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education.
            </p>
            <div className="flex flex-col space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
              />
              <Button className="bg-[#D4AF37] hover:bg-[#B8860B] text-black rounded-none">Subscribe</Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#222] mt-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-beige text-sm mb-4 md:mb-0">
              © {currentYear} Greenfields Group Inc. All rights reserved.
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
