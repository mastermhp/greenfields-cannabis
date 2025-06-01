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
import { Loader2, Save, FileText, ImageIcon, Globe } from "lucide-react";

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
      // Content for the "Returns & Refunds" section on the shipping page
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

// NEW: Define the structure for Terms & Conditions
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
      icon: "Shield", // Using Shield icon for Privacy Policy link
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
  returnPolicy: "", // This is for the separate, general Return Policy page
  privacyPolicy: "",
  termsConditions: initialTermsConditionsStructure, // Initialize with the new structure
};

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // Content states for different pages
  const [aboutContent, setAboutContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    missionTitle: "",
    missionText: "",
    valuesTitle: "",
    valuesText: "",
    teamTitle: "",
    teamText: "",
    amelieDescription: "",
    baylieDescription: "",
    chloeDescription: "",
    promiseTitle: "",
    promiseText: "",
    journeyTitle: "",
    journeyText: "",
  });

  const [contactContent, setContactContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    address: "",
    phone: "",
    email: "",
    businessHours: "",
    mapTitle: "",
    mapDescription: "",
    socialLinks: "",
  });

  const [homeContent, setHomeContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    featuredTitle: "",
    featuredSubtitle: "",
    aboutTitle: "",
    aboutText: "",
    testimonialsTitle: "",
    ctaTitle: "",
    ctaText: "",
  });

  const [policyContent, setPolicyContent] = useState(initialPolicyContentState);

  // Fetch content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Fetch content for all pages
        const [aboutRes, contactRes, homeRes, policyRes] = await Promise.all([
          fetch("/api/content-management?page=about"),
          fetch("/api/content-management?page=contact"),
          fetch("/api/content-management?page=home"),
          fetch("/api/content-management?page=policies"),
        ]);

        const [aboutData, contactData, homeData, policyData] =
          await Promise.all([
            aboutRes.json(),
            contactRes.json(),
            homeRes.json(),
            policyRes.json(),
          ]);

        if (aboutData.success && aboutData.data)
          setAboutContent((prev) => ({ ...prev, ...aboutData.data }));
        if (contactData.success && contactData.data)
          setContactContent((prev) => ({ ...prev, ...contactData.data }));
        if (homeData.success && homeData.data)
          setHomeContent((prev) => ({ ...prev, ...homeData.data }));

        if (policyData.success && policyData.data) {
          const fetchedPolicies = policyData.data;
          // Deep merge fetched shipping policy with default structure
          const mergedShippingPolicy = {
            ...initialShippingPolicyStructure, // Start with full default structure
            ...(typeof fetchedPolicies.shippingPolicy === "object" &&
            fetchedPolicies.shippingPolicy !== null
              ? fetchedPolicies.shippingPolicy
              : {}),
            sections: {
              ...initialShippingPolicyStructure.sections,
              ...(typeof fetchedPolicies.shippingPolicy === "object" &&
              fetchedPolicies.shippingPolicy !== null &&
              fetchedPolicies.shippingPolicy.sections
                ? fetchedPolicies.shippingPolicy.sections
                : {}),
              shippingMethods: {
                ...initialShippingPolicyStructure.sections.shippingMethods,
                ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                fetchedPolicies.shippingPolicy !== null &&
                fetchedPolicies.shippingPolicy.sections?.shippingMethods
                  ? fetchedPolicies.shippingPolicy.sections.shippingMethods
                  : {}),
                standard: {
                  ...initialShippingPolicyStructure.sections.shippingMethods
                    .standard,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.shippingMethods
                    ?.standard
                    ? fetchedPolicies.shippingPolicy.sections.shippingMethods
                        .standard
                    : {}),
                },
                express: {
                  ...initialShippingPolicyStructure.sections.shippingMethods
                    .express,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.shippingMethods
                    ?.express
                    ? fetchedPolicies.shippingPolicy.sections.shippingMethods
                        .express
                    : {}),
                },
                sameDay: {
                  ...initialShippingPolicyStructure.sections.shippingMethods
                    .sameDay,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.shippingMethods
                    ?.sameDay
                    ? fetchedPolicies.shippingPolicy.sections.shippingMethods
                        .sameDay
                    : {}),
                },
              },
              deliveryInformation: {
                ...initialShippingPolicyStructure.sections.deliveryInformation,
                ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                fetchedPolicies.shippingPolicy !== null &&
                fetchedPolicies.shippingPolicy.sections?.deliveryInformation
                  ? fetchedPolicies.shippingPolicy.sections.deliveryInformation
                  : {}),
                deliveryProcess: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation
                    .deliveryProcess,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.deliveryInformation
                    ?.deliveryProcess
                    ? fetchedPolicies.shippingPolicy.sections
                        .deliveryInformation.deliveryProcess
                    : {}),
                },
                trackingYourOrder: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation
                    .trackingYourOrder,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.deliveryInformation
                    ?.trackingYourOrder
                    ? fetchedPolicies.shippingPolicy.sections
                        .deliveryInformation.trackingYourOrder
                    : {}),
                },
                deliveryAreas: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation
                    .deliveryAreas,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections?.deliveryInformation
                    ?.deliveryAreas
                    ? fetchedPolicies.shippingPolicy.sections
                        .deliveryInformation.deliveryAreas
                    : {}),
                },
              },
              packagingAndDiscretion: {
                ...initialShippingPolicyStructure.sections
                  .packagingAndDiscretion,
                ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                fetchedPolicies.shippingPolicy !== null &&
                fetchedPolicies.shippingPolicy.sections?.packagingAndDiscretion
                  ? fetchedPolicies.shippingPolicy.sections
                      .packagingAndDiscretion
                  : {}),
                discreetPackaging: {
                  ...initialShippingPolicyStructure.sections
                    .packagingAndDiscretion.discreetPackaging,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.packagingAndDiscretion?.discreetPackaging
                    ? fetchedPolicies.shippingPolicy.sections
                        .packagingAndDiscretion.discreetPackaging
                    : {}),
                },
                securePackaging: {
                  ...initialShippingPolicyStructure.sections
                    .packagingAndDiscretion.securePackaging,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.packagingAndDiscretion?.securePackaging
                    ? fetchedPolicies.shippingPolicy.sections
                        .packagingAndDiscretion.securePackaging
                    : {}),
                },
                ecoFriendlyApproach: {
                  ...initialShippingPolicyStructure.sections
                    .packagingAndDiscretion.ecoFriendlyApproach,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.packagingAndDiscretion?.ecoFriendlyApproach
                    ? fetchedPolicies.shippingPolicy.sections
                        .packagingAndDiscretion.ecoFriendlyApproach
                    : {}),
                },
              },
              returnsAndRefundsPolicy: {
                ...initialShippingPolicyStructure.sections
                  .returnsAndRefundsPolicy,
                ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                fetchedPolicies.shippingPolicy !== null &&
                fetchedPolicies.shippingPolicy.sections?.returnsAndRefundsPolicy
                  ? fetchedPolicies.shippingPolicy.sections
                      .returnsAndRefundsPolicy
                  : {}),
                returnPolicyInfo: {
                  ...initialShippingPolicyStructure.sections
                    .returnsAndRefundsPolicy.returnPolicyInfo,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.returnsAndRefundsPolicy?.returnPolicyInfo
                    ? fetchedPolicies.shippingPolicy.sections
                        .returnsAndRefundsPolicy.returnPolicyInfo
                    : {}),
                },
                refundProcess: {
                  ...initialShippingPolicyStructure.sections
                    .returnsAndRefundsPolicy.refundProcess,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.returnsAndRefundsPolicy?.refundProcess
                    ? fetchedPolicies.shippingPolicy.sections
                        .returnsAndRefundsPolicy.refundProcess
                    : {}),
                },
                damagedOrMissingItems: {
                  ...initialShippingPolicyStructure.sections
                    .returnsAndRefundsPolicy.damagedOrMissingItems,
                  ...(typeof fetchedPolicies.shippingPolicy === "object" &&
                  fetchedPolicies.shippingPolicy !== null &&
                  fetchedPolicies.shippingPolicy.sections
                    ?.returnsAndRefundsPolicy?.damagedOrMissingItems
                    ? fetchedPolicies.shippingPolicy.sections
                        .returnsAndRefundsPolicy.damagedOrMissingItems
                    : {}),
                },
              },
            },
          };

          // NEW: Merge termsConditions
          const mergedTermsConditions = {
            ...initialTermsConditionsStructure,
            ...(typeof fetchedPolicies.termsConditions === "object" &&
            fetchedPolicies.termsConditions !== null
              ? fetchedPolicies.termsConditions
              : {}),
            // For sections, iterate and merge, or simply take the fetched if it's an array
            sections: Array.isArray(fetchedPolicies.termsConditions?.sections)
              ? fetchedPolicies.termsConditions.sections.map(
                  (fetchedSection, index) => ({
                    ...(initialTermsConditionsStructure.sections[index] || {}), // Fallback to initial if specific section exists
                    ...fetchedSection,
                    // Ensure paragraphs are arrays
                    paragraphs: Array.isArray(fetchedSection.paragraphs)
                      ? fetchedSection.paragraphs
                      : initialTermsConditionsStructure.sections[index]
                          ?.paragraphs || [],
                  })
                )
              : initialTermsConditionsStructure.sections, // Fallback to initial structure if sections are missing
            // For simple objects like ageVerificationWarning, introduction, contactSection
            ageVerificationWarning: {
              ...initialTermsConditionsStructure.ageVerificationWarning,
              ...(fetchedPolicies.termsConditions?.ageVerificationWarning ||
                {}),
            },
            introduction: {
              ...initialTermsConditionsStructure.introduction,
              ...(fetchedPolicies.termsConditions?.introduction || {}),
            },
            contactSection: {
              ...initialTermsConditionsStructure.contactSection,
              ...(fetchedPolicies.termsConditions?.contactSection || {}),
            },
          };

          setPolicyContent((prev) => ({
            ...initialPolicyContentState, // ensure all top-level policy keys exist
            ...fetchedPolicies, // then spread fetched general policies (like returnPolicy, privacyPolicy if they were strings)
            shippingPolicy: mergedShippingPolicy, // finally set the deeply merged shipping policy
            termsConditions: mergedTermsConditions, // NEW: Set the deeply merged terms conditions
          }));
        } else if (policyData.success && !policyData.data) {
          setPolicyContent(initialPolicyContentState); // Set to default if no data from API
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

  const handlePolicyChange = (path, value) => {
    setPolicyContent((prev) => {
      // Create a deep copy to ensure immutability
      // For robust deep cloning, a library like lodash.cloneDeep or immer would be better in a larger app.
      // Using JSON.parse(JSON.stringify(...)) for simplicity here.
      const newPolicyContent = JSON.parse(JSON.stringify(prev));

      const keys = path.split(".");
      let currentTarget = newPolicyContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (
          currentTarget[keys[i]] === undefined ||
          typeof currentTarget[keys[i]] !== "object"
        ) {
          // If path doesn't exist or is not an object, create it.
          // This might be needed if the initial state is sparse or data from API is incomplete.
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
    console.log(`[SAVE_CONTENT] Attempting to save page: ${page}`);
    console.log(
      "[SAVE_CONTENT] Content to save:",
      JSON.parse(JSON.stringify(content))
    ); // Log a deep copy

    try {
      setSaving(true);
      console.log(
        "[SAVE_CONTENT] setSaving(true) - UI should show 'Saving...'"
      );

      const requestBody = { page, section: "main", content };
      console.log(
        "[SAVE_CONTENT] Request body:",
        JSON.parse(JSON.stringify(requestBody))
      );

      const response = await fetch("/api/content-management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("[SAVE_CONTENT] Response received from API:", response);
      console.log(
        `[SAVE_CONTENT] Response status: ${response.status}, Response ok: ${response.ok}`
      );

      // Try to get text first to see what the raw response is, especially for non-ok responses
      const responseText = await response.text();
      console.log("[SAVE_CONTENT] Raw response text:", responseText);

      if (!response.ok) {
        // Handle non-2xx responses
        console.error(
          `[SAVE_CONTENT] API Error: Status ${response.status}`,
          responseText
        );
        let errorMessage = `API Error: Status ${response.status}.`;
        try {
          const errorData = JSON.parse(responseText); // Try to parse if it's JSON
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Not JSON, use the raw text or a generic message
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // If response.ok is true, then try to parse as JSON
      const data = JSON.parse(responseText);
      console.log("[SAVE_CONTENT] Parsed response data:", data);

      if (data.success) {
        console.log(
          "[SAVE_CONTENT] data.success is true. Showing success toast."
        );
        toast({
          title: "Success",
          description: `${
            page.charAt(0).toUpperCase() + page.slice(1)
          } content updated successfully`,
        });
      } else {
        console.warn(
          "[SAVE_CONTENT] data.success is false. Throwing error. Message:",
          data.message
        );
        throw new Error(
          data.message || "Failed to update content (API indicated failure)"
        );
      }
    } catch (error) {
      console.error(
        `[SAVE_CONTENT] Error during save operation for page '${page}':`,
        error
      );
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to save ${page} content. Check console for details.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      console.log(
        "[SAVE_CONTENT] setSaving(false) - UI should revert button state."
      );
      console.log("----------------------------------------------------");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading content...</span>
      </div>
    );
  }

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
            Manage website content for different pages
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <FileText size={16} />
              About Page
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Globe size={16} />
              Contact Page
            </TabsTrigger>
            <TabsTrigger value="home" className="flex items-center gap-2">
              <ImageIcon size={16} />
              Home Page
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText size={16} />
              Policies
            </TabsTrigger>
          </TabsList>

          {/* About Page Content */}
          <TabsContent value="about">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">About Page Content</CardTitle>
                <CardDescription>
                  Manage content for the about page sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="aboutHeroTitle"
                      value={aboutContent.heroTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          heroTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="aboutHeroSubtitle"
                      className="text-gray-300"
                    >
                      Hero Subtitle
                    </Label>
                    <Input
                      id="aboutHeroSubtitle"
                      value={aboutContent.heroSubtitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          heroSubtitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="aboutMissionTitle"
                      className="text-gray-300"
                    >
                      Mission Title
                    </Label>
                    <Input
                      id="aboutMissionTitle"
                      value={aboutContent.missionTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          missionTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutValuesTitle" className="text-gray-300">
                      Values Title
                    </Label>
                    <Input
                      id="aboutValuesTitle"
                      value={aboutContent.valuesTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          valuesTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="amelieDescription"
                      className="text-gray-300"
                    >
                      Amelie Description
                    </Label>
                    <Input
                      id="amelieDescription"
                      value={aboutContent.amelieDescription}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          amelieDescription: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="baylieDescription"
                      className="text-gray-300"
                    >
                      Baylie Description
                    </Label>
                    <Input
                      id="baylieDescription"
                      value={aboutContent.baylieDescription}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          baylieDescription: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chloeDescription" className="text-gray-300">
                      Chloe Description
                    </Label>
                    <Input
                      id="chloeDescription"
                      value={aboutContent.chloeDescription}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          chloeDescription: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamTitle" className="text-gray-300">
                      Team Title
                    </Label>
                    <Input
                      id="teamTitle"
                      value={aboutContent.teamTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          teamTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promiseTitle" className="text-gray-300">
                      Promise Title
                    </Label>
                    <Input
                      id="promiseTitle"
                      value={aboutContent.promiseTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          promiseTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="journeyTitle" className="text-gray-300">
                      Journey Title
                    </Label>
                    <Input
                      id="journeyTitle"
                      value={aboutContent.journeyTitle}
                      onChange={(e) =>
                        setAboutContent((prev) => ({
                          ...prev,
                          journeyTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMissionText" className="text-gray-300">
                    Mission Text
                  </Label>
                  <Textarea
                    id="aboutMissionText"
                    value={aboutContent.missionText}
                    onChange={(e) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        missionText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutValuesText" className="text-gray-300">
                    Values Text
                  </Label>
                  <Textarea
                    id="aboutValuesText"
                    value={aboutContent.valuesText}
                    onChange={(e) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        valuesText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamText" className="text-gray-300">
                    Team Text
                  </Label>
                  <Textarea
                    id="teamText"
                    value={aboutContent.teamText}
                    onChange={(e) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        teamText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promiseText" className="text-gray-300">
                    Promise Text
                  </Label>
                  <Textarea
                    id="promiseText"
                    value={aboutContent.promiseText}
                    onChange={(e) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        promiseText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journeyText" className="text-gray-300">
                    Journey Text
                  </Label>
                  <Textarea
                    id="journeyText"
                    value={aboutContent.journeyText}
                    onChange={(e) =>
                      setAboutContent((prev) => ({
                        ...prev,
                        journeyText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={() => saveContent("about", aboutContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Page Content */}
          <TabsContent value="contact">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">
                  Contact Page Content
                </CardTitle>
                <CardDescription>
                  Manage content for the contact page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="contactHeroTitle"
                      value={contactContent.heroTitle}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          heroTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactHeroSubtitle"
                      className="text-gray-300"
                    >
                      Hero Subtitle
                    </Label>
                    <Input
                      id="contactHeroSubtitle"
                      value={contactContent.heroSubtitle}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          heroSubtitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactAddress" className="text-gray-300">
                      Address
                    </Label>
                    <Input
                      id="contactAddress"
                      value={contactContent.address}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-gray-300">
                      Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      value={contactContent.phone}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="contactEmail"
                      value={contactContent.email}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactBusinessHours"
                      className="text-gray-300"
                    >
                      Business Hours
                    </Label>
                    <Input
                      id="contactBusinessHours"
                      value={contactContent.businessHours}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          businessHours: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactSocialLinks"
                      className="text-gray-300"
                    >
                      Social Links
                    </Label>
                    <Input
                      id="contactSocialLinks"
                      value={contactContent.socialLinks}
                      onChange={(e) =>
                        setContactContent((prev) => ({
                          ...prev,
                          socialLinks: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => saveContent("contact", contactContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Home Page Content */}
          <TabsContent value="home">
            <Card className="bg-[#111] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Home Page Content</CardTitle>
                <CardDescription>
                  Manage content for the home page sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="homeHeroTitle" className="text-gray-300">
                      Hero Title
                    </Label>
                    <Input
                      id="homeHeroTitle"
                      value={homeContent.heroTitle}
                      onChange={(e) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          heroTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeHeroSubtitle" className="text-gray-300">
                      Hero Subtitle
                    </Label>
                    <Input
                      id="homeHeroSubtitle"
                      value={homeContent.heroSubtitle}
                      onChange={(e) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          heroSubtitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="homeFeaturedTitle"
                      className="text-gray-300"
                    >
                      Featured Section Title
                    </Label>
                    <Input
                      id="homeFeaturedTitle"
                      value={homeContent.featuredTitle}
                      onChange={(e) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          featuredTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeAboutTitle" className="text-gray-300">
                      About Section Title
                    </Label>
                    <Input
                      id="homeAboutTitle"
                      value={homeContent.aboutTitle}
                      onChange={(e) =>
                        setHomeContent((prev) => ({
                          ...prev,
                          aboutTitle: e.target.value,
                        }))
                      }
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeAboutText" className="text-gray-300">
                    About Section Text
                  </Label>
                  <Textarea
                    id="homeAboutText"
                    value={homeContent.aboutText}
                    onChange={(e) =>
                      setHomeContent((prev) => ({
                        ...prev,
                        aboutText: e.target.value,
                      }))
                    }
                    className="bg-[#222] border-[#444] text-white min-h-[120px]"
                    rows={5}
                  />
                </div>

                <Button
                  onClick={() => saveContent("home", homeContent)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Content - Updated */}
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
                    <div className="grid md:grid-cols-3 gap-4 p-4 border border-[#2a2a2a] rounded">
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
                    </div>
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
                <div className="space-y-2">
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
                </div>
                <div className="space-y-2">
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
                </div>
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
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
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
