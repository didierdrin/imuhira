"use client";

import { DetailedHTMLProps, useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { firestore as db } from "../../../../firebaseApp";
import Link from "next/link";
import Image from "next/image";
import { 
  Home, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  images: string[];
  features: string[];
  type: "rent" | "buy";
  likes: number;
  isFeatured: boolean;
  isActive: boolean;
  latitude: number;
  longitude: number;
}

interface DetailesPageProps {
  params: Promise<{id: string}>;
}

export default function DetailsPage({ params }: DetailesPageProps) {
  const [house, setHouse] = useState<House | null>(null);
  const [suggestedHouses, setSuggestedHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [houseId, setHouseId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setHouseId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (houseId) {
      fetchHouse();
    }
  }, [houseId]);

  const fetchHouse = async () => {
    if (!houseId) return;
    
    try {
      setLoading(true);
      const houseDoc = await getDoc(doc(db, "houses", houseId));
      if (houseDoc.exists()) {
        setHouse({ id: houseDoc.id, ...houseDoc.data() } as House);
      }
    } catch (error) {
      console.error("Error fetching house:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (house) {
      fetchSuggestedHouses();
    }
  }, [house]);

  const fetchSuggestedHouses = async () => {
    try {
      const housesRef = collection(db, "houses");
      const q = query(
        housesRef,
        where("type", "==", house?.type),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(5) // Fetch 5 to account for filtering out current
      );
      const querySnapshot = await getDocs(q);
      const housesData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as House))
        .filter((h) => h.id !== house?.id)
        .slice(0, 4);
      setSuggestedHouses(housesData);
    } catch (error) {
      console.error("Error fetching suggested houses:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-20">
        <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Property not found</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-teal-600" />
              <span className="text-2xl font-bold text-slate-800">iMuhira</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/buy" className="text-teal-600 font-semibold flex items-center space-x-1">
                <Home className="w-4 h-4" />
                <span>Buy</span>
              </Link>
              <Link href="/rent" className="text-slate-600 hover:text-slate-800 transition">
                Rent
              </Link>
              <Link href="/sell" className="text-slate-600 hover:text-slate-800 transition">
                Sell
              </Link>
            </div>

            <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Map */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden" style={{ height: "400px" }}>
            <MapContainer
              center={[house.latitude, house.longitude] as LatLngExpression}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[house.latitude, house.longitude]} />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Image Carousel */}
          <HouseImageCarousel house={house} />

          {/* Right: Details */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{house.title}</h1>
            <p className="text-2xl font-bold text-teal-600 mb-4">{formatPrice(house.price)}</p>
            <div className="flex items-center text-slate-600 mb-4">
              <MapPin className="w-4 h-4 mr-1 text-teal-600" />
              <span>{house.location}</span>
            </div>
            <div className="flex space-x-6 mb-6">
              <div className="flex items-center space-x-1 text-slate-700">
                <Bed className="w-5 h-5 text-teal-600" />
                <span>{house.bedrooms} Beds</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-700">
                <Bath className="w-5 h-5 text-teal-600" />
                <span>{house.bathrooms} Baths</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-700">
                <Maximize className="w-5 h-5 text-teal-600" />
                <span>{house.size} m²</span>
              </div>
            </div>
            <p className="text-slate-600 mb-6">{house.description}</p>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Features</h3>
            <ul className="list-disc pl-5 text-slate-600 mb-6">
              {house.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {/* Obscured Contacts with Visibility Icon */}
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Contact Information</h3>
            <div className="mb-4">
              <p className="blur-sm text-slate-600">Phone: +250-XXX-XXX-XXX</p>
              <p className="blur-sm text-slate-600">Email: example@domain.com</p>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <Eye className="w-5 h-5" />
              <span>Reveal Contacts</span>
            </button>
          </div>
        </div>

        {/* Suggested Listings */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Suggested Listings</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {suggestedHouses.map((suggestedHouse) => (
              <div key={suggestedHouse.id} className="flex-shrink-0 w-80">
                <HouseCard house={suggestedHouse} formatPrice={formatPrice} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Payment Required</h3>
            <p className="text-slate-600 mb-6">Pay to view the building details and contacts.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                Pay {formatPrice(1000)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HouseImageCarousel({ house }: { house: House }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % house.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length);
  };

  return (
    <div className="relative h-96 bg-slate-200 overflow-hidden rounded-2xl">
      {house.images && house.images.length > 0 ? (
        <>
          <Image
            src={house.images[currentImageIndex]}
            alt={house.title}
            fill
            className="object-cover transition-transform duration-500"
          />
          
          {house.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
              >
                <ChevronLeft className="w-5 h-5 text-slate-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
              >
                <ChevronRight className="w-5 h-5 text-slate-800" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                {house.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Home className="w-16 h-16 text-slate-300" />
        </div>
      )}
    </div>
  );
}

function HouseCard({ house, formatPrice }: { house: House; formatPrice: (price: number) => string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % house.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length);
  };

  return (
    <Link href={`/house/${house.id}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative h-48 bg-slate-200 overflow-hidden">
          {house.images && house.images.length > 0 ? (
            <>
              <Image
                src={house.images[currentImageIndex]}
                alt={house.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {house.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-800" />
                  </button>
                </>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-lg hover:bg-white transition"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
              </button>

              {house.isFeatured && (
                <div className="absolute top-2 left-2 bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  Featured
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition">
            {house.title}
          </h3>

          <div className="flex items-center text-slate-600 mb-2">
            <MapPin className="w-3 h-3 mr-1 text-teal-600" />
            <span className="text-xs">{house.location}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-200">
            <div className="flex items-center space-x-1 text-slate-700 text-xs">
              <Bed className="w-4 h-4 text-teal-600" />
              <span>{house.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700 text-xs">
              <Bath className="w-4 h-4 text-teal-600" />
              <span>{house.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700 text-xs">
              <Maximize className="w-4 h-4 text-teal-600" />
              <span>{house.size} m²</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-teal-600">
              {formatPrice(house.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
