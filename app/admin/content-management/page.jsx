"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  FileText,
  ImageIcon,
  Globe,
  Upload,
  X,
  Info,
} from "lucide-react";
import Image from "next/image";

const initialShippingPolicyStructure = {
  heroSubtitle: "",
  sections: {
    shippingMethods: {
      mainTitle: "Shipping Methods",
      standard: { title: "Standard Shipping", description: "", details: "" },
      express: { title: "Express Shipping", description: "", details: "" },
      sameDay: {
        title: "Same-Day Delivery",
        description: "",
        details: "",
        eligibilityNote: "",
      },
    },
    deliveryInformation: {
      mainTitle: "Delivery Information",
      deliveryProcess: { title: "Delivery Process", text: "" },
      trackingYourOrder: { title: "Tracking Your Order", text: "" },
      deliveryAreas: { title: "Delivery Areas", text: "" },
      legalWarning: {
        text: "Due to legal restrictions, we cannot ship cannabis products to states where recreational or medical cannabis is not legalized. Please check your local laws before placing an order.",
      },
    },
    packagingAndDiscretion: {
      mainTitle: "Packaging & Discretion",
      discreetPackaging: { title: "Discreet Packaging", text: "" },
      securePackaging: { title: "Secure Packaging", text: "" },
      ecoFriendlyApproach: { title: "Eco-Friendly Approach", text: "" },
    },
    returnsAndRefundsPolicy: {
      mainTitle: "Returns & Refunds",
      returnPolicyInfo: { title: "Return Policy", text: "" },
      refundProcess: { title: "Refund Process", text: "" },
      damagedOrMissingItems: { title: "Damaged or Missing Items", text: "" },
      contactCustomerService: {
        title: "Contact Customer Service",
        text: "For any questions or concerns about your order or our shipping policies, our customer service team is here to help.",
      },
    },
  },
};

const initialTermsConditionsStructure = {
  heroSubtitle: "Please read these terms carefully before using our services",
  ageVerificationWarning: {
    title: "Age Verification Required",
    text: "By using this website, you confirm that you are at least 21 years of age or older, or the legal age for cannabis consumption in your jurisdiction. We strictly prohibit the use of our services by minors.",
  },
  introduction: {
    paragraph1:
      "Welcome to Greenfields Group Inc. ('Greenfields,' 'we,' 'us,' or 'our'). These Terms and Conditions govern your access to and use of the Greenfields website, mobile application, and services (collectively, the 'Services').",
    paragraph2:
      "By accessing or using our Services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Services.",
  },
  sections: [
    {
      title: "Acceptance of Terms",
      paragraphs: [
        "By accessing or using the Services, you represent that you have read, understood, and agree to be bound by these Terms and Conditions. We may modify these terms at any time, and such modifications shall be effective immediately upon posting on the website. Your continued use of the Services following any modifications indicates your acceptance of the modified terms.",
        "We reserve the right to change, suspend, or discontinue any aspect of the Services at any time without notice or liability.",
      ],
      icon: "FileText",
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

const initialPolicyContentState = {
  shippingPolicy: initialShippingPolicyStructure,
  returnPolicy: "",
  privacyPolicy: "",
  termsConditions: initialTermsConditionsStructure,
};

// Initial content structures for new enhanced pages
const initialHomeContentState = {
  hero: {
    title: "GREENFIELDS",
    subtitle: "Premium Quality Cannabis Products for Connoisseurs",
    backgroundImage: "/greenfieldsbg.jpeg",
    backgroundImageId: "",
    ctaText: "Shop Now",
    ctaSecondaryText: "Learn More",
  },
  benefits: {
    title: "Why Choose Greenfields",
    subtitle: "Experience the difference with our premium cannabis products",
    backgroundImage: "",
    backgroundImageId: "",
    items: [
      {
        title: "Premium Quality",
        description:
          "Sourced from the finest growers with strict quality control",
        icon: "TrendingUp",
      },
      {
        title: "Award Winning",
        description: "Multiple cannabis cup winner for our exclusive strains",
        icon: "Award",
      },
      {
        title: "Lab Tested",
        description:
          "All products are rigorously tested for purity and potency",
        icon: "Shield",
      },
      {
        title: "Fast Delivery",
        description: "Discreet packaging with fast and reliable shipping",
        icon: "Truck",
      },
    ],
  },
  newsletter: {
    title: "Join Our Community",
    subtitle:
      "Subscribe to our newsletter for exclusive offers, new product alerts, and cannabis education",
    backgroundImage: "/community.jpg",
    backgroundImageId: "",
  },
};

const initialAboutContentState = {
  hero: {
    title: "Our Story",
    subtitle:
      "Redefining the cannabis experience by blending luxury, quality, and authenticity",
    backgroundImage: "/about.jpeg",
    backgroundImageId: "",
  },
  mission: {
    title: "Our Mission",
    text: "At Greenfields Group Inc., we are redefining the cannabis experience by blending luxury, quality, and authenticity. Our journey began in July 2021 with a bold mission—to build a state-of-the-art facility from the ground up.",
    image: "/mission.jpeg",
    imageId: "",
    secondaryImage: "/plant.jpeg",
    secondaryImageId: "",
  },
  values: {
    title: "Our Signature Product Line",
    subtitle:
      "With sophisticated and elegant names, these strains embody the essence of Greenfields: quality, refinement, and purpose",
    backgroundImage: "",
    backgroundImageId: "",
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
    subtitle:
      "The evolution of Greenfields from a small startup to an industry leader",
  },
  experience: {
    title: "Experience Greenfields",
    subtitle:
      "Discover our premium selection of cannabis products, crafted with care and expertise for an unmatched experience",
    backgroundImage: "/experiencebg.jpeg",
    backgroundImageId: "",
  },
};

const initialContactContentState = {
  hero: {
    title: "Contact Us",
    subtitle:
      "We're here to help with any questions or concerns about our premium cannabis products",
    backgroundImage: "/contact1.jpeg",
    backgroundImageId: "",
  },
  info: {
    address: "123 Cannabis Boulevard\nLos Angeles, CA 90210",
    phone: "+1 (800) 420-6969",
    email: "info@greenfields.com",
    businessHours:
      "Monday - Friday: 9:00 AM - 8:00 PM\nSaturday - Sunday: 10:00 AM - 6:00 PM",
  },
  map: {
    backgroundImage: "",
    backgroundImageId: "",
  },
};

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Content states for different pages
  const [homeContent, setHomeContent] = useState(initialHomeContentState);
  const [aboutContent, setAboutContent] = useState(initialAboutContentState);
  const [contactContent, setContactContent] = useState(
    initialContactContentState
  );
  const [policyContent, setPolicyContent] = useState(initialPolicyContentState);

  // Fetch content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        const [homeRes, aboutRes, contactRes, policyRes] = await Promise.all([
          fetch("/api/content-management?page=home"),
          fetch("/api/content-management?page=about"),
          fetch("/api/content-management?page=contact"),
          fetch("/api/content-management?page=policies"),
        ]);

        const [homeData, aboutData, contactData, policyData] =
          await Promise.all([
            homeRes.json(),
            aboutRes.json(),
            contactRes.json(),
            policyRes.json(),
          ]);

        if (homeData.success && homeData.data) {
          setHomeContent((prev) => ({ ...prev, ...homeData.data }));
        }
        if (aboutData.success && aboutData.data) {
          setAboutContent((prev) => ({ ...prev, ...aboutData.data }));
        }
        if (contactData.success && contactData.data) {
          setContactContent((prev) => ({ ...prev, ...contactData.data }));
        }
        if (policyData.success && policyData.data) {
          const fetchedPolicies = policyData.data;
          const mergedShippingPolicy = {
            ...initialShippingPolicyStructure,
            ...(typeof fetchedPolicies.shippingPolicy === "object" &&
            fetchedPolicies.shippingPolicy !== null
              ? fetchedPolicies.shippingPolicy
              : {}),
          };

          const mergedTermsConditions = {
            ...initialTermsConditionsStructure,
            ...(typeof fetchedPolicies.termsConditions === "object" &&
            fetchedPolicies.termsConditions !== null
              ? fetchedPolicies.termsConditions
              : {}),
          };

          setPolicyContent((prev) => ({
            ...initialPolicyContentState,
            ...fetchedPolicies,
            shippingPolicy: mergedShippingPolicy,
            termsConditions: mergedTermsConditions,
          }));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Image upload function
  const uploadImage = async (file, section, field) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "greenfields_content"); // You'll need to create this preset in Cloudinary

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        // Update the appropriate content state
        if (activeTab === "home") {
          setHomeContent((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              [field]: data.secure_url,
              [`${field}Id`]: data.public_id,
            },
          }));
        } else if (activeTab === "about") {
          setAboutContent((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              [field]: data.secure_url,
              [`${field}Id`]: data.public_id,
            },
          }));
        } else if (activeTab === "contact") {
          setContactContent((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              [field]: data.secure_url,
              [`${field}Id`]: data.public_id,
            },
          }));
        }

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle policy changes
  const handlePolicyChange = (path, value) => {
    setPolicyContent((prev) => {
      const newPolicyContent = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let currentTarget = newPolicyContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (
          currentTarget[keys[i]] === undefined ||
          typeof currentTarget[keys[i]] !== "object"
        ) {
          currentTarget[keys[i]] = {};
        }
        currentTarget = currentTarget[keys[i]];
      }

      currentTarget[keys[keys.length - 1]] = value;
      return newPolicyContent;
    });
  };

  // Save content function
  const saveContent = async (page, content) => {
    try {
      setSaving(true);

      const requestBody = { page, section: "main", content };

      const response = await fetch("/api/content-management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `API Error: Status ${response.status}.`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);

      if (data.success) {
        toast({
          title: "Success",
          description: `${
            page.charAt(0).toUpperCase() + page.slice(1)
          } content updated successfully`,
        });
      } else {
        throw new Error(data.message || "Failed to update content");
      }
    } catch (error) {
      console.error(`Error saving ${page} content:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to save ${page} content`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper to create input fields to reduce repetition - could be further componentized
  const renderInputField = (id, label, path) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-300">
        {label}
      </Label>
      <Input
        id={id}
        value={path.split(".").reduce((o, k) => o?.[k], policyContent) || ""}
        onChange={(e) => handlePolicyChange(path, e.target.value)}
        className="bg-[#222] border-[#444] text-white"
      />
    </div>
  );

  const renderTextareaField = (id, label, path, rows = 3) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-300">
        {label}
      </Label>
      <Textarea
        id={id}
        value={path.split(".").reduce((o, k) => o?.[k], policyContent) || ""}
        onChange={(e) => handlePolicyChange(path, e.target.value)}
        className="bg-[#222] border-[#444] text-white min-h-[80px]"
        rows={rows}
      />
    </div>
  );


  // Helper components
  const ImageUploadField = ({
    label,
    currentImage,
    section,
    field,
    note,
    aspectRatio = "16:9",
  }) => (
    <div className="space-y-3">
      <Label className="text-gray-300 flex items-center gap-2">
        <ImageIcon size={16} />
        {label}
      </Label>
      {note && (
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-300">{note}</p>
        </div>
      )}

      {currentImage && (
        <div className="relative w-full h-32 border border-[#444] rounded-lg overflow-hidden">
          <Image
            src={currentImage || "/placeholder.svg"}
            alt={label}
            fill
            className="object-cover"
          />
          <button
            onClick={() => {
              if (activeTab === "home") {
                setHomeContent((prev) => ({
                  ...prev,
                  [section]: {
                    ...prev[section],
                    [field]: "",
                    [`${field}Id`]: "",
                  },
                }));
              } else if (activeTab === "about") {
                setAboutContent((prev) => ({
                  ...prev,
                  [section]: {
                    ...prev[section],
                    [field]: "",
                    [`${field}Id`]: "",
                  },
                }));
              } else if (activeTab === "contact") {
                setContactContent((prev) => ({
                  ...prev,
                  [section]: {
                    ...prev[section],
                    [field]: "",
                    [`${field}Id`]: "",
                  },
                }));
              }
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              uploadImage(file, section, field);
            }
          }}
          className="hidden"
          id={`${section}-${field}`}
        />
        <label
          htmlFor={`${section}-${field}`}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-black rounded cursor-pointer transition-colors"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Image"}
        </label>
        <span className="text-xs text-gray-400">
          Recommended: {aspectRatio} aspect ratio
        </span>
      </div>
    </div>
  );

  const TextInputField = ({ label, value, onChange, placeholder = "" }) => (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#222] border-[#444] text-white"
      />
    </div>
  );

  const TextareaField = ({
    label,
    value,
    onChange,
    placeholder = "",
    rows = 3,
  }) => (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#222] border-[#444] text-white min-h-[80px]"
        rows={rows}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold gold-text mb-2">
            Content Management
          </h1>
          <p className="text-beige">
            Manage website content, images, and layouts for different pages
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="home"
              className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:border-white hover:text-white hover:cursor-pointer transition-all duration-500"
            >
              <ImageIcon size={16} />
              Home Page
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:border-white hover:text-white hover:cursor-pointer transition-all duration-500"
            >
              <FileText size={16} />
              About Page
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:border-white hover:text-white hover:cursor-pointer transition-all duration-500"
            >
              <Globe size={16} />
              Contact Page
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:border-white hover:text-white hover:cursor-pointer transition-all duration-500"
            >
              <FileText size={16} />
              Policies
            </TabsTrigger>
          </TabsList>

          {/* Home Page Content */}
          <TabsContent value="home">
            <div className="space-y-8">
              {/* Hero Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Hero Section
                  </CardTitle>
                  <CardDescription>
                    Main banner section with background image and call-to-action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Hero Background Image"
                    currentImage={homeContent.hero?.backgroundImage}
                    section="hero"
                    field="backgroundImage"
                    note="Upload a high-quality background image for the hero section. Recommended size: 1920x1080px (16:9 ratio). This image will be the main visual element visitors see first."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Hero Title"
                      value={homeContent.hero?.title || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, title: value },
                        }))
                      }
                      placeholder="Main headline text"
                    />

                    <TextInputField
                      label="Hero Subtitle"
                      value={homeContent.hero?.subtitle || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: value },
                        }))
                      }
                      placeholder="Supporting text under the headline"
                    />

                    <TextInputField
                      label="Primary CTA Button Text"
                      value={homeContent.hero?.ctaText || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, ctaText: value },
                        }))
                      }
                      placeholder="e.g., Shop Now"
                    />

                    <TextInputField
                      label="Secondary CTA Button Text"
                      value={homeContent.hero?.ctaSecondaryText || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, ctaSecondaryText: value },
                        }))
                      }
                      placeholder="e.g., Learn More"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Benefits Section
                  </CardTitle>
                  <CardDescription>
                    Why choose us section with benefits and optional background
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Benefits Background Image (Optional)"
                    currentImage={homeContent.benefits?.backgroundImage}
                    section="benefits"
                    field="backgroundImage"
                    note="Optional background image for the benefits section. If uploaded, it will be used as a subtle background. Recommended size: 1920x1080px."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Benefits Title"
                      value={homeContent.benefits?.title || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          benefits: { ...prev.benefits, title: value },
                        }))
                      }
                      placeholder="Section title"
                    />

                    <TextInputField
                      label="Benefits Subtitle"
                      value={homeContent.benefits?.subtitle || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          benefits: { ...prev.benefits, subtitle: value },
                        }))
                      }
                      placeholder="Section subtitle"
                    />
                  </div>

                  {/* Benefits Items */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-200">
                      Benefit Items
                    </h4>
                    {homeContent.benefits?.items?.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-[#444] rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-white font-medium">
                            Benefit {index + 1}
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInputField
                            label="Title"
                            value={item.title}
                            onChange={(value) => {
                              const newItems = [...homeContent.benefits.items];
                              newItems[index] = {
                                ...newItems[index],
                                title: value,
                              };
                              setHomeContent((prev) => ({
                                ...prev,
                                benefits: { ...prev.benefits, items: newItems },
                              }));
                            }}
                          />
                          <TextareaField
                            label="Description"
                            value={item.description}
                            onChange={(value) => {
                              const newItems = [...homeContent.benefits.items];
                              newItems[index] = {
                                ...newItems[index],
                                description: value,
                              };
                              setHomeContent((prev) => ({
                                ...prev,
                                benefits: { ...prev.benefits, items: newItems },
                              }));
                            }}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Newsletter Section
                  </CardTitle>
                  <CardDescription>
                    Newsletter signup section with background image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Newsletter Background Image"
                    currentImage={homeContent.newsletter?.backgroundImage}
                    section="newsletter"
                    field="backgroundImage"
                    note="Background image for the newsletter section. This will be displayed behind the newsletter signup form. Recommended size: 1920x1080px."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Newsletter Title"
                      value={homeContent.newsletter?.title || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          newsletter: { ...prev.newsletter, title: value },
                        }))
                      }
                      placeholder="Newsletter section title"
                    />

                    <TextareaField
                      label="Newsletter Subtitle"
                      value={homeContent.newsletter?.subtitle || ""}
                      onChange={(value) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          newsletter: { ...prev.newsletter, subtitle: value },
                        }))
                      }
                      placeholder="Newsletter section description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => saveContent("home", homeContent)}
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Home Content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* About Page Content */}
          <TabsContent value="about">
            <div className="space-y-8">
              {/* Hero Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    About Hero Section
                  </CardTitle>
                  <CardDescription>
                    Main banner for the about page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Hero Background Image"
                    currentImage={aboutContent.hero?.backgroundImage}
                    section="hero"
                    field="backgroundImage"
                    note="Hero background image for the about page. This should represent your company or brand. Recommended size: 1920x1080px."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Hero Title"
                      value={aboutContent.hero?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, title: value },
                        }))
                      }
                    />

                    <TextareaField
                      label="Hero Subtitle"
                      value={aboutContent.hero?.subtitle || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: value },
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mission Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Mission Section
                  </CardTitle>
                  <CardDescription>
                    Mission statement with supporting images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploadField
                      label="Main Mission Image"
                      currentImage={aboutContent.mission?.image}
                      section="mission"
                      field="image"
                      note="Primary image for the mission section. Should represent your mission or values. Recommended size: 800x600px (4:3 ratio)."
                      aspectRatio="4:3"
                    />

                    <ImageUploadField
                      label="Secondary Mission Image"
                      currentImage={aboutContent.mission?.secondaryImage}
                      section="mission"
                      field="secondaryImage"
                      note="Secondary/overlay image for the mission section. This will be displayed as a smaller overlay image. Recommended size: 600x600px (1:1 ratio)."
                      aspectRatio="1:1"
                    />
                  </div>

                  <TextInputField
                    label="Mission Title"
                    value={aboutContent.mission?.title || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        mission: { ...prev.mission, title: value },
                      }))
                    }
                  />

                  <TextareaField
                    label="Mission Text"
                    value={aboutContent.mission?.text || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        mission: { ...prev.mission, text: value },
                      }))
                    }
                    rows={6}
                  />
                </CardContent>
              </Card>

              {/* Values Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Values Section
                  </CardTitle>
                  <CardDescription>
                    Company values and product line information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Values Background Image (Optional)"
                    currentImage={aboutContent.values?.backgroundImage}
                    section="values"
                    field="backgroundImage"
                    note="Optional background image for the values section. Will be used as a subtle background behind the content."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Values Title"
                      value={aboutContent.values?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          values: { ...prev.values, title: value },
                        }))
                      }
                    />

                    <TextareaField
                      label="Values Subtitle"
                      value={aboutContent.values?.subtitle || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          values: { ...prev.values, subtitle: value },
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Experience Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Experience Section
                  </CardTitle>
                  <CardDescription>
                    Call-to-action section with background
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Experience Background Image"
                    currentImage={aboutContent.experience?.backgroundImage}
                    section="experience"
                    field="backgroundImage"
                    note="Background image for the final call-to-action section. Should be engaging and encourage action. Recommended size: 1920x1080px."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Experience Title"
                      value={aboutContent.experience?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          experience: { ...prev.experience, title: value },
                        }))
                      }
                    />

                    <TextareaField
                      label="Experience Subtitle"
                      value={aboutContent.experience?.subtitle || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          experience: { ...prev.experience, subtitle: value },
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Text-only sections */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">
                    Text Content Sections
                  </CardTitle>
                  <CardDescription>
                    Additional text content for the about page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Beyond Section Title"
                      value={aboutContent.beyond?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          beyond: { ...prev.beyond, title: value },
                        }))
                      }
                    />

                    <TextInputField
                      label="Beyond Section Subtitle"
                      value={aboutContent.beyond?.subtitle || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          beyond: { ...prev.beyond, subtitle: value },
                        }))
                      }
                    />

                    <TextInputField
                      label="Promise Title"
                      value={aboutContent.promise?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          promise: { ...prev.promise, title: value },
                        }))
                      }
                    />

                    <TextInputField
                      label="Journey Title"
                      value={aboutContent.journey?.title || ""}
                      onChange={(value) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          journey: { ...prev.journey, title: value },
                        }))
                      }
                    />
                  </div>

                  <TextareaField
                    label="Beyond Text 1"
                    value={aboutContent.beyond?.text1 || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        beyond: { ...prev.beyond, text1: value },
                      }))
                    }
                    rows={4}
                  />

                  <TextareaField
                    label="Beyond Text 2"
                    value={aboutContent.beyond?.text2 || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        beyond: { ...prev.beyond, text2: value },
                      }))
                    }
                    rows={4}
                  />

                  <TextareaField
                    label="Beyond Text 3"
                    value={aboutContent.beyond?.text3 || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        beyond: { ...prev.beyond, text3: value },
                      }))
                    }
                    rows={4}
                  />

                  <TextareaField
                    label="Promise Text 1"
                    value={aboutContent.promise?.text1 || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        promise: { ...prev.promise, text1: value },
                      }))
                    }
                    rows={3}
                  />

                  <TextareaField
                    label="Promise Text 2"
                    value={aboutContent.promise?.text2 || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        promise: { ...prev.promise, text2: value },
                      }))
                    }
                    rows={3}
                  />

                  <TextareaField
                    label="Journey Subtitle"
                    value={aboutContent.journey?.subtitle || ""}
                    onChange={(value) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        journey: { ...prev.journey, subtitle: value },
                      }))
                    }
                    rows={2}
                  />
                </CardContent>
              </Card>

              <Button
                onClick={() => saveContent("about", aboutContent)}
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save About Content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Contact Page Content */}
          <TabsContent value="contact">
            <div className="space-y-8">
              {/* Hero Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Contact Hero Section
                  </CardTitle>
                  <CardDescription>
                    Main banner for the contact page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Hero Background Image"
                    currentImage={contactContent.hero?.backgroundImage}
                    section="hero"
                    field="backgroundImage"
                    note="Hero background image for the contact page. Should be welcoming and professional. Recommended size: 1920x1080px."
                    aspectRatio="16:9"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextInputField
                      label="Hero Title"
                      value={contactContent.hero?.title || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, title: value },
                        }))
                      }
                    />

                    <TextareaField
                      label="Hero Subtitle"
                      value={contactContent.hero?.subtitle || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: value },
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    Business contact details and hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField
                      label="Address"
                      value={contactContent.info?.address || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          info: { ...prev.info, address: value },
                        }))
                      }
                      placeholder="Street address, City, State, ZIP"
                      rows={3}
                    />

                    <TextInputField
                      label="Phone Number"
                      value={contactContent.info?.phone || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          info: { ...prev.info, phone: value },
                        }))
                      }
                      placeholder="+1 (555) 123-4567"
                    />

                    <TextInputField
                      label="Email Address"
                      value={contactContent.info?.email || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          info: { ...prev.info, email: value },
                        }))
                      }
                      placeholder="info@company.com"
                    />

                    <TextareaField
                      label="Business Hours"
                      value={contactContent.info?.businessHours || ""}
                      onChange={(value) =>
                        setContactContent((prev) => ({
                          ...prev,
                          info: { ...prev.info, businessHours: value },
                        }))
                      }
                      placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Map Section */}
              <Card className="bg-[#111] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon size={20} />
                    Map Section
                  </CardTitle>
                  <CardDescription>
                    Map background or location image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploadField
                    label="Map Background Image"
                    currentImage={contactContent.map?.backgroundImage}
                    section="map"
                    field="backgroundImage"
                    note="Background image for the map section. Can be an actual map screenshot, location photo, or any relevant image. Recommended size: 1920x600px."
                    aspectRatio="16:5"
                  />
                </CardContent>
              </Card>

              <Button
                onClick={() => saveContent("contact", contactContent)}
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Contact Content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Policies Content - Keep existing implementation */}
          <TabsContent value="policies">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">
                  Policy Pages Content
                </CardTitle>
                <CardDescription>
                  Manage content for policy and information pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10">
                {/* Shipping Policy Section */}
                <div className="space-y-6 border border-[#444] p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold gold-text border-b border-[#333] pb-3 mb-6">
                    Shipping Policy Page Content
                  </h3>

                  {renderInputField(
                    "shippingHeroSubtitle",
                    "Hero Subtitle",
                    "shippingPolicy.heroSubtitle"
                  )}

                  {/* Shipping Methods Subsection */}
                  <div className="space-y-4 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Shipping Methods Section
                    </h4>
                    {renderInputField(
                      "smMainTitle",
                      "Main Title",
                      "shippingPolicy.sections.shippingMethods.mainTitle"
                    )}

                    <div className="grid md:grid-cols-3 gap-4 p-4 border border-[#2a2a2a] rounded">
                      <div className="md:col-span-1 space-y-2">
                        {" "}
                        <Label className="text-gray-400">
                          Standard Shipping
                        </Label>
                        {renderInputField(
                          "smStdTitle",
                          "Title",
                          "shippingPolicy.sections.shippingMethods.standard.title"
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {renderTextareaField(
                          "smStdDesc",
                          "Description",
                          "shippingPolicy.sections.shippingMethods.standard.description",
                          4
                        )}
                        {renderTextareaField(
                          "smStdDetails",
                          "Details (one item per line)",
                          "shippingPolicy.sections.shippingMethods.standard.details",
                          4
                        )}
                      </div>
                    </div>
                    {/* <div className="grid md:grid-cols-3 gap-4 p-4 border border-[#2a2a2a] rounded">
                      <div className="md:col-span-1 space-y-2">
                        {" "}
                        <Label className="text-gray-400">
                          Express Shipping
                        </Label>
                        {renderInputField(
                          "smExpTitle",
                          "Title",
                          "shippingPolicy.sections.shippingMethods.express.title"
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {renderTextareaField(
                          "smExpDesc",
                          "Description",
                          "shippingPolicy.sections.shippingMethods.express.description",
                          4
                        )}
                        {renderTextareaField(
                          "smExpDetails",
                          "Details (one item per line)",
                          "shippingPolicy.sections.shippingMethods.express.details",
                          4
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 p-4 border border-[#2a2a2a] rounded">
                      <div className="md:col-span-1 space-y-2">
                        {" "}
                        <Label className="text-gray-400">
                          Same-Day Delivery
                        </Label>
                        {renderInputField(
                          "smSmdTitle",
                          "Title",
                          "shippingPolicy.sections.shippingMethods.sameDay.title"
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {renderTextareaField(
                          "smSmdDesc",
                          "Description",
                          "shippingPolicy.sections.shippingMethods.sameDay.description",
                          4
                        )}
                        {renderTextareaField(
                          "smSmdDetails",
                          "Details (one item per line)",
                          "shippingPolicy.sections.shippingMethods.sameDay.details",
                          4
                        )}
                        {renderInputField(
                          "smSmdEligNote",
                          "Eligibility Note",
                          "shippingPolicy.sections.shippingMethods.sameDay.eligibilityNote"
                        )}
                      </div>
                    </div> */}
                  </div>

                  {/* Delivery Information Subsection */}
                  <div className="space-y-4 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Delivery Information Section
                    </h4>
                    {renderInputField(
                      "diMainTitle",
                      "Main Title",
                      "shippingPolicy.sections.deliveryInformation.mainTitle"
                    )}
                    {renderInputField(
                      "diProcTitle",
                      "Delivery Process Title",
                      "shippingPolicy.sections.deliveryInformation.deliveryProcess.title"
                    )}
                    {renderTextareaField(
                      "diProcText",
                      "Delivery Process Text",
                      "shippingPolicy.sections.deliveryInformation.deliveryProcess.text"
                    )}
                    {renderInputField(
                      "diTrackTitle",
                      "Tracking Order Title",
                      "shippingPolicy.sections.deliveryInformation.trackingYourOrder.title"
                    )}
                    {renderTextareaField(
                      "diTrackText",
                      "Tracking Order Text",
                      "shippingPolicy.sections.deliveryInformation.trackingYourOrder.text"
                    )}
                    {renderInputField(
                      "diAreasTitle",
                      "Delivery Areas Title",
                      "shippingPolicy.sections.deliveryInformation.deliveryAreas.title"
                    )}
                    {renderTextareaField(
                      "diAreasText",
                      "Delivery Areas Text",
                      "shippingPolicy.sections.deliveryInformation.deliveryAreas.text"
                    )}
                    {renderTextareaField(
                      "diWarnText",
                      "Legal Warning Text",
                      "shippingPolicy.sections.deliveryInformation.legalWarning.text"
                    )}
                  </div>

                  {/* Packaging & Discretion Subsection */}
                  <div className="space-y-4 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Packaging & Discretion Section
                    </h4>
                    {renderInputField(
                      "pdMainTitle",
                      "Main Title",
                      "shippingPolicy.sections.packagingAndDiscretion.mainTitle"
                    )}
                    {renderInputField(
                      "pdDiscTitle",
                      "Discreet Packaging Title",
                      "shippingPolicy.sections.packagingAndDiscretion.discreetPackaging.title"
                    )}
                    {renderTextareaField(
                      "pdDiscText",
                      "Discreet Packaging Text",
                      "shippingPolicy.sections.packagingAndDiscretion.discreetPackaging.text"
                    )}
                    {renderInputField(
                      "pdSecTitle",
                      "Secure Packaging Title",
                      "shippingPolicy.sections.packagingAndDiscretion.securePackaging.title"
                    )}
                    {renderTextareaField(
                      "pdSecText",
                      "Secure Packaging Text",
                      "shippingPolicy.sections.packagingAndDiscretion.securePackaging.text"
                    )}
                    {renderInputField(
                      "pdEcoTitle",
                      "Eco-Friendly Title",
                      "shippingPolicy.sections.packagingAndDiscretion.ecoFriendlyApproach.title"
                    )}
                    {renderTextareaField(
                      "pdEcoText",
                      "Eco-Friendly Text",
                      "shippingPolicy.sections.packagingAndDiscretion.ecoFriendlyApproach.text"
                    )}
                  </div>

                  {/* Returns & Refunds (on Shipping Page) Subsection */}
                  <div className="space-y-4 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Returns & Refunds Section (Shipping Page)
                    </h4>
                    {renderInputField(
                      "rrMainTitle",
                      "Main Title",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.mainTitle"
                    )}
                    {renderInputField(
                      "rrRetPolTitle",
                      "Return Policy Title",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.returnPolicyInfo.title"
                    )}
                    {renderTextareaField(
                      "rrRetPolText",
                      "Return Policy Text",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.returnPolicyInfo.text"
                    )}
                    {renderInputField(
                      "rrRefProcTitle",
                      "Refund Process Title",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.refundProcess.title"
                    )}
                    {renderTextareaField(
                      "rrRefProcText",
                      "Refund Process Text",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.refundProcess.text"
                    )}
                    {renderInputField(
                      "rrDamTitle",
                      "Damaged/Missing Items Title",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.damagedOrMissingItems.title"
                    )}
                    {renderTextareaField(
                      "rrDamText",
                      "Damaged/Missing Items Text",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.damagedOrMissingItems.text"
                    )}
                    {renderInputField(
                      "rrContactTitle",
                      "Contact Service Title",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.contactCustomerService.title"
                    )}
                    {renderTextareaField(
                      "rrContactText",
                      "Contact Service Text",
                      "shippingPolicy.sections.returnsAndRefundsPolicy.contactCustomerService.text"
                    )}
                  </div>
                </div>

                {/* Other Policies (as simple textareas) */}
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="returnPolicy"
                    className="text-gray-300 text-xl gold-text"
                  >
                    General Return Policy
                  </Label>
                  <Textarea
                    id="returnPolicy"
                    value={policyContent.returnPolicy}
                    onChange={(e) =>
                      setPolicyContent((prev) => ({
                        ...prev,
                        returnPolicy: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div> */}

                {/* <div className="space-y-2">
                  <Label
                    htmlFor="privacyPolicy"
                    className="text-gray-300 text-xl gold-text"
                  >
                    Privacy Policy
                  </Label>
                  <Textarea
                    id="privacyPolicy"
                    value={policyContent.privacyPolicy}
                    onChange={(e) =>
                      setPolicyContent((prev) => ({
                        ...prev,
                        privacyPolicy: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[150px]"
                    rows={6}
                  />
                </div> */}

                {/* Terms & Conditions Section */}
                <div className="space-y-6 border border-[#444] p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold gold-text border-b border-[#333] pb-3 mb-6">
                    Terms & Conditions Page Content
                  </h3>

                  {renderInputField(
                    "tcHeroSubtitle",
                    "Hero Subtitle",
                    "termsConditions.heroSubtitle"
                  )}

                  {/* Age Verification Warning */}
                  <div className="space-y-2 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Age Verification Warning
                    </h4>
                    {renderInputField(
                      "tcAgeWarnTitle",
                      "Title",
                      "termsConditions.ageVerificationWarning.title"
                    )}
                    {renderTextareaField(
                      "tcAgeWarnText",
                      "Text",
                      "termsConditions.ageVerificationWarning.text"
                    )}
                  </div>

                  {/* Introduction */}
                  <div className="space-y-2 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Introduction
                    </h4>
                    {renderTextareaField(
                      "tcIntroP1",
                      "Paragraph 1",
                      "termsConditions.introduction.paragraph1"
                    )}
                    {renderTextareaField(
                      "tcIntroP2",
                      "Paragraph 2",
                      "termsConditions.introduction.paragraph2"
                    )}
                  </div>

                  {/* Dynamic Sections */}
                  <div className="space-y-8 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-4">
                      Content Sections
                    </h4>
                    {policyContent.termsConditions.sections &&
                      policyContent.termsConditions.sections.map(
                        (section, index) => (
                          <div
                            key={index}
                            className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a] space-y-3"
                          >
                            <h5 className="text-lg font-semibold text-white">
                              Section {index + 1}
                            </h5>
                            {renderInputField(
                              `tcSec${index}Title`,
                              "Section Title",
                              `termsConditions.sections.${index}.title`
                            )}
                            {section.paragraphs &&
                              section.paragraphs.map((paragraph, pIndex) => (
                                <div key={`${index}-${pIndex}`}>
                                  {renderTextareaField(
                                    `tcSec${index}P${pIndex}`,
                                    `Paragraph ${pIndex + 1}`,
                                    `termsConditions.sections.${index}.paragraphs.${pIndex}`
                                  )}
                                </div>
                              ))}
                            {/* You could add buttons here to add/remove paragraphs or sections if needed */}
                          </div>
                        )
                      )}
                    {/* For now, adding/removing sections would be manual in code or require a more complex UI */}
                    <p className="text-sm text-gray-500">
                      Note: To add or remove sections/paragraphs, you might need
                      to adjust the default structure in the component code for
                      now.
                    </p>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-2 border-t border-[#333] pt-6">
                    <h4 className="text-xl font-medium text-gray-200 mb-1">
                      Contact Section
                    </h4>
                    {renderInputField(
                      "tcContactTitle",
                      "Title",
                      "termsConditions.contactSection.title"
                    )}
                    {renderTextareaField(
                      "tcContactText",
                      "Text",
                      "termsConditions.contactSection.text"
                    )}
                    {renderInputField(
                      "tcContactBtnText",
                      "Button Text",
                      "termsConditions.contactSection.buttonText"
                    )}
                    {renderInputField(
                      "tcContactBtnLink",
                      "Button Link",
                      "termsConditions.contactSection.buttonLink"
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => saveContent("policies", policyContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-2 hover:border-[#D4AF37] hover:cursor-pointer transition-all duration-500 hover:text-[#D4AF37] text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Policies Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
