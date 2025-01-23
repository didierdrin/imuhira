'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { ChevronLeft, ChevronRight, Heart, Search, UserCircle, ChevronUp } from "lucide-react";

interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "rent" | "sale";
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

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [activeHouse, setActiveHouse] = useState<House | null>(null);
  const [listingType, setListingType] = useState<"rent" | "sale">("sale");

  useEffect(() => {
    const q = query(
      collection(db, "houses"),
      where("isActive", "==", true),
      where("type", "==", listingType)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const houseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as House));
      
      setHouses(houseData);
      if (houseData.length > 0) {
        setCurrentPropertyIndex(0);
        setActiveHouse(houseData[0]);
        setCurrentImageIndex(0);
      }
    });

    return () => unsubscribe();
  }, [listingType]);

  useEffect(() => {
    if (houses.length > 0) {
      setActiveHouse(houses[currentPropertyIndex]);
      setCurrentImageIndex(0);
    }
  }, [currentPropertyIndex, houses]);

  const nextImage = () => {
    if (activeHouse) {
      setCurrentImageIndex((prev) => (prev + 1) % activeHouse.images.length);
    }
  };

  const prevImage = () => {
    if (activeHouse) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? activeHouse.images.length - 1 : prev - 1
      );
    }
  };

  const nextProperty = () => {
    setCurrentPropertyIndex((prev) => 
      (prev + 1) % houses.length
    );
  };

  if (!activeHouse) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column */}
      <div className="w-1/2 overflow-y-auto">
        {/* Topbar */}
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">iMuhira</h1>
          <div className="space-x-8">
            <button 
              className={`${listingType === "rent" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
              onClick={() => setListingType("rent")}
            >
              Rent
            </button>
            <button 
              className={`${listingType === "sale" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
              onClick={() => setListingType("sale")}
            >
              Buy
            </button>
            <button 
              className="text-gray-600 hover:text-teal-900" 
              onClick={() => {
                const sellSection = document.getElementById('sell-section');
                sellSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Sell
            </button>
          </div>
        </div>

        {/* House Details */}
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-4">{activeHouse.title}</h2>
          
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <p className="text-gray-600">{activeHouse.description}</p>
              <p className="text-gray-600">{activeHouse.location}</p>
            </div>
            <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              {activeHouse.type === "sale" ? "Buy Now" : "Rent Now"}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Heart className="text-teal-600" />
              <span>{activeHouse.likes} likes</span>
            </div>
            <div className="text-xl font-bold">
              ${activeHouse.price.toLocaleString()}
            </div>
          </div>

          {/* Other House Preview */}
          <div className="relative rounded-xl overflow-hidden h-[400px] bg-gray-100">
            <div className="absolute inset-0">
              <Image 
                src={activeHouse.images[currentImageIndex]} 
                alt={activeHouse.title}
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
              {activeHouse.location}
            </div>
          </div>
        </div>

        {/* Sell Section */}
        <div id="sell-section" className="p-6 bg-gray-50 mt-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Property?</h2>
          <p className="text-gray-600 mb-4">List your property and reach thousands of potential buyers</p>
          <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>

      {/* Right Column - Slideshow */}
      <div className="w-1/2 relative">
        {/* Search and Login */}
        <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center gap-4 text-white ml-4">
            <button className="hover:text-gray-200">Login</button>
            <button className="hover:text-gray-200">Sign Up</button>
            <UserCircle />
          </div>
        </div>

        {/* Filters */}
        <div className="absolute top-20 left-0 right-0 p-6 z-10 flex gap-4">
          <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
            <option>Price Range</option>
          </select>
          <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
            <option>Property Type</option>
          </select>
          <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
            <option>Location</option>
          </select>
        </div>

        {/* Image Slideshow */}
        <div className="absolute inset-0 bg-gray-200 overflow-hidden">
          <Image 
            src={activeHouse.images[currentImageIndex]} 
            alt={activeHouse.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 ease-in-out"
          />
          <button 
            onClick={nextProperty}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white/75 p-3 rounded-full transition-all"
          >
            <ChevronUp size={24} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent text-white">
            <h3 className="text-xl font-bold mb-2">{activeHouse.title}</h3>
            <p>{activeHouse.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { collection, onSnapshot, query, where } from "firebase/firestore";
// import { firestore as db } from "../../firebaseApp";
// import { ChevronLeft, ChevronRight, Heart, Search, UserCircle } from "lucide-react";

// interface House {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   type: "rent" | "sale";
//   location: string;
//   images: string[];
//   likes: number;
//   features: string[];
//   bedrooms: number;
//   bathrooms: number;
//   size: number;
//   isActive: boolean;
//   isFeatured: boolean;
//   latitude: number;
//   longitude: number;
// }

// export default function Home() {
//   const [houses, setHouses] = useState<House[]>([]);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [activeHouse, setActiveHouse] = useState<House | null>(null);
//   const [listingType, setListingType] = useState<"rent" | "sale">("sale");

//   useEffect(() => {
//     const q = query(
//       collection(db, "houses"),
//       where("isActive", "==", true),
//       where("type", "==", listingType)
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const houseData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       } as House));
      
//       setHouses(houseData);
//       if (houseData.length > 0 && !activeHouse) {
//         setActiveHouse(houseData[0]);
//       }
//     });

//     return () => unsubscribe();
//   }, [listingType]);

//   const nextImage = () => {
//     if (activeHouse) {
//       setCurrentImageIndex((prev) => (prev + 1) % activeHouse.images.length);
//     }
//   };

//   const prevImage = () => {
//     if (activeHouse) {
//       setCurrentImageIndex((prev) =>
//         prev === 0 ? activeHouse.images.length - 1 : prev - 1
//       );
//     }
//   };

//   if (!activeHouse) return <div>Loading...</div>;

//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Left Column */}
//       <div className="w-1/2 overflow-y-auto">
//         {/* Topbar */}
//         <div className="p-6 border-b flex items-center justify-between">
//           <h1 className="text-2xl font-bold">iMuhira</h1>
//           <div className="space-x-8">
//             <button 
//               className={`${listingType === "rent" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
//               onClick={() => setListingType("rent")}
//             >
//               Rent
//             </button>
//             <button 
//               className={`${listingType === "sale" ? "text-teal-600" : "text-gray-600"} hover:text-teal-900`}
//               onClick={() => setListingType("sale")}
//             >
//               Buy
//             </button>
//             <button 
//               className="text-gray-600 hover:text-teal-900" 
//               onClick={() => {
//                 const sellSection = document.getElementById('sell-section');
//                 sellSection?.scrollIntoView({ behavior: 'smooth' });
//               }}
//             >
//               Sell
//             </button>
//           </div>
//         </div>

//         {/* House Details */}
//         <div className="p-6">
//           <h2 className="text-3xl font-bold mb-4">{activeHouse.title}</h2>
          
//           <div className="flex justify-between items-start mb-6">
//             <div className="space-y-2">
//               <p className="text-gray-600">{activeHouse.description}</p>
//               <p className="text-gray-600">{activeHouse.location}</p>
//             </div>
//             <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
//               {activeHouse.type === "sale" ? "Buy Now" : "Rent Now"}
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="flex gap-6 mb-8">
//             <div className="flex items-center gap-2">
//               <Heart className="text-teal-600" />
//               <span>{activeHouse.likes} likes</span>
//             </div>
//             <div className="text-xl font-bold">
//               ${activeHouse.price.toLocaleString()}
//             </div>
//           </div>

//           {/* Other House Preview */}
//           <div className="relative rounded-xl overflow-hidden h-[400px] bg-gray-100">
//             <div className="absolute inset-0">
//               <Image 
//                 src={activeHouse.images[currentImageIndex]} 
//                 alt={activeHouse.title}
//                 layout="fill"
//                 objectFit="cover"
//               />
//             </div>
//             <div className="absolute inset-0 flex items-center justify-between p-4 z-10">
//               <button 
//                 onClick={prevImage}
//                 className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
//               >
//                 <ChevronLeft />
//               </button>
//               <button 
//                 onClick={nextImage}
//                 className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
//               >
//                 <ChevronRight />
//               </button>
//             </div>
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 text-white">
//               {activeHouse.location}
//             </div>
//           </div>
//         </div>

//         {/* Sell Section */}
//         <div id="sell-section" className="p-6 bg-gray-50 mt-8">
//           <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Property?</h2>
//           <p className="text-gray-600 mb-4">List your property and reach thousands of potential buyers</p>
//           <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
//             Get Started
//           </button>
//         </div>
//       </div>

//       {/* Right Column - Slideshow */}
//       <div className="w-1/2 relative">
//         {/* Search and Login */}
//         <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center">
//           <div className="relative flex-1 max-w-md">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search properties..."
//               className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm"
//             />
//           </div>
//           <div className="flex items-center gap-4 text-white ml-4">
//             <button className="hover:text-gray-200">Login</button>
//             <button className="hover:text-gray-200">Sign Up</button>
//             <UserCircle />
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="absolute top-20 left-0 right-0 p-6 z-10 flex gap-4">
//           <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
//             <option>Price Range</option>
//           </select>
//           <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
//             <option>Property Type</option>
//           </select>
//           <select className="px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm">
//             <option>Location</option>
//           </select>
//         </div>

//         {/* Image Slideshow */}
//         <div className="absolute inset-0 bg-gray-200">
//           <Image 
//             src={activeHouse.images[currentImageIndex]} 
//             alt={activeHouse.title}
//             layout="fill"
//             objectFit="cover"
//           />
//           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent text-white">
//             <h3 className="text-xl font-bold mb-2">{activeHouse.title}</h3>
//             <p>{activeHouse.description}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

