"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { FileText, Shield, AlertTriangle, ChevronRight, Loader2 } from "lucide-react" // Import Loader2
import { Button } from "@/components/ui/button"

// Define the initial structure that mirrors the admin panel's structure
// This is crucial for safe access to nested properties, even if data is missing
const initialTermsConditionsStructure = {
  heroSubtitle: "Please read these terms carefully before using our services",
  ageVerificationWarning: {
    title: "Age Verification Required",
    text: "By using this website, you confirm that you are at least 21 years of age or older, or the legal age for cannabis consumption in your jurisdiction. We strictly prohibit the use of our services by minors.",
  },
  introduction: {
    paragraph1: "Welcome to Greenfields Group Inc. ('Greenfields,' 'we,' 'us,' or 'our'). These Terms and Conditions govern your access to and use of the Greenfields website, mobile application, and services (collectively, the 'Services').",
    paragraph2: "By accessing or using our Services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Services.",
  },
  sections: [
    {
      title: "Acceptance of Terms",
      paragraphs: [
        "By accessing or using the Services, you represent that you have read, understood, and agree to be bound by these Terms and Conditions. We may modify these terms at any time, and such modifications shall be effective immediately upon posting on the website. Your continued use of the Services following any modifications indicates your acceptance of the modified terms.",
        "We reserve the right to change, suspend, or discontinue any aspect of the Services at any time without notice or liability.",
      ],
      icon: "FileText", // Corresponds to Lucide icon name
    },
    {
      title: "Eligibility",
      paragraphs: [
        "You must be at least 21 years of age or the legal age for cannabis consumption in your jurisdiction, whichever is higher, to use our Services. By using our Services, you represent and warrant that you meet these eligibility requirements.",
        "We reserve the right to request proof of age at any time, and to refuse service to anyone who cannot provide valid identification proving they meet the minimum age requirements.",
        "You are responsible for ensuring that your use of our Services complies with all laws, rules, and regulations applicable in your jurisdiction.",
      ],
      icon: "FileText",
    },
    {
      title: "Account Registration",
      paragraphs: [
        "To access certain features of our Services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.",
        "You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.",
        "We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason.",
      ],
      icon: "FileText",
    },
    {
      title: "Products and Purchases",
      paragraphs: [
        "All product descriptions, including pricing, are subject to change at any time without notice, at our sole discretion. We reserve the right to discontinue any product at any time.",
        "We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on our Services. However, we cannot guarantee that your computer or mobile device's display of any color, texture, or detail will be accurate.",
        "By placing an order through our Services, you warrant that you are legally capable of entering into binding contracts and are at least 21 years of age or the legal age for cannabis consumption in your jurisdiction.",
        "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any orders for any reason, including but not limited to product or service availability, errors in the description or price of the product or service, or errors in your order.",
      ],
      icon: "FileText",
    },
    {
      title: "Privacy Policy",
      paragraphs: [
        "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our Services, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.",
        "We encourage you to review our Privacy Policy, which is incorporated into these Terms and Conditions by reference.",
      ],
      icon: "Shield",
    },
    {
      title: "Intellectual Property",
      paragraphs: [
        "All content included on our Services, such as text, graphics, logos, images, audio clips, digital downloads, data compilations, and software, is the property of Greenfields or its content suppliers and is protected by international copyright laws.",
        "You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services without our prior written consent.",
      ],
      icon: "FileText",
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "In no event shall Greenfields, its officers, directors, employees, or agents be liable for any indirect, punitive, incidental, special, or consequential damages arising out of or in any way connected with the use of our Services, whether based on contract, tort, strict liability, or otherwise.",
        "Our liability is limited to the maximum extent permitted by law. Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitation or exclusion may not apply to you.",
      ],
      icon: "FileText",
    },
    {
      title: "Governing Law",
      paragraphs: [
        "These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law. Any dispute arising under or relating in any way to these Terms and Conditions shall be resolved exclusively by final and binding arbitration in Los Angeles, California, under the rules of the American Arbitration Association.",
      ],
      icon: "FileText",
    },
  ],
  contactSection: {
    title: "Questions About Our Terms?",
    text: "If you have any questions about these Terms and Conditions, please contact us. We're here to help ensure you have a positive experience with Greenfields.",
    buttonText: "Contact Us",
    buttonLink: "/contact",
  },
};


// Helper function to dynamically get Lucide icon
const getIcon = (iconName) => {
  const icons = { FileText, Shield, AlertTriangle }; // Add more icons as needed
  return icons[iconName] || FileText; // Default to FileText if not found
};


export default function TermsConditionsPage() {
  const [termsContent, setTermsContent] = useState(initialTermsConditionsStructure);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsConditions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/content-management?page=policies"); // Fetching from the same policies endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data && data.data.termsConditions) {
          const fetchedTerms = data.data.termsConditions;

          // Deep merge the fetched termsConditions with the initial structure
          const mergedTerms = {
            ...initialTermsConditionsStructure,
            ...fetchedTerms,
            introduction: {
              ...initialTermsConditionsStructure.introduction,
              ...(fetchedTerms.introduction || {})
            },
            ageVerificationWarning: {
              ...initialTermsConditionsStructure.ageVerificationWarning,
              ...(fetchedTerms.ageVerificationWarning || {})
            },
            sections: Array.isArray(fetchedTerms.sections)
              ? fetchedTerms.sections.map((fetchedSection, index) => ({
                  ...(initialTermsConditionsStructure.sections[index] || {}),
                  ...fetchedSection,
                  paragraphs: Array.isArray(fetchedSection.paragraphs)
                    ? fetchedSection.paragraphs
                    : (initialTermsConditionsStructure.sections[index]?.paragraphs || []),
                }))
              : initialTermsConditionsStructure.sections,
            contactSection: {
              ...initialTermsConditionsStructure.contactSection,
              ...(fetchedTerms.contactSection || {})
            },
          };
          setTermsContent(mergedTerms);
        } else {
          setTermsContent(initialTermsConditionsStructure); // Fallback to default if no data
        }
      } catch (error) {
        console.error("Error fetching terms and conditions content:", error);
        setTermsContent(initialTermsConditionsStructure); // Fallback to default on error
      } finally {
        setLoading(false);
      }
    };
    fetchTermsConditions();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading Terms & Conditions...</span>
      </div>
    );
  }

  const { heroSubtitle, ageVerificationWarning, introduction, sections, contactSection } = termsContent;

  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/terms.jpeg" // Ensure this image path is correct
            alt="Terms and Conditions"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 gold-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Terms & Conditions
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-beige max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-gradient-to-b from-black to-[#111]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Age Verification Warning */}
              {ageVerificationWarning.title && ageVerificationWarning.text && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-6 mb-12">
                  <div className="flex items-start">
                    <AlertTriangle className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{ageVerificationWarning.title}</h3>
                      <p className="text-beige">{ageVerificationWarning.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Introduction Paragraphs */}
              {introduction.paragraph1 && <p className="text-beige mb-6">{introduction.paragraph1}</p>}
              {introduction.paragraph2 && <p className="text-beige mb-6">{introduction.paragraph2}</p>}
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-12">
              {sections && sections.map((section, index) => {
                const IconComponent = getIcon(section.icon); // Get the icon component
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }} // Adjust amount for when animation triggers
                    transition={{ duration: 0.8 }}
                  >
                    <div className="flex items-center mb-6">
                      <IconComponent className="text-[#D4AF37] mr-4" size={28} />
                      <h2 className="text-2xl font-bold gold-text">{index + 1}. {section.title}</h2>
                    </div>

                    <div className="bg-[#111] border border-[#333] p-8">
                      {section.paragraphs && section.paragraphs.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-beige mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {contactSection.title && contactSection.text && contactSection.buttonText && contactSection.buttonLink && (
                <div className="bg-[#111] border border-[#D4AF37] p-8">
                  <h3 className="text-xl font-bold mb-4 gold-text">{contactSection.title}</h3>
                  <p className="text-beige mb-6">{contactSection.text}</p>
                  <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                    <Link href={contactSection.buttonLink}>
                      {contactSection.buttonText} <ChevronRight className="ml-2" size={16} />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}