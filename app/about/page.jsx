"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Moon, Sun, SunMoon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Timeline from "@/components/about/timeline"

export default function AboutPage() {
  const [content, setContent] = useState({
    hero: {
      title: "Our Story",
      subtitle: "Redefining the cannabis experience by blending luxury, quality, and authenticity",
      backgroundImage: "/about.jpeg",
    },
    mission: {
      title: "Our Mission",
      text: "At Greenfields Group Inc., we are redefining the cannabis experience by blending luxury, quality, and authenticity. Our journey began in July 2021 with a bold mission—to build a state-of-the-art facility from the ground up.",
      image: "/mission.jpeg",
      secondaryImage: "/plant.jpeg",
    },
    values: {
      title: "Our Signature Product Line",
      subtitle:
        "With sophisticated and elegant names, these strains embody the essence of Greenfields: quality, refinement, and purpose",
      backgroundImage: "",
    },
    beyond: {
      title: "Beyond the Product",
      subtitle: "A Lasting Connection",
      text1:
        "At Greenfields, our mission extends far beyond delivering premium products. Our greatest priority is building lasting relationships rooted in trust, integrity, and genuine connection.",
      text2:
        "We believe that cannabis is more than a product—it's an experience, a lifestyle, and a bridge that connects us to our customers in meaningful ways. By offering personalized service, unparalleled quality, and an unwavering dedication to customer satisfaction, we cultivate an experience that goes beyond a single purchase.",
      text3:
        "From the moment our customers engage with us, they become part of the Greenfields family—a relationship built on mutual respect, authenticity, and a shared passion for the finest cannabis offerings.",
    },
    promise: {
      title: "Our Promise",
      text1:
        "Greenfields is not just a brand, it's a promise. A promise of luxury, quality, and a new standard in cannabis, where every interaction reflects our commitment to excellence.",
      text2:
        "We are here to set the bar higher, ensuring that every experience with Greenfields leaves a lasting impression of trust, care, and uncompromising quality.",
    },
    journey: {
      title: "Our Journey",
      subtitle: "The evolution of Greenfields from a small startup to an industry leader",
    },
    experience: {
      title: "Experience Greenfields",
      subtitle:
        "Discover our premium selection of cannabis products, crafted with care and expertise for an unmatched experience",
      backgroundImage: "/experiencebg.jpeg",
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content-management?page=about")
        const data = await response.json()
        if (data.success && data.data) {
          setContent((prev) => ({ ...prev, ...data.data }))
        }
      } catch (error) {
        console.error("Error fetching about content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

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
      year: "2021",
      title: "Company Founded",
      description:
        "Greenfields Group Inc. was established with a bold mission to build a state-of-the-art cannabis facility from the ground up.",
    },
    {
      year: "2022",
      title: "Facility Construction",
      description:
        "Dedicated innovation and perseverance drove the construction process of our premium cannabis production facility.",
    },
    {
      year: "2023",
      title: "Brand Launch",
      description:
        "We set out to create a brand that stands apart, providing top-quality cannabis products for luxury and recreational users.",
    },
    {
      year: "2023",
      title: "Signature Product Line",
      description:
        "Launched our first signature product line featuring Amelie, Baylie, and Chloe strains, embodying quality and refinement.",
    },
    {
      year: "2024",
      title: "Expanding Horizons",
      description:
        "Continuing to innovate and expand our product offerings while maintaining our commitment to uncompromising quality.",
    },
  ]

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section ref={ref} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
          <Image
            src={content.hero?.backgroundImage || "/about.jpeg"}
            alt="About Greenfields"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {content.hero?.title || "Our Story"}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {content.hero?.subtitle ||
              "Redefining the cannabis experience by blending luxury, quality, and authenticity"}
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gold-text">
                {content.mission?.title || "Our Mission"}
              </h2>
              <p className="text-beige text-lg mb-6">
                {content.mission?.text ||
                  "At Greenfields Group Inc., we are redefining the cannabis experience by blending luxury, quality, and authenticity. Our journey began in July 2021 with a bold mission—to build a state-of-the-art facility from the ground up."}
              </p>
              <p className="text-beige text-lg mb-6">
                After nearly two years of dedication, innovation, and perseverance, we completed the construction
                process, laying the foundation for something truly exceptional. In 2023, we set out to create a brand
                that stands apart from the rest.
              </p>
              <p className="text-beige text-lg">
                Our vision was clear: to provide top-quality cannabis products that offer an unmatched experience for
                both luxury consumers and recreational users. We are not just another company in the industry; we are a
                brand built on excellence, delivering only the finest products with precision and care.
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
                <Image
                  src={content.mission?.image || "/mission.jpeg"}
                  alt="Our Mission"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-2/3 aspect-square bg-[#111] p-8 border border-[#D4AF37]">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={content.mission?.secondaryImage || "/plant.jpeg"}
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
      <section className="py-20 bg-[#111] relative">
        {content.values?.backgroundImage && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={content.values.backgroundImage || "/placeholder.svg"}
              alt="Values Background"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">
              {content.values?.title || "Our Signature Product Line"}
            </h2>
            <p className="text-beige max-w-2xl mx-auto">
              {content.values?.subtitle ||
                "With sophisticated and elegant names, these strains embody the essence of Greenfields: quality, refinement, and purpose"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Amelie",
                subtitle: "Sativa Strain",
                description:
                  "Inspired by the French name meaning 'hardworking' or 'industrious,' Amelie reflects the dedication and meticulous care behind our products. This sativa strain is perfect for daytime use, offering energizing and uplifting effects that fuel creativity and productivity.",
                icon: <Sun className="text-[#D4AF37] text-4xl w-10 h-10" />,
              },
              {
                title: "Baylie",
                subtitle: "Hybrid Strain",
                description:
                  "Baylie represents trust, balance, and transparency. Its name, derived from the idea of 'making something true,' symbolizes harmony in every form. This hybrid strain strikes the perfect balance between the energizing effects of sativa and the calming effects of indica, making it a versatile choice for any time of day.",
                icon: <SunMoon className="text-[#D4AF37] text-5xl w-10 h-10" />,
              },
              {
                title: "Chloe",
                subtitle: "Indica Strain",
                description:
                  "Rooted in elegance, Chloe is inspired by a name associated with blooming and growth. This indica strain is ideal for nighttime use, offering soothing and relaxing effects that help you unwind and recharge naturally.",
                icon: <Moon className="text-[#D4AF37] text-5xl w-10 h-10" />,
              },
            ].map((product, index) => (
              <motion.div
                key={index}
                className="bg-black p-8 border border-[#333] hover:border-[#D4AF37] transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2)" }}
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-2xl font-bold mb-1 gold-text">{product.title}</h3>
                <h4 className="text-lg mb-4 text-[#D4AF37]/70">{product.subtitle}</h4>
                <p className="text-beige">{product.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">
              {content.beyond?.title || "Beyond the Product"}
            </h2>
            <p className="text-beige max-w-2xl mx-auto">{content.beyond?.subtitle || "A Lasting Connection"}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-beige text-lg mb-6">
                {content.beyond?.text1 ||
                  "At Greenfields, our mission extends far beyond delivering premium products. Our greatest priority is building lasting relationships rooted in trust, integrity, and genuine connection."}
              </p>
              <p className="text-beige text-lg mb-6">
                {content.beyond?.text2 ||
                  "We believe that cannabis is more than a product—it's an experience, a lifestyle, and a bridge that connects us to our customers in meaningful ways. By offering personalized service, unparalleled quality, and an unwavering dedication to customer satisfaction, we cultivate an experience that goes beyond a single purchase."}
              </p>
              <p className="text-beige text-lg">
                {content.beyond?.text3 ||
                  "From the moment our customers engage with us, they become part of the Greenfields family—a relationship built on mutual respect, authenticity, and a shared passion for the finest cannabis offerings."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-[#111] p-8 border border-[#D4AF37] gold-glow">
                <h3 className="text-2xl font-bold mb-4 gold-text">{content.promise?.title || "Our Promise"}</h3>
                <p className="text-beige text-lg mb-6">
                  {content.promise?.text1 ||
                    "Greenfields is not just a brand, it's a promise. A promise of luxury, quality, and a new standard in cannabis, where every interaction reflects our commitment to excellence."}
                </p>
                <p className="text-beige text-lg">
                  {content.promise?.text2 ||
                    "We are here to set the bar higher, ensuring that every experience with Greenfields leaves a lasting impression of trust, care, and uncompromising quality."}
                </p>
              </div>
            </motion.div>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gold-text">{content.journey?.title || "Our Journey"}</h2>
            <p className="text-beige max-w-2xl mx-auto">
              {content.journey?.subtitle || "The evolution of Greenfields from a small startup to an industry leader"}
            </p>
          </motion.div>

          <Timeline events={timelineEvents} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={content.experience?.backgroundImage || "/experiencebg.jpeg"}
            alt="Background Pattern"
            fill
            className="object-cover"
          />
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gold-text">
                {content.experience?.title || "Experience Greenfields"}
              </h2>
              <p className="text-beige max-w-2xl mx-auto">
                {content.experience?.subtitle ||
                  "Discover our premium selection of cannabis products, crafted with care and expertise for an unmatched experience"}
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
