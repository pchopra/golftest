import React, { useState } from 'react';
import { ShoppingBag, Tag, ExternalLink, Percent, Star } from 'lucide-react';

type Category = 'All' | 'Drivers' | 'Irons' | 'Putters' | 'Balls' | 'Apparel' | 'Accessories';

interface Deal {
  id: number;
  name: string;
  brand: string;
  category: Category;
  originalPrice: number;
  salePrice: number;
  discount: number;
  link: string;
}

const deals: Deal[] = [
  // Drivers
  {
    id: 1,
    name: 'Qi35 Driver',
    brand: 'TaylorMade',
    category: 'Drivers',
    originalPrice: 599,
    salePrice: 449,
    discount: 25,
    link: 'https://www.taylormadegolf.com',
  },
  {
    id: 2,
    name: 'Paradym Ai Smoke Driver',
    brand: 'Callaway',
    category: 'Drivers',
    originalPrice: 549,
    salePrice: 399,
    discount: 27,
    link: 'https://www.callawaygolf.com',
  },
  {
    id: 3,
    name: 'TSR3 Driver',
    brand: 'Titleist',
    category: 'Drivers',
    originalPrice: 599,
    salePrice: 479,
    discount: 20,
    link: 'https://www.titleist.com',
  },
  // Irons
  {
    id: 4,
    name: 'T150 Irons (4-PW)',
    brand: 'Titleist',
    category: 'Irons',
    originalPrice: 1399,
    salePrice: 999,
    discount: 29,
    link: 'https://www.titleist.com',
  },
  {
    id: 5,
    name: 'P790 Irons',
    brand: 'TaylorMade',
    category: 'Irons',
    originalPrice: 1299,
    salePrice: 949,
    discount: 27,
    link: 'https://www.taylormadegolf.com',
  },
  {
    id: 6,
    name: 'Apex Pro Irons',
    brand: 'Callaway',
    category: 'Irons',
    originalPrice: 1249,
    salePrice: 899,
    discount: 28,
    link: 'https://www.callawaygolf.com',
  },
  // Putters
  {
    id: 7,
    name: 'Special Select',
    brand: 'Scotty Cameron',
    category: 'Putters',
    originalPrice: 449,
    salePrice: 349,
    discount: 22,
    link: 'https://www.titleist.com',
  },
  {
    id: 8,
    name: 'White Hot OG',
    brand: 'Odyssey',
    category: 'Putters',
    originalPrice: 299,
    salePrice: 219,
    discount: 27,
    link: 'https://www.callawaygolf.com',
  },
  // Balls
  {
    id: 9,
    name: 'Pro V1 (dozen)',
    brand: 'Titleist',
    category: 'Balls',
    originalPrice: 54.99,
    salePrice: 44.99,
    discount: 18,
    link: 'https://www.titleist.com',
  },
  {
    id: 10,
    name: 'Chrome Soft (dozen)',
    brand: 'Callaway',
    category: 'Balls',
    originalPrice: 49.99,
    salePrice: 34.99,
    discount: 30,
    link: 'https://www.callawaygolf.com',
  },
  // Apparel
  {
    id: 11,
    name: 'Dri-FIT Golf Polo',
    brand: 'Nike',
    category: 'Apparel',
    originalPrice: 75,
    salePrice: 49,
    discount: 35,
    link: 'https://www.nike.com',
  },
  {
    id: 12,
    name: 'Golf Shorts',
    brand: 'Under Armour',
    category: 'Apparel',
    originalPrice: 70,
    salePrice: 45,
    discount: 36,
    link: 'https://www.underarmour.com',
  },
  // Accessories
  {
    id: 13,
    name: 'Approach S70 GPS Watch',
    brand: 'Garmin',
    category: 'Accessories',
    originalPrice: 699,
    salePrice: 549,
    discount: 21,
    link: 'https://www.garmin.com',
  },
  {
    id: 14,
    name: 'Pro X3+ Rangefinder',
    brand: 'Bushnell',
    category: 'Accessories',
    originalPrice: 549,
    salePrice: 449,
    discount: 18,
    link: 'https://www.bushnellgolf.com',
  },
];

const categories: Category[] = ['All', 'Drivers', 'Irons', 'Putters', 'Balls', 'Apparel', 'Accessories'];

const categoryGradients: Record<string, string> = {
  Drivers: 'from-golf-700 to-golf-500',
  Irons: 'from-gray-600 to-gray-400',
  Putters: 'from-golf-800 to-golf-600',
  Balls: 'from-yellow-500 to-yellow-300',
  Apparel: 'from-blue-600 to-blue-400',
  Accessories: 'from-purple-600 to-purple-400',
};

function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
}

const EquipmentDeals: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredDeals =
    activeCategory === 'All' ? deals : deals.filter((d) => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-golf-50 pt-safe pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-800 to-golf-600 px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Equipment &amp; Deals</h1>
        </div>
        <p className="text-golf-200 text-sm">Top Brands, Best Prices</p>
      </div>

      {/* Promo Banner */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 py-3 min-w-max">
          <div className="flex items-center gap-2 bg-golf-700 text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap">
            <Tag className="w-3.5 h-3.5" />
            Free Shipping on orders $50+
          </div>
          <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap">
            <Percent className="w-3.5 h-3.5" />
            Extra 10% off with code GOLFBUDDY
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto scrollbar-hide border-b border-golf-200">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-golf-700 text-white'
                  : 'bg-golf-100 text-golf-700 hover:bg-golf-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Cards */}
      <div className="px-4 py-4 space-y-4">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-xl shadow-sm border border-golf-100 overflow-hidden"
          >
            {/* Product Image Placeholder */}
            <div
              className={`h-40 bg-gradient-to-br ${
                categoryGradients[deal.category] || 'from-golf-600 to-golf-400'
              } flex items-center justify-center relative`}
            >
              <ShoppingBag className="w-16 h-16 text-white/30" />

              {/* Discount Badge */}
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {deal.discount}% OFF
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3 bg-white/90 text-golf-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {deal.category}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs text-golf-500 font-medium uppercase tracking-wide">
                    {deal.brand}
                  </p>
                  <h3 className="text-base font-semibold text-golf-900 leading-snug">
                    {deal.name}
                  </h3>
                </div>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0 mt-1" />
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-3 mt-3 mb-4">
                <span className="text-sm text-golf-400 line-through">
                  {formatPrice(deal.originalPrice)}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(deal.salePrice)}
                </span>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Save {formatPrice(deal.originalPrice - deal.salePrice)}
                </span>
              </div>

              {/* Shop Now Button */}
              <a
                href={deal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-golf-700 hover:bg-golf-800 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Shop Now
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-golf-300 mx-auto mb-3" />
            <p className="text-golf-500 text-sm">No deals found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDeals;
