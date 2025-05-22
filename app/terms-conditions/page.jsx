"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { FileText, Shield, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsConditionsPage() {
  return (
    <div className="bg-black min-h-screen py-40">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/terms.jpeg"
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
            Please read these terms carefully before using our services
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
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-6 mb-12">
                <div className="flex items-start">
                  <AlertTriangle className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Age Verification Required</h3>
                    <p className="text-beige">
                      By using this website, you confirm that you are at least 21 years of age or older, or the legal
                      age for cannabis consumption in your jurisdiction. We strictly prohibit the use of our services by
                      minors.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-beige mb-6">
                Welcome to Greenfields Group Inc. ("Greenfields," "we," "us," or "our"). These Terms and Conditions
                govern your access to and use of the Greenfields website, mobile application, and services
                (collectively, the "Services").
              </p>

              <p className="text-beige mb-6">
                By accessing or using our Services, you agree to be bound by these Terms and Conditions. If you do not
                agree to these terms, please do not use our Services.
              </p>
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-12">
              {/* Section 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">1. Acceptance of Terms</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    By accessing or using the Services, you represent that you have read, understood, and agree to be
                    bound by these Terms and Conditions. We may modify these terms at any time, and such modifications
                    shall be effective immediately upon posting on the website. Your continued use of the Services
                    following any modifications indicates your acceptance of the modified terms.
                  </p>

                  <p className="text-beige">
                    We reserve the right to change, suspend, or discontinue any aspect of the Services at any time
                    without notice or liability.
                  </p>
                </div>
              </motion.div>

              {/* Section 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">2. Eligibility</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    You must be at least 21 years of age or the legal age for cannabis consumption in your jurisdiction,
                    whichever is higher, to use our Services. By using our Services, you represent and warrant that you
                    meet these eligibility requirements.
                  </p>

                  <p className="text-beige mb-4">
                    We reserve the right to request proof of age at any time, and to refuse service to anyone who cannot
                    provide valid identification proving they meet the minimum age requirements.
                  </p>

                  <p className="text-beige">
                    You are responsible for ensuring that your use of our Services complies with all laws, rules, and
                    regulations applicable in your jurisdiction.
                  </p>
                </div>
              </motion.div>

              {/* Section 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">3. Account Registration</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    To access certain features of our Services, you may be required to register for an account. You
                    agree to provide accurate, current, and complete information during the registration process and to
                    update such information to keep it accurate, current, and complete.
                  </p>

                  <p className="text-beige mb-4">
                    You are responsible for safeguarding your password and for all activities that occur under your
                    account. You agree to notify us immediately of any unauthorized use of your account or any other
                    breach of security.
                  </p>

                  <p className="text-beige">
                    We reserve the right to terminate or suspend your account at our sole discretion, without notice,
                    for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or
                    third parties, or for any other reason.
                  </p>
                </div>
              </motion.div>

              {/* Section 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">4. Products and Purchases</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    All product descriptions, including pricing, are subject to change at any time without notice, at
                    our sole discretion. We reserve the right to discontinue any product at any time.
                  </p>

                  <p className="text-beige mb-4">
                    We make every effort to display as accurately as possible the colors, features, specifications, and
                    details of the products available on our Services. However, we cannot guarantee that your computer
                    or mobile device's display of any color, texture, or detail will be accurate.
                  </p>

                  <p className="text-beige mb-4">
                    By placing an order through our Services, you warrant that you are legally capable of entering into
                    binding contracts and are at least 21 years of age or the legal age for cannabis consumption in your
                    jurisdiction.
                  </p>

                  <p className="text-beige">
                    All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any
                    orders for any reason, including but not limited to product or service availability, errors in the
                    description or price of the product or service, or errors in your order.
                  </p>
                </div>
              </motion.div>

              {/* Section 5 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <Shield className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">5. Privacy Policy</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                    personal information. By using our Services, you consent to the collection, use, and disclosure of
                    your information as described in our Privacy Policy.
                  </p>

                  <p className="text-beige">
                    We encourage you to review our Privacy Policy, which is incorporated into these Terms and Conditions
                    by reference.
                  </p>
                </div>
              </motion.div>

              {/* Additional Sections */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">6. Intellectual Property</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    All content included on our Services, such as text, graphics, logos, images, audio clips, digital
                    downloads, data compilations, and software, is the property of Greenfields or its content suppliers
                    and is protected by international copyright laws.
                  </p>

                  <p className="text-beige">
                    You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                    perform, republish, download, store, or transmit any of the material on our Services without our
                    prior written consent.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">7. Limitation of Liability</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige mb-4">
                    In no event shall Greenfields, its officers, directors, employees, or agents be liable for any
                    indirect, punitive, incidental, special, or consequential damages arising out of or in any way
                    connected with the use of our Services, whether based on contract, tort, strict liability, or
                    otherwise.
                  </p>

                  <p className="text-beige">
                    Our liability is limited to the maximum extent permitted by law. Some jurisdictions do not allow the
                    exclusion or limitation of incidental or consequential damages, so the above limitation or exclusion
                    may not apply to you.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-6">
                  <FileText className="text-[#D4AF37] mr-4" size={28} />
                  <h2 className="text-2xl font-bold gold-text">8. Governing Law</h2>
                </div>

                <div className="bg-[#111] border border-[#333] p-8">
                  <p className="text-beige">
                    These Terms and Conditions shall be governed by and construed in accordance with the laws of the
                    State of California, without giving effect to any principles of conflicts of law. Any dispute
                    arising under or relating in any way to these Terms and Conditions shall be resolved exclusively by
                    final and binding arbitration in Los Angeles, California, under the rules of the American
                    Arbitration Association.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Contact Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-[#111] border border-[#D4AF37] p-8">
                <h3 className="text-xl font-bold mb-4 gold-text">Questions About Our Terms?</h3>
                <p className="text-beige mb-6">
                  If you have any questions about these Terms and Conditions, please contact us. We're here to help
                  ensure you have a positive experience with Greenfields.
                </p>

                <Button asChild className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                  <Link href="/contact">
                    Contact Us <ChevronRight className="ml-2" size={16} />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
