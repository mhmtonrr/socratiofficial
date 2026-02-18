'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PaymentPage() {
    const { data: session } = useSession();
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();
    const router = useRouter();
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zip: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: ''
    });

    const [isSuccess, setIsSuccess] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

    // Redirect if cart is empty
    useEffect(() => {
        if (cartCount === 0 && !isSuccess) {
            router.push('/cart');
        }
    }, [cartCount, router, isSuccess]);

    useEffect(() => {
        if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session?.user?.email || '' }));
            fetchSavedAddresses();
        }
    }, [session]);

    const fetchSavedAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            if (res.ok) {
                const data = await res.json();
                setSavedAddresses(data);
                // Auto-select default address
                const defaultAddr = data.find((a: any) => a.isDefault);
                if (defaultAddr) handleAddressSelect(defaultAddr);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddressSelect = (addr: any) => {
        setSelectedAddressId(addr.id);
        setFormData(prev => ({
            ...prev,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
            address: `${addr.street}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
            city: addr.city,
            zip: addr.zipCode
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { id, value } = e.target;

        // Auto-format Expiry Date (MM/YY)
        if (id === 'expiry') {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }
        }

        // Auto-format Card Number (1234 5678...)
        if (id === 'cardNumber') {
            value = value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add spaces every 4 digits
        }

        // Limit CVV
        if (id === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 3);
        }

        setFormData(prev => ({ ...prev, [id]: value }));

        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Contact Info Validation
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone format';

        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        else if (!nameRegex.test(formData.firstName)) newErrors.firstName = 'Name can only contain letters';

        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        else if (!nameRegex.test(formData.lastName)) newErrors.lastName = 'Name can only contain letters';

        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';

        if (!formData.zip) newErrors.zip = 'Postal code is required';
        else if (formData.zip.length < 4) newErrors.zip = 'Invalid postal code';

        // Payment Validation (only if card is selected)
        if (paymentMethod === 'card') {
            const cleanCard = formData.cardNumber.replace(/\s/g, '');
            if (!cleanCard) newErrors.cardNumber = 'Card number is required';
            else if (!/^\d{16}$/.test(cleanCard)) newErrors.cardNumber = 'Card must be 16 digits';

            if (!formData.expiry) newErrors.expiry = 'Expiry is required';
            else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = 'Use MM/YY format';

            if (!formData.cvv) newErrors.cvv = 'CVV is required';
            else if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'Invalid CVV (3 digits)';

            if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
            else if (!nameRegex.test(formData.cardName)) newErrors.cardName = 'Name can only contain letters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const subtotal = cartTotal;
    const standardShippingFee = subtotal > 5000 ? 0 : 250;
    const shipping = shippingMethod === 'standard' ? standardShippingFee : shippingMethod === 'express' ? 450 : 650;
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            const firstError = document.querySelector('.text-rose-500');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contact: {
                        email: formData.email,
                        phone: formData.phone,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        city: formData.city,
                        zip: formData.zip
                    },
                    cartItems: cartItems,
                    totalAmount: total,
                    shippingMethod: shippingMethod
                })
            });

            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                clearCart();
                router.push(`/order-success?orderNumber=${data.orderNumber}`);
            } else {
                alert(data.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = (id: string) => `w-full bg-transparent border ${errors[id] ? 'border-rose-500 focus:border-rose-500' : 'border-gray-300 focus:border-primary'} px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none transition-colors`;

    return (
        <>
            <Header />
            <main className="bg-background-light py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-serif text-text-main-light mb-2">Checkout</h1>
                        <div className="flex items-center gap-2 text-sm text-text-muted-light">
                            <Lock className="w-4 h-4" />
                            <span>Secure Checkout</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">1. Contact Information</h2>
                                </div>

                                {savedAddresses.length > 0 && (
                                    <div className="mb-8 animate-in fade-in duration-500">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 px-1">Choose Saved Address</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {savedAddresses.map((addr) => (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => handleAddressSelect(addr)}
                                                    className={`text-left p-6 border transition-all relative group ${selectedAddressId === addr.id ? 'border-primary bg-primary/[0.03]' : 'border-gray-200 hover:border-gray-400'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] uppercase font-black tracking-widest text-text-main-light">{addr.title}</span>
                                                        {selectedAddressId === addr.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                                                    </div>
                                                    <p className="text-xs font-bold text-text-main-light mb-1">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-[11px] text-gray-500 font-light truncate">{addr.street}</p>
                                                    <p className="text-[11px] text-gray-500 font-light">{addr.city}, {addr.state}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="email">
                                            E-mail Address*
                                        </label>
                                        <input
                                            className={inputClasses('email')}
                                            id="email"
                                            placeholder="example@email.com"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                        {errors.email && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                                        {session && (
                                            <p className="text-[9px] text-gray-400 mt-2 uppercase tracking-widest font-medium">
                                                Default: {session.user?.email} (You can change this for order notifications)
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="phone">
                                            Phone*
                                        </label>
                                        <input
                                            className={inputClasses('phone')}
                                            id="phone"
                                            placeholder="+1 (555) 000-0000"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                        {errors.phone && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="firstName">
                                                    First Name*
                                                </label>
                                                <input
                                                    className={inputClasses('firstName')}
                                                    id="firstName"
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.firstName && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="lastName">
                                                    Last Name*
                                                </label>
                                                <input
                                                    className={inputClasses('lastName')}
                                                    id="lastName"
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.lastName && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="address">
                                            Address*
                                        </label>
                                        <input
                                            className={inputClasses('address')}
                                            id="address"
                                            placeholder="Street Address, Apt, Suite, etc."
                                            type="text"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                        {errors.address && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="city">
                                            City*
                                        </label>
                                        <input
                                            className={inputClasses('city')}
                                            id="city"
                                            placeholder="City"
                                            type="text"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                        {errors.city && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="zip">
                                            Postal Code*
                                        </label>
                                        <input
                                            className={inputClasses('zip')}
                                            id="zip"
                                            placeholder="ZIP / Postal Code"
                                            type="text"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                        />
                                        {errors.zip && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.zip}</p>}
                                    </div>
                                </form>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">2. Shipping Options</h2>
                                </div>
                                <div className="space-y-4">
                                    <label className={`relative flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                checked={shippingMethod === 'standard'}
                                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                                name="shipping"
                                                onChange={() => setShippingMethod('standard')}
                                                type="radio"
                                            />
                                            <div>
                                                <p className="font-medium text-sm text-text-main-light">Standard Delivery</p>
                                                <p className="text-xs text-text-muted-light">5-7 business days</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-text-main-light">{cartTotal > 5000 ? 'Free' : 'R 250'}</span>
                                    </label>
                                    <label className={`relative flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                checked={shippingMethod === 'express'}
                                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                                name="shipping"
                                                onChange={() => setShippingMethod('express')}
                                                type="radio"
                                            />
                                            <div>
                                                <p className="font-medium text-sm text-text-main-light">Express Delivery</p>
                                                <p className="text-xs text-text-muted-light">2-3 business days</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-text-main-light">R 450</span>
                                    </label>
                                    <label className={`relative flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === 'overnight' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                checked={shippingMethod === 'overnight'}
                                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                                name="shipping"
                                                onChange={() => setShippingMethod('overnight')}
                                                type="radio"
                                            />
                                            <div>
                                                <p className="font-medium text-sm text-text-main-light">Overnight Delivery</p>
                                                <p className="text-xs text-text-muted-light">Next business day</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-text-main-light">R 650</span>
                                    </label>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">3. Payment Method</h2>
                                    <div className="flex items-center gap-2 text-text-muted-light">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs">Secure Payment</span>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <label className={`relative flex items-center p-4 border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input
                                            checked={paymentMethod === 'card'}
                                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary mr-3"
                                            name="payment"
                                            onChange={() => setPaymentMethod('card')}
                                            type="radio"
                                        />
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span className="font-medium text-sm text-text-main-light">Credit / Debit Card</span>
                                        </div>
                                    </label>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="space-y-6 bg-gray-50 p-6 border border-gray-200">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="cardNumber">
                                                Card Number*
                                            </label>
                                            <input
                                                className={inputClasses('cardNumber')}
                                                id="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                type="text"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                            />
                                            {errors.cardNumber && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cardNumber}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="expiry">
                                                    Expiry Date*
                                                </label>
                                                <input
                                                    className={inputClasses('expiry')}
                                                    id="expiry"
                                                    placeholder="MM/YY"
                                                    type="text"
                                                    value={formData.expiry}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.expiry && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.expiry}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="cvv">
                                                    CVV*
                                                </label>
                                                <input
                                                    className={inputClasses('cvv')}
                                                    id="cvv"
                                                    placeholder="123"
                                                    type="text"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                />
                                                {errors.cvv && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cvv}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="cardName">
                                                Cardholder Name*
                                            </label>
                                            <input
                                                className={inputClasses('cardName')}
                                                id="cardName"
                                                placeholder="Name on Card"
                                                type="text"
                                                value={formData.cardName}
                                                onChange={handleInputChange}
                                            />
                                            {errors.cardName && <p className="text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cardName}</p>}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-surface-light border border-gray-200 p-6 sticky top-24">
                                <h2 className="text-xl font-serif text-text-main-light mb-6">Order Summary</h2>
                                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100">
                                                <Image alt={item.name} className="object-cover" src={item.image} fill />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-sm font-medium text-text-main-light mb-1">{item.name}</h3>
                                                <p className="text-xs text-text-muted-light">{item.color}</p>
                                                <p className="text-xs text-text-muted-light">Size: {item.size}</p>
                                                <p className="text-xs text-text-muted-light">Qty: {item.quantity}</p>
                                                <p className="text-sm font-medium text-text-main-light mt-2">R {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted-light">Subtotal</span>
                                        <span className="text-text-main-light font-medium">R {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted-light">Shipping</span>
                                        <span className="text-text-main-light font-medium">
                                            {shipping === 0 ? 'Free' : `R ${shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-serif text-text-main-light">Total</span>
                                            <span className="text-2xl font-serif text-text-main-light">R {total.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-text-muted-light mt-1">VAT Included</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-4 px-6 uppercase text-xs tracking-widest hover:bg-[#7A6448] transition-all duration-300 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                                <p className="text-xs text-center text-text-muted-light">
                                    By placing your order, you agree to our{' '}
                                    <a className="underline hover:text-primary" href="/privacy">
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

