"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MessageCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currency, setCurrency] = useState("$");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors: { name?: string; phone?: string; address?: string } = {};
    if (!customerName.trim()) newErrors.name = "Name is required";
    if (!customerPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const digits = customerPhone.replace(/\D/g, "");
      if (digits.length < 7) newErrors.phone = "Enter a valid phone number";
    }
    if (!customerAddress.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppCheckout = () => {
    if (!validate()) {
      // Scroll to first error field
      const firstErrorField = document.querySelector("[data-error='true']") as HTMLElement | null;
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    let message = `*New Order from SoleVault*\n\n`;
    message += `*Customer:* ${customerName}\n`;
    message += `*Phone:* ${customerPhone}\n`;
    message += `*Address:* ${customerAddress}\n`;
    message += `\n*Order Details:*\n`;
    message += `-----------------------------\n`;

    items.forEach((item, i) => {
      message += `${i + 1}. *${item.name}*\n`;
      message += `   Size: ${item.size} | Color: ${item.color}\n`;
      message += `   Qty: ${item.quantity} x ${currency}${item.price.toFixed(2)}\n`;
      message += `   Subtotal: ${currency}${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `-----------------------------\n`;
    message += `*Total: ${currency}${totalPrice.toFixed(2)}*\n`;
    message += `*Items: ${totalItems}*\n`;

    const phone = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="animate-pulse text-gray-400">Loading cart...</div>
        </div>
      </main>
    );
  }

  const inputBase = "w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition";
  const inputOk = "border-gray-200 focus:ring-gray-900";
  const inputErr = "border-red-400 focus:ring-red-400";

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>

          <h1 className="text-3xl lg:text-4xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some shoes to get started!</p>
              <Link href="/shop" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition inline-block">
                Browse Shoes
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : null}
                      {!item.imageUrl && (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Size: {item.size} - Color: {item.color}
                      </p>
                      <p className="text-lg font-bold mt-2">{currency}{item.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                            className="p-2 hover:bg-gray-200 transition rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 transition rounded-r-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  Clear Cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-2xl p-6 sticky top-28">
                  <h3 className="text-lg font-bold mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">{currency}{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg">{currency}{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={customerName}
                        data-error={!!errors.name}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                      />
                      {errors.name && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={customerPhone}
                        data-error={!!errors.phone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
                      />
                      {errors.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Street, City, Country"
                        value={customerAddress}
                        data-error={!!errors.address}
                        onChange={(e) => {
                          setCustomerAddress(e.target.value);
                          if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                        }}
                        rows={2}
                        className={`${inputBase} resize-none ${errors.address ? inputErr : inputOk}`}
                      />
                      {errors.address && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Checkout */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-2xl font-semibold text-lg hover:bg-green-600 transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Checkout via WhatsApp
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    You&apos;ll be redirected to WhatsApp to complete your order
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
