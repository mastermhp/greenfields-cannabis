"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Award, Users, Leaf, TrendingUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TeamMember from "@/components/about/team-member"
import Timeline from "@/components/about/timeline"

export default function AboutPage() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const teamMembers = [
    {
      name: "John Smith",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=400&width=400",
      bio: "With over 15 years in the cannabis industry, John founded Greenfields with a vision to provide premium quality products.",
    },
    {
      name: "Sarah Johnson",
      role: "Head of Product",
      image: "/placeholder.svg?height=400&width=400",
      bio: "Sarah oversees our product development, ensuring each item meets our strict quality standards.",
    },
    {
      name: "Michael Chen",
      role: "Master Grower",
      image: "/placeholder.svg?height=400&width=400",
      bio: "Michael brings decades of cultivation expertise, specializing in organic growing methods.",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Experience",
      image: "/placeholder.svg?height=400&width=400",
      bio: "Emily leads our customer service team, ensuring every client receives exceptional support.",
    },
  ]

  const timelineEvents = [
    {
      year: "2015",
      title: "Company Founded",
      description: "Greenfields was established with a mission to provide premium cannabis products.",
    },
    {
      year: "2017",
      title: "First Retail Location",
      description: "Opened our flagship store in California, setting new standards for cannabis retail.",
    },
    {
      year: "2019",
      title: "Product Line Expansion",
      description: "Expanded our product offerings to include edibles, concentrates, and topicals.",
    },
    {
      year: "2021",
      title: "Cannabis Cup Winner",
      description: "Our signature strain won first place at the prestigious Cannabis Cup.",
    },
    {
      year: "2023",
      title: "E-commerce Launch",
      description: "Launched our online store to serve customers nationwide with premium products.",
    },
  ]

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section ref={ref} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          <Image
            src="/about.jpeg"
            alt="About Greenfields"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/80" />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Our Story
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover the passion and expertise behind Greenfields, where quality meets luxury in every product
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gold-text">Our Mission</h2>
              <p className="text-beige text-lg mb-6">
                At Greenfields, we're dedicated to cultivating excellence. Our mission is to provide premium cannabis
                products that enhance well-being and elevate experiences.
              </p>
              <p className="text-beige text-lg mb-6">
                We believe in the power of nature, combined with scientific expertise, to create products of
                unparalleled quality. Every step of our process is guided by a commitment to purity, potency, and
                sustainability.
              </p>
              <p className="text-beige text-lg">
                From seed to sale, we maintain the highest standards, ensuring that each product bearing the Greenfields
                name delivers a consistent, exceptional experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image src="/mission.jpeg" alt="Our Mission" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-2/3 aspect-square bg-[#111] p-8 border border-[#D4AF37]">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src="/plant.jpeg"
                    alt="Cannabis Plant"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Our Core Values</h2>
            <p className="text-beige max-w-2xl mx-auto">These principles guide everything we do at Greenfields</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: "Quality",
                description:
                  "We source only the finest cannabis and maintain rigorous quality control throughout our process.",
              },
              {
                icon: Users,
                title: "Community",
                description:
                  "We're committed to giving back to the communities we serve through education and outreach.",
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for excellence in everything we do, from cultivation to customer service.",
              },
              {
                icon: TrendingUp,
                title: "Innovation",
                description: "We continuously explore new techniques and technologies to improve our products.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-black p-8 border border-[#333] hover:border-[#D4AF37] transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2)" }}
              >
                <value.icon size={48} className="text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-beige">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Meet Our Team</h2>
            <p className="text-beige max-w-2xl mx-auto">
              The passionate experts behind Greenfields' premium cannabis products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">Our Journey</h2>
            <p className="text-beige max-w-2xl mx-auto">
              The evolution of Greenfields from a small startup to an industry leader
            </p>
          </motion.div>

          <Timeline events={timelineEvents} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/placeholder.svg?height=600&width=1920" alt="Background Pattern" fill className="object-cover" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-black/80 p-10 border border-[#333]">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gold-text">Experience Greenfields</h2>
              <p className="text-beige max-w-2xl mx-auto">
                Discover our premium selection of cannabis products, crafted with care and expertise
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none">
                <Link href="/products">
                  Shop Now <ChevronRight className="ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg py-6 px-8 rounded-none"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
