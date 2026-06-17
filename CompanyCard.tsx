import { Phone, Globe, ChevronRight, Bus } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import type { TransportCompany } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const TYPE_LABELS = {
  bus: 'Autobús',
  minibus: 'Minibús',
  taxi: 'Taxi',
  shuttle: 'Shuttle',
  international: 'Internacional',
};

const TYPE_COLORS = {
  bus: 'bg-blue-100 text-blue-700',
  minibus: 'bg-purple-100 text-purple-700',
  taxi: 'bg-yellow-100 text-yellow-700',
  shuttle: 'bg-green-100 text-green-700',
  international: 'bg-orange-100 text-orange-700',
};

interface CompanyCardProps {
  company: TransportCompany;
  onViewRoutes: (company: TransportCompany) => void;
}

export function CompanyCard({ company, onViewRoutes }: CompanyCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-10 h-10 object-contain" />
            ) : (
              <Bus size={26} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">{company.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[company.type]}`}>
                {TYPE_LABELS[company.type]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={company.rating} size={13} />
              <span className="text-xs text-gray-500">
                {company.rating.toFixed(1)} ({company.total_reviews} reseñas)
              </span>
            </div>
          </div>
        </div>

        {company.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">{company.description}</p>
        )}

        <div className="mt-3 space-y-1.5">
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors group/link"
            >
              <Phone size={13} className="text-gray-400 group-hover/link:text-blue-500" />
              {company.phone}
            </a>
          )}
          {company.email && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe size={13} />
              {company.email}
            </div>
          )}
        </div>

        <button
          onClick={() => onViewRoutes(company)}
          className="mt-4 w-full py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          {t('viewRoutes')}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
