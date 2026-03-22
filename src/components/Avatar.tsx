import { Camera } from 'lucide-react';

interface AvatarProps {
  firstName: string;
  lastName: string;
  profilePicture?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onEdit?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ firstName, lastName, profilePicture, size = 'md', editable, onEdit }: AvatarProps) {
  const cls = sizeClasses[size];

  return (
    <div className={`${cls} rounded-full relative shrink-0`}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-golf-400 to-golf-700 flex items-center justify-center text-white font-bold">
          {(firstName || '?')[0]}{(lastName || '?')[0]}
        </div>
      )}
      {editable && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-golf-700 text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-golf-800 transition-colors"
        >
          <Camera size={10} />
        </button>
      )}
    </div>
  );
}
