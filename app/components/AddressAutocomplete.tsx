'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressComponents {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    onAddressSelect: (components: AddressComponents) => void;
    className?: string;
    error?: boolean;
}

declare global {
    interface Window {
        google: any;
        googleMapsLoaded: boolean;
        googleMapsCallbacks: (() => void)[];
    }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
    return new Promise((resolve) => {
        if (window.google?.maps?.places) {
            resolve();
            return;
        }

        if (!window.googleMapsCallbacks) {
            window.googleMapsCallbacks = [];
        }
        window.googleMapsCallbacks.push(resolve);

        if (!window.googleMapsLoaded) {
            window.googleMapsLoaded = true;
            // @ts-ignore
            window.__googleMapsCallback = () => {
                window.googleMapsCallbacks.forEach(cb => cb());
                window.googleMapsCallbacks = [];
            };

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsCallback`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });
}

export default function AddressAutocomplete({ value, onChange, onAddressSelect, className, error }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const hasKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

    useEffect(() => {
        if (!hasKey || !inputRef.current) return;

        setLoading(true);
        loadGoogleMaps(apiKey!).then(() => {
            setLoading(false);
            if (!inputRef.current) return;

            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: ['za', 'gb', 'us'] },
                fields: ['address_components', 'formatted_address'],
                types: ['address'],
            });

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current.getPlace();
                if (!place?.address_components) return;

                // Parse address components
                const get = (types: string[]) =>
                    place.address_components.find((c: any) => types.some((t: string) => c.types.includes(t)))?.long_name || '';
                const getShort = (types: string[]) =>
                    place.address_components.find((c: any) => types.some((t: string) => c.types.includes(t)))?.short_name || '';

                const streetNumber = get(['street_number']);
                const route = get(['route']);
                const street = [streetNumber, route].filter(Boolean).join(' ');
                const city = get(['locality', 'sublocality', 'neighborhood']) ||
                             get(['administrative_area_level_2']);
                const state = get(['administrative_area_level_1']);
                const zip = get(['postal_code']);
                const country = get(['country']);

                onChange(place.formatted_address || street);
                onAddressSelect({ street: street || place.formatted_address, city, state, zip, country });
            });
        }).catch(() => setLoading(false));

        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [hasKey, apiKey]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Start typing your street address..."
                autoComplete="off"
                className={className}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading ? (
                    <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                ) : (
                    <MapPin className="w-4 h-4 text-gray-300" />
                )}
            </div>
        </div>
    );
}
