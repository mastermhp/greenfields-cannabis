"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const shippingCost = cartTotal > 100 ? 0 : 9.99;
  const salesTaxRate = 0.0925;
  const exciseTaxRate = 0.15;
  const cannabisTaxRate = 0.12;

  const salesTax = (cartTotal - discount) * salesTaxRate;
  const exciseTax = (cartTotal - discount) * exciseTaxRate;
  const cannabisTax = (cartTotal - discount) * cannabisTaxRate;

  const taxAmount = salesTax + exciseTax + cannabisTax;
  const orderTotal = cartTotal - discount + shippingCost + taxAmount;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Empty Promo Code",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingPromo(true);

    // Simulate API call to validate promo code
    setTimeout(() => {
      if (promoCode.toUpperCase() === "WELCOME20") {
        const discountAmount = cartTotal * 0.2; // 20% discount
        setDiscount(discountAmount);
        toast({
          title: "Promo Code Applied",
          description: "20% discount has been applied to your order.",
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "The promo code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleCheckout = () => {
    setLoading(true);

    // Simulate checkout process
    setTimeout(() => {
      setLoading(false);
      router.push("/checkout");
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingBag size={80} className="mx-auto mb-6 text-[#333]" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gold-text">
              Your Cart is Empty
            </h1>
            <p className="text-beige text-lg mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button
              asChild
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-black text-lg py-6 px-8 rounded-none"
            >
              <Link href="/products">
                Browse Products <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 gold-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Cart
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <motion.div
            className="lg:w-2/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#111] border border-[#333] mb-6">
              <div className="p-6 border-b border-[#333]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    Shopping Cart ({cartItems.length} items)
                  </h2>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to clear your cart?")
                      ) {
                        clearCart();
                      }
                    }}
                    className="text-[#D4AF37] hover:underline text-sm flex items-center cursor-pointer"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[#333]">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                    <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 sm:mr-6 bg-[#222] relative">
                      <Image
                        src={
                          item.images[0] ||
                          "https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="font-medium mb-1">{item.name}</h3>
                          <p className="text-sm text-beige mb-2 capitalize">
                            {item.category}
                          </p>
                          {item.weight && (
                            <p className="text-sm text-beige mb-4">
                              {item.weight}g
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-[#D4AF37]">
                            ${item.price.toFixed(2)}
                          </p>
                          {item.oldPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              ${item.oldPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center border border-[#333] hover:border-[#D4AF37]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center border border-[#333] hover:border-[#D4AF37]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[#D4AF37] hover:text-[#D4AF37] flex items-center justify-center h-10 w-10 border-2 border-[#D4AF37] rounded-full hover:bg-[#D4AF37]/40 cursor-pointer transition-all duration-1000"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-[#333] flex justify-between">
                <Link
                  href="/products"
                  className="text-[#D4AF37] hover:underline flex items-center cursor-pointer"
                >
                  <ArrowRight className="mr-2 rotate-180" size={16} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-[#111] border border-[#333] p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-beige">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-beige">Shipping</span>
                  <span>
                    {shippingCost === 0
                      ? "Free"
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  {/* <span className="text-beige">Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span> */}
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (9.25%)</span>
                  <span>${salesTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Excise Tax (15%)</span>
                  <span>${exciseTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cannabis Tax (12%)</span>
                  <span>${cannabisTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#333] pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label
                  htmlFor="promo-code"
                  className="block text-sm font-medium text-beige mb-2"
                >
                  Promo Code
                </label>
                <div className="flex">
                  <Input
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo}
                    className="ml-2 bg-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border hover:border-[#D4AF37] hover:text-[#D4AF37] text-black whitespace-nowrap cursor-pointer transition-all duration-1000"
                  >
                    {isApplyingPromo ? "Applying..." : "Apply"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Try "WELCOME20" for 20% off your first order
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-1000 cursor-pointer text-black text-lg py-6 rounded-none mb-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
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
                    Processing...
                  </span>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>

              {/* Trust Badges */}
              <div className="border-t border-[#333] pt-6">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <Truck className="text-[#D4AF37] mr-2" size={18} />
                    <span className="text-sm text-beige">
                      Free shipping over $100
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="text-[#D4AF37] mr-2" size={18} />
                    <span className="text-sm text-beige">Secure checkout</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <CreditCard className="text-gray-400" size={24} />
                  <CreditCard className="text-gray-400" size={24} />
                  <CreditCard className="text-gray-400" size={24} />
                  <CreditCard className="text-gray-400" size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
