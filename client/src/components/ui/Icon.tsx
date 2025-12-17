'use client';

import {
  Home,
  Clock,
  User,
  Settings,
  ArrowLeft,
  X,
  Menu,
  Search,
  Phone,
  MessageSquare,
  Bell,
  Droplets,
  Key,
  Zap,
  Wrench,
  Check,
  Star,
  Navigation,
  CreditCard,
  Lock,
  ChevronRight,
  ChevronLeft,
  Shield,
  ShieldCheck,
  UserPlus,
  LogOut,
  Signal,
  Wifi,
  BatteryMedium,
  MapPin,
  Send,
  Mic,
  Camera,
  Heart,
  Share2,
  Gift,
  Wind,
  Car,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  Link,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  clock: Clock,
  history: Clock,
  'message-circle': MessageSquare,
  user: User,
  profile: User,
  settings: Settings,
  'arrow-left': ArrowLeft,
  back: ArrowLeft,
  x: X,
  close: X,
  menu: Menu,
  search: Search,
  phone: Phone,
  'message-square': MessageSquare,
  message: MessageSquare,
  bell: Bell,
  notification: Bell,
  droplets: Droplets,
  plumbing: Droplets,
  key: Key,
  locksmith: Key,
  zap: Zap,
  electrical: Zap,
  wrench: Wrench,
  check: Check,
  star: Star,
  navigation: Navigation,
  'credit-card': CreditCard,
  lock: Lock,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  shield: Shield,
  'shield-check': ShieldCheck,
  'user-plus': UserPlus,
  'log-out': LogOut,
  signal: Signal,
  wifi: Wifi,
  'battery-medium': BatteryMedium,
  battery: BatteryMedium,
  'map-pin': MapPin,
  location: MapPin,
  send: Send,
  mic: Mic,
  microphone: Mic,
  camera: Camera,
  heart: Heart,
  favorite: Heart,
  share: Share2,
  gift: Gift,
  referral: Gift,
  wind: Wind,
  hvac: Wind,
  car: Car,
  auto: Car,
  sparkles: Sparkles,
  cleaning: Sparkles,
  'alert-circle': AlertCircle,
  alert: AlertCircle,
  'check-circle': CheckCircle,
  success: CheckCircle,
  info: Info,
  link: Link,
};

export type IconName = keyof typeof iconMap;

export interface IconProps {
  name: IconName | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  strokeWidth?: number;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({ 
  name, 
  size = 'md', 
  className,
  strokeWidth = 2,
}: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  return (
    <IconComponent 
      size={pixelSize} 
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)} 
    />
  );
}

export default Icon;

