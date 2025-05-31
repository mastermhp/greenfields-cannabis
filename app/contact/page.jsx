"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [formLoading, setFormLoading] = useState(false)

  const [content, setContent] = useState({
    heroTitle: "Contact Us",
    heroSubtitle: "We're here to help with any questions or concerns about our premium cannabis products",
    address: "123 Cannabis Boulevard\nLos Angeles, CA 90210",
    phone: "+1 (800) 420-6969",
    email: "info@greenfields.com",
    businessHours: "Monday - Friday: 9:00 AM - 8:00 PM\nSaturday - Sunday: 10:00 AM - 6:00 PM",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content-management?page=contact")
        const data = await response.json()
        if (data.success && data.data) {
          setContent((prev) => ({ ...prev, ...data.data }))
        }
      } catch (error) {
        console.error("Error fetching contact content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setFormLoading(false)
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/contact1.jpeg" alt="Contact Us" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {content.heroTitle}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {content.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8 gold-text">Send Us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-beige mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-beige mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-beige mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-beige mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none h-12"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-beige mb-2">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-[#111] border-[#333] focus:border-[#D4AF37] rounded-none resize-none"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none w-full md:w-auto"
                  >
                    {formLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2" size={20} />
                        Send Message
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-8 gold-text">Get in Touch</h2>

              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-[#D4AF37] p-3 mr-4">
                    <MapPin className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Location</h3>
                    <p className="text-beige">
                      {content.address.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#D4AF37] p-3 mr-4">
                    <Phone className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Phone Number</h3>
                    <p className="text-beige">{content.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#D4AF37] p-3 mr-4">
                    <Mail className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email Address</h3>
                    <p className="text-beige">{content.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#D4AF37] p-3 mr-4">
                    <Clock className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                    <p className="text-beige">
                      {content.businessHours.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {["facebook", "twitter", "instagram", "youtube"].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="bg-[#111] border border-[#333] hover:border-[#D4AF37] w-12 h-12 flex items-center justify-center transition-all duration-300"
                    >
                      <Image src={`/placeholder.svg?height=24&width=24`} alt={social} width={24} height={24} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <div className="relative h-[500px] w-full">
            {/* <Image src="/map.png" alt="Map" fill className="object-cover" /> */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-6 border border-[#D4AF37]">
              <h3 className="text-xl font-bold mb-2 gold-text">Greenfields Headquarters</h3>
              <p className="text-beige">
                {content.address.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
