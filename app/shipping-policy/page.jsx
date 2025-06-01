"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react" // Import Loader2 icon

// Define the initial structure that mirrors the admin panel's structure
// This is crucial for safe access to nested properties, even if data is missing
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

const ShippingPolicyPage = () => {
  const [shippingPolicyContent, setShippingPolicyContent] = useState(initialShippingPolicyStructure);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShippingPolicy = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/content-management?page=policies");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data && data.data.shippingPolicy) {
          // Deep merge the fetched shipping policy with the initial structure
          // This ensures that even if some fields are missing from the DB,
          // the component still has a complete structure to render without errors.
          const fetchedShippingPolicy = data.data.shippingPolicy;

          const mergedPolicy = {
            ...initialShippingPolicyStructure,
            ...fetchedShippingPolicy,
            sections: {
              ...initialShippingPolicyStructure.sections,
              ...(fetchedShippingPolicy.sections || {}), // Ensure sections exists
              shippingMethods: {
                ...initialShippingPolicyStructure.sections.shippingMethods,
                ...(fetchedShippingPolicy.sections?.shippingMethods || {}),
                standard: {
                  ...initialShippingPolicyStructure.sections.shippingMethods.standard,
                  ...(fetchedShippingPolicy.sections?.shippingMethods?.standard || {}),
                },
                express: {
                  ...initialShippingPolicyStructure.sections.shippingMethods.express,
                  ...(fetchedShippingPolicy.sections?.shippingMethods?.express || {}),
                },
                sameDay: {
                  ...initialShippingPolicyStructure.sections.shippingMethods.sameDay,
                  ...(fetchedShippingPolicy.sections?.shippingMethods?.sameDay || {}),
                },
              },
              deliveryInformation: {
                ...initialShippingPolicyStructure.sections.deliveryInformation,
                ...(fetchedShippingPolicy.sections?.deliveryInformation || {}),
                deliveryProcess: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation.deliveryProcess,
                  ...(fetchedShippingPolicy.sections?.deliveryInformation?.deliveryProcess || {}),
                },
                trackingYourOrder: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation.trackingYourOrder,
                  ...(fetchedShippingPolicy.sections?.deliveryInformation?.trackingYourOrder || {}),
                },
                deliveryAreas: {
                  ...initialShippingPolicyStructure.sections.deliveryInformation.deliveryAreas,
                  ...(fetchedShippingPolicy.sections?.deliveryInformation?.deliveryAreas || {}),
                },
                legalWarning: { // Ensure legalWarning is merged
                  ...initialShippingPolicyStructure.sections.deliveryInformation.legalWarning,
                  ...(fetchedShippingPolicy.sections?.deliveryInformation?.legalWarning || {}),
                },
              },
              packagingAndDiscretion: {
                ...initialShippingPolicyStructure.sections.packagingAndDiscretion,
                ...(fetchedShippingPolicy.sections?.packagingAndDiscretion || {}),
                discreetPackaging: {
                  ...initialShippingPolicyStructure.sections.packagingAndDiscretion.discreetPackaging,
                  ...(fetchedShippingPolicy.sections?.packagingAndDiscretion?.discreetPackaging || {}),
                },
                securePackaging: {
                  ...initialShippingPolicyStructure.sections.packagingAndDiscretion.securePackaging,
                  ...(fetchedShippingPolicy.sections?.packagingAndDiscretion?.securePackaging || {}),
                },
                ecoFriendlyApproach: {
                  ...initialShippingPolicyStructure.sections.packagingAndDiscretion.ecoFriendlyApproach,
                  ...(fetchedShippingPolicy.sections?.packagingAndDiscretion?.ecoFriendlyApproach || {}),
                },
              },
              returnsAndRefundsPolicy: {
                ...initialShippingPolicyStructure.sections.returnsAndRefundsPolicy,
                ...(fetchedShippingPolicy.sections?.returnsAndRefundsPolicy || {}),
                returnPolicyInfo: {
                  ...initialShippingPolicyStructure.sections.returnsAndRefundsPolicy.returnPolicyInfo,
                  ...(fetchedShippingPolicy.sections?.returnsAndRefundsPolicy?.returnPolicyInfo || {}),
                },
                refundProcess: {
                  ...initialShippingPolicyStructure.sections.returnsAndRefundsPolicy.refundProcess,
                  ...(fetchedShippingPolicy.sections?.returnsAndRefundsPolicy?.refundProcess || {}),
                },
                damagedOrMissingItems: {
                  ...initialShippingPolicyStructure.sections.returnsAndRefundsPolicy.damagedOrMissingItems,
                  ...(fetchedShippingPolicy.sections?.returnsAndRefundsPolicy?.damagedOrMissingItems || {}),
                },
                contactCustomerService: { // Ensure contactCustomerService is merged
                  ...initialShippingPolicyStructure.sections.returnsAndRefundsPolicy.contactCustomerService,
                  ...(fetchedShippingPolicy.sections?.returnsAndRefundsPolicy?.contactCustomerService || {}),
                },
              },
            },
          };
          setShippingPolicyContent(mergedPolicy);
        } else {
          // If no shippingPolicy data is returned, set to initial default
          setShippingPolicyContent(initialShippingPolicyStructure);
        }
      } catch (error) {
        console.error("Error fetching shipping policy content:", error);
        // On error, revert to initial structure or a simple error message
        setShippingPolicyContent(initialShippingPolicyStructure);
      } finally {
        setLoading(false);
      }
    };
    fetchShippingPolicy();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading shipping policy...</span>
      </div>
    );
  }

  const { heroSubtitle, sections } = shippingPolicyContent;
  const { shippingMethods, deliveryInformation, packagingAndDiscretion, returnsAndRefundsPolicy } = sections;

  // Helper to render text with line breaks (for details fields)
  const renderTextWithBreaks = (text) => {
    if (!text) return null;
    return text.split('\n').map((item, key) => (
      <p key={key} className="mb-1">{item}</p>
    ));
  };


  return (
    <div className="container mx-auto py-40 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] text-beige min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold gold-text mb-4 text-center">Shipping Policy</h1>
        {heroSubtitle && <p className="text-xl text-center mb-10 text-gray-300">{heroSubtitle}</p>}

        {/* Shipping Methods Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold gold-text mb-6 border-b border-[#333] pb-3">{shippingMethods.mainTitle}</h2>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{shippingMethods.standard.title}</h3>
            {shippingMethods.standard.description && <p className="mb-3 text-gray-300">{shippingMethods.standard.description}</p>}
            {shippingMethods.standard.details && (
              <ul className="list-disc list-inside text-gray-400 pl-4">
                {shippingMethods.standard.details.split('\n').map((item, index) => (
                  item.trim() && <li key={index}>{item.trim()}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{shippingMethods.express.title}</h3>
            {shippingMethods.express.description && <p className="mb-3 text-gray-300">{shippingMethods.express.description}</p>}
            {shippingMethods.express.details && (
              <ul className="list-disc list-inside text-gray-400 pl-4">
                {shippingMethods.express.details.split('\n').map((item, index) => (
                  item.trim() && <li key={index}>{item.trim()}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{shippingMethods.sameDay.title}</h3>
            {shippingMethods.sameDay.description && <p className="mb-3 text-gray-300">{shippingMethods.sameDay.description}</p>}
            {shippingMethods.sameDay.details && (
              <ul className="list-disc list-inside text-gray-400 pl-4">
                {shippingMethods.sameDay.details.split('\n').map((item, index) => (
                  item.trim() && <li key={index}>{item.trim()}</li>
                ))}
              </ul>
            )}
            {shippingMethods.sameDay.eligibilityNote && <p className="mt-3 text-sm text-yellow-400">{shippingMethods.sameDay.eligibilityNote}</p>}
          </div>
        </section>

        {/* Delivery Information Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold gold-text mb-6 border-b border-[#333] pb-3">{deliveryInformation.mainTitle}</h2>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{deliveryInformation.deliveryProcess.title}</h3>
            {deliveryInformation.deliveryProcess.text && <p className="text-gray-300">{deliveryInformation.deliveryProcess.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{deliveryInformation.trackingYourOrder.title}</h3>
            {deliveryInformation.trackingYourOrder.text && <p className="text-gray-300">{deliveryInformation.trackingYourOrder.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{deliveryInformation.deliveryAreas.title}</h3>
            {deliveryInformation.deliveryAreas.text && <p className="text-gray-300">{deliveryInformation.deliveryAreas.text}</p>}
          </div>

          {deliveryInformation.legalWarning.text && (
            <div className="bg-red-900/20 p-4 rounded-lg text-red-300 border border-red-700">
              <p className="font-semibold">Legal Warning:</p>
              <p>{deliveryInformation.legalWarning.text}</p>
            </div>
          )}
        </section>

        {/* Packaging & Discretion Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold gold-text mb-6 border-b border-[#333] pb-3">{packagingAndDiscretion.mainTitle}</h2>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{packagingAndDiscretion.discreetPackaging.title}</h3>
            {packagingAndDiscretion.discreetPackaging.text && <p className="text-gray-300">{packagingAndDiscretion.discreetPackaging.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{packagingAndDiscretion.securePackaging.title}</h3>
            {packagingAndDiscretion.securePackaging.text && <p className="text-gray-300">{packagingAndDiscretion.securePackaging.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{packagingAndDiscretion.ecoFriendlyApproach.title}</h3>
            {packagingAndDiscretion.ecoFriendlyApproach.text && <p className="text-gray-300">{packagingAndDiscretion.ecoFriendlyApproach.text}</p>}
          </div>
        </section>

        {/* Returns & Refunds Section (on Shipping Page) */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold gold-text mb-6 border-b border-[#333] pb-3">{returnsAndRefundsPolicy.mainTitle}</h2>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{returnsAndRefundsPolicy.returnPolicyInfo.title}</h3>
            {returnsAndRefundsPolicy.returnPolicyInfo.text && <p className="text-gray-300">{returnsAndRefundsPolicy.returnPolicyInfo.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{returnsAndRefundsPolicy.refundProcess.title}</h3>
            {returnsAndRefundsPolicy.refundProcess.text && <p className="text-gray-300">{returnsAndRefundsPolicy.refundProcess.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{returnsAndRefundsPolicy.damagedOrMissingItems.title}</h3>
            {returnsAndRefundsPolicy.damagedOrMissingItems.text && <p className="text-gray-300">{returnsAndRefundsPolicy.damagedOrMissingItems.text}</p>}
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg mb-8 border border-[#2a2a2a]">
            <h3 className="text-2xl font-semibold text-white mb-3">{returnsAndRefundsPolicy.contactCustomerService.title}</h3>
            {returnsAndRefundsPolicy.contactCustomerService.text && <p className="text-gray-300">{returnsAndRefundsPolicy.contactCustomerService.text}</p>}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ShippingPolicyPage;