'use client';
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { ChevronLeft, ChevronRight, Heart, Search, UserCircle, Home } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link"; 

interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "rent" | "buy";
  location: string;
  images: string[];
  likes: number;
  features: string[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  isActive: boolean;
  isFeatured: boolean;
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const [buyHouses, setBuyHouses] = useState<House[]>([]);
  const [rentHouses, setRentHouses] = useState<House[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBuyPropertyIndex, setCurrentBuyPropertyIndex] = useState(0);
  const [currentRentPropertyIndex, setCurrentRentPropertyIndex] = useState(0);
  const [activeLeftHouse, setActiveLeftHouse] = useState<House | null>(null);
  const [activeRightHouse, setActiveRightHouse] = useState<House | null>(null);
  const [listingType, setListingType] = useState<"rent" | "buy">("buy");
  const router = useRouter();

  const cycleToNextLeftProperty = useCallback(() => {
    if (listingType === "buy") {
      setCurrentBuyPropertyIndex((prev) => (prev + 1) % buyHouses.length);
    } else {
      setCurrentRentPropertyIndex((prev) => (prev + 1) % rentHouses.length);
    }
  }, [listingType, buyHouses, rentHouses]);

  const cycleToNextRightProperty = useCallback(() => {
    if (listingType === "buy") {
      setCurrentRentPropertyIndex((prev) => (prev + 1) % rentHouses.length);
    } else {
      setCurrentBuyPropertyIndex((prev) => (prev + 1) % buyHouses.length);
    }
  }, [listingType, buyHouses, rentHouses]);

  const cycleToNextImage = useCallback(() => {
    if (activeLeftHouse) {
      setCurrentImageIndex((prev) => (prev + 1) % activeLeftHouse.images.length);
    }
  }, [activeLeftHouse]);

  // Fetch buy houses
  useEffect(() => {
    const q = query(
      collection(db, "houses"),
      where("isActive", "==", true),
      where("type", "==", "buy")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const houseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as House));
      
      setBuyHouses(houseData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch rent houses
  useEffect(() => {
    const q = query(
      collection(db, "houses"),
      where("isActive", "==", true),
      where("type", "==", "rent")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const houseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as House));
      
      setRentHouses(houseData);
    });

    return () => unsubscribe();
  }, []);

  // Update active houses when property indices change
  useEffect(() => {
    if (listingType === "buy") {
      if (buyHouses.length > 0) {
        setActiveLeftHouse(buyHouses[currentBuyPropertyIndex]);
      }
      if (rentHouses.length > 0) {
        setActiveRightHouse(rentHouses[currentRentPropertyIndex]);
      }
    } else {
      if (rentHouses.length > 0) {
        setActiveLeftHouse(rentHouses[currentRentPropertyIndex]);
      }
      if (buyHouses.length > 0) {
        setActiveRightHouse(buyHouses[currentBuyPropertyIndex]);
      }
    }
    setCurrentImageIndex(0);
  }, [currentBuyPropertyIndex, currentRentPropertyIndex, buyHouses, rentHouses, listingType]);

  // Auto-cycle left column properties every 4 seconds
  useEffect(() => {
    const propertyTimer = setInterval(cycleToNextLeftProperty, 4000);
    return () => clearInterval(propertyTimer);
  }, [cycleToNextLeftProperty]);

  // Auto-cycle right column properties every 7 seconds
  useEffect(() => {
    const propertyTimer = setInterval(cycleToNextRightProperty, 7000);
    return () => clearInterval(propertyTimer);
  }, [cycleToNextRightProperty]);

  // Auto-cycle images every 3 seconds
  useEffect(() => {
    const imageTimer = setInterval(cycleToNextImage, 3000);
    return () => clearInterval(imageTimer);
  }, [cycleToNextImage]);

  const nextImage = () => {
    if (activeLeftHouse) {
      setCurrentImageIndex((prev) => (prev + 1) % activeLeftHouse.images.length);
    }
  };

  const prevImage = () => {
    if (activeLeftHouse) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? activeLeftHouse.images.length - 1 : prev - 1
      );
    }
  };

  const getLeftColumnHouses = () => {
    return listingType === "buy" ? buyHouses : rentHouses;
  };

  const getRightColumnHouses = () => {
    return listingType === "buy" ? rentHouses : buyHouses;
  };

  if (!activeLeftHouse || !activeRightHouse) return <div className="flex min-h-screen w-full items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column Content - Shows current listing type */}
      <div className="w-1/2 overflow-y-auto">
        {/* Topbar */}
        <div className="p-6 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-green-600" />
            <span className="flex">
              <b className="text-2xl font-bold text-green-500">i</b>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-900 bg-clip-text text-transparent">
                Muhira
              </h1>
            </span>
          </Link>
          
          <div className="space-x-8">
            <button 
              className={`${listingType === "rent" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
              onClick={() => router.push("/all")}
            >
              All
            </button>
            <button 
              className={`${listingType === "rent" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
              onClick={() => setListingType("rent")}
            >
              Rent
            </button>
            <button 
              className={`${listingType === "buy" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
              onClick={() => setListingType("buy")}
            >
              Buy
            </button>
          </div>
        </div>

        {/* House Details */}
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-4">{activeLeftHouse.title}</h2>
          
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <p className="text-gray-600">{activeLeftHouse.description}</p>
              <p className="text-gray-600">{activeLeftHouse.location}</p>
            </div>
            <button 
              onClick={() => router.push(`/house/${activeLeftHouse.id}`)}
              className="px-6 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors"
            >
              {activeLeftHouse.type === "buy" ? "Buy Now" : "Rent Now"}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Heart className="text-teal-600" />
              <span>{activeLeftHouse.likes} likes</span>
            </div>
            <div className="text-xl font-bold">
              RWF {activeLeftHouse.price.toLocaleString()}
            </div>
          </div>

          {/* Other House Preview */}
          <div className="relative rounded-sm overflow-hidden h-[400px] bg-gray-100">
            <div className="absolute inset-0">
              <Image 
                src={activeLeftHouse.images[currentImageIndex]} 
                alt={activeLeftHouse.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-between p-4 z-10">
              <button 
                onClick={prevImage}
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <ChevronLeft />
              </button>
              <button 
                onClick={nextImage}
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <ChevronRight />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 text-white">
              {activeLeftHouse.location}
            </div>
          </div>
        </div>

        {/* Sell Section */}
        <div id="sell-section" className="p-6 bg-gray-50 mt-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Property?</h2>
          <p className="text-gray-600 mb-4">List your property and reach thousands of potential buyers</p>
          <button className="px-6 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>

      {/* Right Column - Slideshow - Shows opposite listing type */}
      <div className="w-1/2 relative">
        {/* Search and Login */}
        <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 rounded-sm bg-white/90 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center gap-4 text-white ml-4">
            <button className="hover:text-gray-200">Login</button>
            <button className="hover:text-gray-200">Sign Up</button>
          </div>
        </div>

        {/* Filters */}
        <div className="absolute top-20 left-0 right-0 p-6 z-10 flex gap-4">
          <select className="px-4 py-2 rounded-sm bg-white/90 backdrop-blur-sm">
            <option>Price Range</option>
          </select>
          <select className="px-4 py-2 rounded-sm bg-white/90 backdrop-blur-sm">
            <option>Property Type</option>
          </select>
          <select className="px-4 py-2 rounded-sm bg-white/90 backdrop-blur-sm">
            <option>Location</option>
          </select>
        </div>

        {/* Image Slideshow */}
        <div className="absolute inset-0 bg-gray-200 overflow-hidden">
          {activeRightHouse && (
            <Image 
              key={activeRightHouse.id}
              src={activeRightHouse.images[0]} 
              alt={activeRightHouse.title}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500 ease-in-out"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent text-white">
            <h3 className="text-xl font-bold mb-2">{activeRightHouse.title}</h3>
            <p>{activeRightHouse.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold">
                RWF {activeRightHouse.price.toLocaleString()}
              </span>
              <span className="px-3 py-1 bg-teal-600 rounded-sm text-sm">
                {activeRightHouse.type === "buy" ? "For Sale" : "For Rent"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
