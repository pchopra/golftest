import { Clock, MapPin, ShoppingCart, Flame } from 'lucide-react';
import type { HotDeal } from '../data/hotDeals';

interface Props {
  deal: HotDeal;
  distance: number | null;
}

export default function HotDealCard({ deal, distance }: Props) {
  const discount = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);

  return (
    <div className="min-w-[280px] max-w-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-start shrink-0">
      {/* Header */}
      <div className={`h-20 bg-gradient-to-br ${deal.imageGradient} relative flex items-end p-3`}>
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Flame size={10} />
          {discount}% OFF
        </div>
        <p className="text-white font-bold text-sm leading-tight drop-shadow">{deal.courseName}</p>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <MapPin size={12} />
          <span>{deal.city}, {deal.state}</span>
          {distance !== null && (
            <span className="text-golf-700 font-semibold">{distance} mi</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Clock size={12} />
          <span>{deal.teeTime} &middot; {deal.holes} holes</span>
          {deal.includesCart && (
            <span className="flex items-center gap-1 text-green-600">
              <ShoppingCart size={10} />
              Cart included
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-green-600">${deal.dealPrice}</span>
            <span className="text-sm text-gray-400 line-through">${deal.originalPrice}</span>
          </div>
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(deal.courseName + ' tee time')}`, '_blank')}
            className="px-4 py-2 bg-golf-700 text-white text-xs font-semibold rounded-xl hover:bg-golf-800 transition-colors"
          >
            Book Deal
          </button>
        </div>
      </div>
    </div>
  );
}
