"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore as db } from "../../../firebaseApp";
import Link from "next/link";
import { PropertyImage } from "@/components/PropertyImage";
import { SiteNav } from "@/components/SiteNav";
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
  Loader2
} from "lucide-react";

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
  type: string;
  likes: number;
  isFeatured: boolean;
  isActive: boolean;
}

export default function RentPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [bedrooms, setBedrooms] = useState<string>("all");

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const housesRef = collection(db, "houses");
      const q = query(
        housesRef,
        where("type", "==", "rent"), // Fixed: Changed from "buy" to "rent"
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const housesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as House[];
      
      setHouses(housesData);
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredHouses = houses.filter(house => {
    const matchesSearch = house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         house.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceRange === "all" ? true :
      priceRange === "0-100m" ? house.price < 100000000 :
      priceRange === "100m-200m" ? house.price >= 100000000 && house.price < 200000000 :
      priceRange === "200m+" ? house.price >= 200000000 : true;
    
    const matchesBedrooms = bedrooms === "all" ? true :
      bedrooms === "1" ? house.bedrooms === 1 :
      bedrooms === "2" ? house.bedrooms === 2 :
      bedrooms === "3" ? house.bedrooms === 3 :
      bedrooms === "4+" ? house.bedrooms >= 4 : true;
    
    return matchesSearch && matchesPrice && matchesBedrooms;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SiteNav active="rent" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-800 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Rent Your Dream Home</h1>
          <p className="text-base sm:text-xl text-emerald-100 mb-6 sm:mb-8">Browse our exclusive collection of properties for rent</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-sm shadow-2xl p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                />
              </div>
              
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
              >
                <option value="all">All Prices</option>
                <option value="0-100m">Under 100M RWF</option>
                <option value="100m-200m">100M - 200M RWF</option>
                <option value="200m+">200M+ RWF</option>
              </select>
              
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
              >
                <option value="all">All Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Available Properties for Rent
            </h2>
            <p className="text-slate-600 mt-1">
              {filteredHouses.length} {filteredHouses.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 transition">
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700">Filters</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        )}

        {/* Properties Grid */}
        {!loading && filteredHouses.length === 0 && (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No properties found</h3>
            <p className="text-slate-600">Try adjusting your search filters</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHouses.map((house) => (
            <HouseCard key={house.id} house={house} formatPrice={formatPrice} />
          ))}
        </div>
      </div>
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
    <Link href={`/house/${house.id}`}> {/* Fixed: Changed from /properties/[id] to /house/[id] */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative h-64 bg-slate-200 overflow-hidden">
          {house.images && house.images.length > 0 ? (
            <>
              <PropertyImage
                src={house.images[currentImageIndex]}
                alt={house.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {house.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
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
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
              </button>

              {house.isFeatured && (
                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition">
              {house.title}
            </h3>
          </div>

          <div className="flex items-center text-slate-600 mb-4">
            <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
            <span className="text-sm">{house.location}</span>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {house.description}
          </p>

          {/* Features */}
          <div className="flex items-center justify-between py-4 border-t border-slate-200 mb-4">
            <div className="flex items-center space-x-1 text-slate-700">
              <Bed className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">{house.bedrooms} Beds</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Bath className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">{house.bathrooms} Baths</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Maximize className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">{house.size} m²</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                {formatPrice(house.price)}
              </p>
              <p className="text-sm text-slate-500">For Rent</p>
            </div>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-sm hover:bg-emerald-700 transition font-medium text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// // this is a copy from /buy/page.tsx to be deleted for the actual codes
// "use client";

// import { useEffect, useState } from "react";
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import { firestore as db } from "../../../firebaseApp";
// import Link from "next/link";
// import Image from "next/image";
// import { 
//   Home, 
//   Search, 
//   SlidersHorizontal, 
//   MapPin, 
//   Bed, 
//   Bath, 
//   Maximize, 
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Loader2
// } from "lucide-react";

// interface House {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   location: string;
//   bedrooms: number;
//   bathrooms: number;
//   size: number;
//   images: string[];
//   features: string[];
//   type: string;
//   likes: number;
//   isFeatured: boolean;
//   isActive: boolean;
// }

// export default function RentPage() {
//   const [houses, setHouses] = useState<House[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [priceRange, setPriceRange] = useState<string>("all");
//   const [bedrooms, setBedrooms] = useState<string>("all");

//   useEffect(() => {
//     fetchHouses();
//   }, []);

//   const fetchHouses = async () => {
//     try {
//       setLoading(true);
//       const housesRef = collection(db, "houses");
//       const q = query(
//         housesRef,
//         where("type", "==", "buy"),
//         where("isActive", "==", true),
//         orderBy("createdAt", "desc")
//       );
      
//       const querySnapshot = await getDocs(q);
//       const housesData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as House[];
      
//       setHouses(housesData);
//     } catch (error) {
//       console.error("Error fetching houses:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("en-RW", {
//       style: "currency",
//       currency: "RWF",
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   const filteredHouses = houses.filter(house => {
//     const matchesSearch = house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          house.location.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesPrice = priceRange === "all" ? true :
//       priceRange === "0-100m" ? house.price < 100000000 :
//       priceRange === "100m-200m" ? house.price >= 100000000 && house.price < 200000000 :
//       priceRange === "200m+" ? house.price >= 200000000 : true;
    
//     const matchesBedrooms = bedrooms === "all" ? true :
//       bedrooms === "1" ? house.bedrooms === 1 :
//       bedrooms === "2" ? house.bedrooms === 2 :
//       bedrooms === "3" ? house.bedrooms === 3 :
//       bedrooms === "4+" ? house.bedrooms >= 4 : true;
    
//     return matchesSearch && matchesPrice && matchesBedrooms;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Navigation */}
//       <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Link href="/" className="flex items-center space-x-2">
//               <Home className="w-8 h-8 text-green-600" />
//               <span className="flex">
//           <b className="text-2xl font-bold text-green-500">i</b>
//         <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-900 bg-clip-text text-transparent">
//   Muhira
// </h1> </span>
//               {/* <span className="text-2xl font-bold text-slate-800">iMuhira</span> */}
//             </Link>
            
//             <div className="hidden md:flex items-center space-x-8">
//               <Link href="/buy" className="text-slate-600 hover:text-slate-800 transition flex items-center space-x-1">
                
//                 <span>Buy</span>
//               </Link>
//               <Link href="/rent" className="underline text-emerald-600 font-semibold">
//                 Rent
//               </Link>  
              
//             </div>

//             <div className="flex space-x-1">
//             <button className="bg-white text-slate-600 px-6 py-2 rounded-sm border border-slate-400  hover:bg-slate-700 hover:text-white transition font-medium">
//               Sign In
//             </button>
//             <button className="bg-emerald-600 text-white px-6 py-2 rounded-sm hover:bg-emerald-700 transition font-medium">
//               Sign Up
//             </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-emerald-600 to-green-800 text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent Your Dream Home</h1>
//           <p className="text-xl text-emerald-100 mb-8">Browse our exclusive collection of properties for rent</p>
          
//           {/* Search Bar */}
//           <div className="bg-white rounded-sm shadow-2xl p-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="md:col-span-2 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by location or title..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
//                 />
//               </div>
              
//               <select
//                 value={priceRange}
//                 onChange={(e) => setPriceRange(e.target.value)}
//                 className="px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
//               >
//                 <option value="all">All Prices</option>
//                 <option value="0-100m">Under 100M RWF</option>
//                 <option value="100m-200m">100M - 200M RWF</option>
//                 <option value="200m+">200M+ RWF</option>
//               </select>
              
//               <select
//                 value={bedrooms}
//                 onChange={(e) => setBedrooms(e.target.value)}
//                 className="px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
//               >
//                 <option value="all">All Bedrooms</option>
//                 <option value="1">1 Bedroom</option>
//                 <option value="2">2 Bedrooms</option>
//                 <option value="3">3 Bedrooms</option>
//                 <option value="4+">4+ Bedrooms</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Results Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800">
//               Available Properties
//             </h2>
//             <p className="text-slate-600 mt-1">
//               {filteredHouses.length} {filteredHouses.length === 1 ? 'property' : 'properties'} found
//             </p>
//           </div>
          
//           <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 transition">
//             <SlidersHorizontal className="w-5 h-5 text-slate-600" />
//             <span className="text-slate-700">Filters</span>
//           </button>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center py-20">
//             <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
//           </div>
//         )}

//         {/* Properties Grid */}
//         {!loading && filteredHouses.length === 0 && (
//           <div className="text-center py-20">
//             <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-slate-800 mb-2">No properties found</h3>
//             <p className="text-slate-600">Try adjusting your search filters</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filteredHouses.map((house) => (
//             <HouseCard key={house.id} house={house} formatPrice={formatPrice} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function HouseCard({ house, formatPrice }: { house: House; formatPrice: (price: number) => string }) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isLiked, setIsLiked] = useState(false);

//   const nextImage = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setCurrentImageIndex((prev) => (prev + 1) % house.images.length);
//   };

//   const prevImage = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length);
//   };

//   return (
//     <Link href={`/properties/${house.id}`}>
//       <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
//         {/* Image Carousel */}
//         <div className="relative h-64 bg-slate-200 overflow-hidden">
//           {house.images && house.images.length > 0 ? (
//             <>
//               <Image
//                 src={house.images[currentImageIndex]}
//                 alt={house.title}
//                 fill
//                 className="object-cover group-hover:scale-110 transition-transform duration-500"
//               />
              
//               {house.images.length > 1 && (
//                 <>
//                   <button
//                     onClick={prevImage}
//                     className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
//                   >
//                     <ChevronLeft className="w-5 h-5 text-slate-800" />
//                   </button>
//                   <button
//                     onClick={nextImage}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
//                   >
//                     <ChevronRight className="w-5 h-5 text-slate-800" />
//                   </button>
                  
//                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
//                     {house.images.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-2 h-2 rounded-full transition ${
//                           index === currentImageIndex ? "bg-white" : "bg-white/50"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </>
//               )}
              
//               <button
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setIsLiked(!isLiked);
//                 }}
//                 className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
//               >
//                 <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
//               </button>

//               {house.isFeatured && (
//                 <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                   Featured
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <Home className="w-16 h-16 text-slate-300" />
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           <div className="flex items-start justify-between mb-3">
//             <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition">
//               {house.title}
//             </h3>
//           </div>

//           <div className="flex items-center text-slate-600 mb-4">
//             <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
//             <span className="text-sm">{house.location}</span>
//           </div>

//           <p className="text-slate-600 text-sm mb-4 line-clamp-2">
//             {house.description}
//           </p>

//           {/* Features */}
//           <div className="flex items-center justify-between py-4 border-t border-slate-200 mb-4">
//             <div className="flex items-center space-x-1 text-slate-700">
//               <Bed className="w-5 h-5 text-emerald-600" />
//               <span className="text-sm font-medium">{house.bedrooms} Beds</span>
//             </div>
//             <div className="flex items-center space-x-1 text-slate-700">
//               <Bath className="w-5 h-5 text-emerald-600" />
//               <span className="text-sm font-medium">{house.bathrooms} Baths</span>
//             </div>
//             <div className="flex items-center space-x-1 text-slate-700">
//               <Maximize className="w-5 h-5 text-emerald-600" />
//               <span className="text-sm font-medium">{house.size} m²</span>
//             </div>
//           </div>

//           {/* Price */}
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-2xl font-bold text-emerald-600">
//                 {formatPrice(house.price)}
//               </p>
//             </div>
//             <button className="bg-emerald-600 text-white px-4 py-2 rounded-sm hover:bg-emerald-700 transition font-medium text-sm">
//               View Details
//             </button>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }