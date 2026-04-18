'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { Lock, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AddressAutocomplete from '../components/AddressAutocomplete';
import HappyPayWidget from '../components/HappyPayWidget';
import PeachCheckout from '../components/PeachCheckout';

export default function PaymentPage() {
    const { data: session, status: sessionStatus } = useSession();
    const { cartItems, cartTotal, cartCount, couponCode, discountAmount, applyCoupon, removeCoupon } = useCart();
    const router = useRouter();
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'peach'>('payfast');
    const [peachData, setPeachData] = useState<{ checkoutId: string; orderNumber: string } | null>(null);

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    // Contact form
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        addressLine2: '',
        city: '',
        zip: '',
        state: '',
    });

    // Password (required for guests to create an account on checkout)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [saveAddress, setSaveAddress] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

    // Redirect to cart if empty
    useEffect(() => {
        if (cartCount === 0) {
            router.push('/cart');
        }
    }, [cartCount, router]);

    // Pre-fill email + load saved addresses for logged-in users
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
                const defaultAddr = data.find((a: any) => a.isDefault);
                if (defaultAddr) handleAddressSelect(defaultAddr);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddressSelect = (addr: any) => {
        setSelectedAddressId(addr.id);
        setSaveAddress(false);
        setFormData(prev => ({
            ...prev,
            firstName: addr.firstName,
            lastName: addr.lastName,
            phone: addr.phone,
            address: addr.street,
            addressLine2: addr.addressLine2 || '',
            city: addr.city,
            state: addr.state,
            zip: addr.zipCode,
        }));
    };

    // Called by AddressAutocomplete when Google Places resolves a full address
    const handlePlaceSelect = (components: { street: string; city: string; state: string; zip: string; country: string }) => {
        setSelectedAddressId('');
        setFormData(prev => ({
            ...prev,
            address: components.street,
            city: components.city,
            state: components.state,
            zip: components.zip,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
        }
        if (['address', 'city', 'zip', 'state'].includes(id)) {
            setSelectedAddressId('');
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        else if (!nameRegex.test(formData.firstName)) newErrors.firstName = 'Name can only contain letters';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        else if (!nameRegex.test(formData.lastName)) newErrors.lastName = 'Name can only contain letters';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.zip) newErrors.zip = 'Postal code is required';
        else if (formData.zip.length < 4) newErrors.zip = 'Invalid postal code';

        // Password required for guests
        if (!session) {
            if (!password) newErrors.password = 'Password is required to create your account';
            else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
            else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponError('');
        setIsApplying(true);

        try {
            const res = await fetch('/api/cart/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput.trim(), cartTotal }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setCouponError(data.error || 'Invalid coupon code');
            } else {
                applyCoupon(data.coupon.code, data.discountAmount);
                setCouponInput('');
            }
        } catch (error) {
            setCouponError('An unexpected error occurred');
        } finally {
            setIsApplying(false);
        }
    };

    const subtotal = cartTotal;
    // Calculate standard shipping taking subtotal AFTER discount into account? Or before? Usually before discount.
    const standardShippingFee = 0;
    const shipping =
        shippingMethod === 'express' ? 450
            : shippingMethod === 'overnight' ? 650
                : standardShippingFee;
    const total = Math.max(0, subtotal - discountAmount) + shipping;

    // ── Shared contact payload builder ──────────────────────────────────────
    const buildContactPayload = () => ({
        contact: {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            addressLine2: formData.addressLine2 || '',
            city: formData.city,
            zip: formData.zip,
            state: formData.state,
        },
        cartItems,
        shippingMethod,
        createAccount: !session,
        password: !session ? password : undefined,
        saveAddress: session ? saveAddress : false,
        couponCode,
        discountAmount,
    });

    const handleCheckout = async () => {
        if (!validateForm()) {
            const firstError = document.querySelector('.error-msg');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        if (paymentMethod === 'peach') {
            // ── Peach Payments embedded checkout ────────────────────────────
            try {
                const res = await fetch('/api/orders/peach/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildContactPayload()),
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || 'Failed to initiate Peach checkout');
                    setLoading(false);
                    return;
                }
                // Show the embedded checkout widget — form stays visible above
                setPeachData({ checkoutId: data.checkoutId, orderNumber: data.orderNumber });
                setLoading(false);
                // Scroll to the checkout area
                setTimeout(() => {
                    document.getElementById('peach-embed-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200);
            } catch (err) {
                console.error('Peach checkout error:', err);
                alert('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
            return;
        }

        // ── PayFast redirect checkout ────────────────────────────────────────
        try {
            const res = await fetch('/api/orders/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildContactPayload()),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to initiate order');
                setLoading(false);
                return;
            }

            // Auto-submit form to Payfast
            const { payfastData, payfastUrl } = data;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payfastUrl;
            for (const [key, value] of Object.entries(payfastData)) {
                if (value !== '' && value !== undefined && value !== null) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                }
            }
            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error('Checkout error:', error);
            alert('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const inputClasses = (id: string) =>
        `w-full bg-transparent border ${errors[id] ? 'border-rose-500 focus:border-rose-500' : 'border-gray-300 focus:border-primary'} px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none transition-colors`;

    // Show loading skeleton while session is being determined
    if (sessionStatus === 'loading') {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-background-light flex items-center justify-center">
                    <div className="animate-pulse text-[10px] uppercase tracking-widest text-gray-400">Loading checkout...</div>
                </div>
                <Footer />
            </>
        );
    }

    const isGuest = !session;

    return (
        <>
            <Header />
            <main className="bg-background-light py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-serif text-text-main-light mb-2">Checkout</h1>
                        <div className="flex items-center gap-2 text-sm text-text-muted-light">
                            <Lock className="w-4 h-4" />
                            <span>Secure Checkout — Powered by Payfast</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* ── Left: Form ─────────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* 1. Contact Information */}
                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">1. Contact Information</h2>
                                    {isGuest && (
                                        <a
                                            href={`/login?redirect=/payment`}
                                            className="text-[10px] uppercase tracking-widest font-bold text-primary underline underline-offset-4 hover:text-text-main-light transition-colors"
                                        >
                                            Already have an account? Sign in
                                        </a>
                                    )}
                                </div>

                                {/* Saved address selector (logged-in users) */}
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
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="email">E-mail Address*</label>
                                        <input className={inputClasses('email')} id="email" placeholder="example@email.com" type="email" value={formData.email} onChange={handleInputChange} />
                                        {errors.email && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="phone">Phone*</label>
                                        <input className={inputClasses('phone')} id="phone" placeholder="0823456789" type="tel" value={formData.phone} onChange={handleInputChange} />
                                        {errors.phone && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="firstName">First Name*</label>
                                                <input className={inputClasses('firstName')} id="firstName" type="text" value={formData.firstName} onChange={handleInputChange} />
                                                {errors.firstName && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="lastName">Last Name*</label>
                                                <input className={inputClasses('lastName')} id="lastName" type="text" value={formData.lastName} onChange={handleInputChange} />
                                                {errors.lastName && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2">Address*</label>
                                        <AddressAutocomplete
                                            value={formData.address}
                                            onChange={(val) => {
                                                setFormData(prev => ({ ...prev, address: val }));
                                                setSelectedAddressId('');
                                                if (errors.address) setErrors(e => { const n = { ...e }; delete n.address; return n; });
                                            }}
                                            onAddressSelect={handlePlaceSelect}
                                            className={inputClasses('address') + ' pr-10'}
                                            error={!!errors.address}
                                        />
                                        {errors.address && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="addressLine2">
                                            Address Line 2 <span className="normal-case font-normal text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            className={inputClasses('addressLine2')}
                                            id="addressLine2"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                            type="text"
                                            value={formData.addressLine2}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="city">City*</label>
                                        <input className={inputClasses('city')} id="city" placeholder="City" type="text" value={formData.city} onChange={handleInputChange} />
                                        {errors.city && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="state">Province</label>
                                        <input className={inputClasses('state')} id="state" placeholder="e.g. Gauteng" type="text" value={formData.state} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2" htmlFor="zip">Postal Code*</label>
                                        <input className={inputClasses('zip')} id="zip" placeholder="e.g. 2000" type="text" value={formData.zip} onChange={handleInputChange} />
                                        {errors.zip && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.zip}</p>}
                                    </div>

                                    {/* Save address checkbox — only for logged-in users entering a new address */}
                                    {!isGuest && !selectedAddressId && (
                                        <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="saveAddress"
                                                checked={saveAddress}
                                                onChange={(e) => setSaveAddress(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <label htmlFor="saveAddress" className="text-xs text-gray-500 font-light cursor-pointer select-none">
                                                Save this address to my account for future orders
                                            </label>
                                        </div>
                                    )}
                                </form>
                            </section>

                            {/* ── Guest: Set Password (required — creates account) ── */}
                            {isGuest && (
                                <section>
                                    <div className="border border-gray-200 bg-white p-6 space-y-5">
                                        <div>
                                            <h3 className="text-sm font-bold text-text-main-light mb-0.5">Create your account</h3>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                Set a password to track your order &amp; save your details for next time
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2">Password*</label>
                                            <div className="relative">
                                                <input
                                                    className={`w-full bg-transparent border ${errors.password ? 'border-rose-500' : 'border-gray-300 focus:border-primary'} px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none transition-colors pr-12`}
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Minimum 6 characters"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        if (errors.password) setErrors(p => { const n = { ...p }; delete n.password; return n; });
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-text-muted-light mb-2">Confirm Password*</label>
                                            <input
                                                className={`w-full bg-transparent border ${errors.confirmPassword ? 'border-rose-500' : 'border-gray-300 focus:border-primary'} px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none transition-colors`}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Repeat your password"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    if (errors.confirmPassword) setErrors(p => { const n = { ...p }; delete n.confirmPassword; return n; });
                                                }}
                                            />
                                            {errors.confirmPassword && <p className="error-msg text-rose-500 text-[10px] mt-1 uppercase font-bold tracking-tighter flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                            Your account will be created using the email address above. After checkout you can sign in to view your order history and manage your addresses.
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* 2. Shipping */}
                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">2. Shipping Options</h2>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { id: 'standard', label: 'Standard Delivery', sub: '5-7 business days', price: 'Free' },
                                        { id: 'express', label: 'Express Delivery', sub: '2-3 business days', price: 'R 450' },
                                        { id: 'overnight', label: 'Overnight Delivery', sub: 'Next business day', price: 'R 650' },
                                    ].map(opt => (
                                        <label key={opt.id} className={`relative flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === opt.id ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                            <div className="flex items-center gap-3">
                                                <input checked={shippingMethod === opt.id} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" name="shipping" onChange={() => setShippingMethod(opt.id)} type="radio" />
                                                <div>
                                                    <p className="font-medium text-sm text-text-main-light">{opt.label}</p>
                                                    <p className="text-xs text-text-muted-light">{opt.sub}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-text-main-light">{opt.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* 3. Payment */}
                            <section>
                                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-serif text-text-main-light">3. Payment</h2>
                                    <div className="flex items-center gap-2 text-text-muted-light">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs">256-bit SSL Encrypted</span>
                                    </div>
                                </div>

                                {/* ── Payment Method Selector ─────────────────── */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                    {/* PayFast */}
                                    <button
                                        type="button"
                                        onClick={() => { setPaymentMethod('payfast'); setPeachData(null); }}
                                        className={`flex items-center gap-3 p-5 border-2 text-left transition-all ${paymentMethod === 'payfast' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'payfast' ? 'border-primary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'payfast' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-text-main-light">PayFast</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Card · EFT · Instant EFT · Mobicred · Payflex</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Image src="https://cdn.brandfetch.io/idhem73aId/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1679062242416" alt="Visa" width={36} height={22} unoptimized />
                                            <Image src="https://cdn.brandfetch.io/idFw8DodCr/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1721117489739" alt="MC" width={28} height={22} unoptimized />
                                        </div>
                                    </button>

                                    {/* Peach Payments */}
                                    <button
                                        type="button"
                                        onClick={() => { setPaymentMethod('peach'); setPeachData(null); }}
                                        className={`flex items-center gap-3 p-5 border-2 text-left transition-all ${paymentMethod === 'peach' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'peach' ? 'border-primary' : 'border-gray-300'}`}>
                                            {paymentMethod === 'peach' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-text-main-light">Peach Payments</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Card · Apple Pay · Samsung Pay · SnapScan</p>
                                        </div>
                                        <div className="w-8 h-8 flex-shrink-0 rounded flex items-center justify-center bg-[#E8562A]">
                                            <span className="text-white font-bold text-[10px]">PP</span>
                                        </div>
                                    </button>
                                </div>

                                {paymentMethod === 'payfast' && (
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 leading-relaxed">
                                        You will be securely redirected to PayFast to complete your payment.
                                    </p>
                                )}
                                {paymentMethod === 'peach' && !peachData && (
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 leading-relaxed">
                                        Your card payment is processed inline — no redirect required.
                                    </p>
                                )}

                                {/* Peach embedded checkout — shown after order is initiated */}
                                {peachData && (
                                    <div id="peach-embed-section" className="mb-4 border border-gray-200 p-6 animate-in fade-in duration-500">
                                        <PeachCheckout
                                            checkoutId={peachData.checkoutId}
                                            orderNumber={peachData.orderNumber}
                                            total={total}
                                            onCancel={() => setPeachData(null)}
                                        />
                                    </div>
                                )}

                                {/* HappyPay BNPL widget */}
                                <div className="mt-2">
                                    <HappyPayWidget amount={total} layout="peach" />
                                </div>
                            </section>

                        </div>

                        {/* ── Right: Order Summary ────────────────────────── */}
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
                                                <p className="text-sm font-medium text-text-main-light mt-2">R {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted-light">Subtotal</span>
                                        <span className="text-text-main-light font-medium">R {subtotal.toLocaleString()}</span>
                                    </div>
                                    {couponCode ? (
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-emerald-600 font-medium flex items-center gap-2">
                                                Discount ({couponCode})
                                                <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-700 ml-1" title="Remove coupon">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                            <span className="text-emerald-600 font-medium">-R {discountAmount.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="pt-2 flex items-start gap-2">
                                            <div className="flex-grow">
                                                <input 
                                                    type="text" 
                                                    placeholder="Voucher/Promo Code" 
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                    className="w-full border border-gray-300 px-3 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-text-main-light"
                                                    disabled={loading || !!peachData}
                                                />
                                                {couponError && <p className="text-rose-500 text-[10px] mt-1 uppercase tracking-widest italic">{couponError}</p>}
                                            </div>
                                            <button 
                                                onClick={handleApplyCoupon}
                                                disabled={isApplying || !couponInput.trim() || loading || !!peachData}
                                                className="bg-gray-100 text-text-main-light px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                            >
                                                {isApplying ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm pt-2">
                                        <span className="text-text-muted-light">Shipping</span>
                                        <span className="text-text-main-light font-medium">{shipping === 0 ? 'Free' : `R ${shipping.toLocaleString()}`}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-serif text-text-main-light">Total</span>
                                            <span className="text-2xl font-serif text-text-main-light">R {total.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-text-muted-light mt-1">VAT Included · ZAR</p>
                                        {/* HappyPay BNPL split in sidebar */}
                                        <div className="mt-3">
                                            <HappyPayWidget amount={total} layout="peach" />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || (paymentMethod === 'peach' && !!peachData)}
                                    className="w-full bg-primary text-white py-4 px-6 uppercase text-xs tracking-widest hover:bg-[#7A6448] transition-all duration-300 mb-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {paymentMethod === 'peach' ? 'Loading Peach Checkout...' : 'Redirecting to PayFast...'}
                                        </>
                                    ) : peachData ? (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Complete payment above ↑
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            {paymentMethod === 'peach' ? 'Pay with Peach Payments' : 'Pay with PayFast'}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-text-muted-light">
                                    By placing your order, you agree to our{' '}
                                    <a className="underline hover:text-primary" href="/privacy">Privacy Policy</a>
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
