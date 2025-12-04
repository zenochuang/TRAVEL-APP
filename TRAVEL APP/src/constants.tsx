import React from 'react';
import {
  Plane, Train, Bus, Car, Hotel, Utensils, Coffee, Beer,
  ShoppingBag, Camera, MapPin, Mountain, Sun, Moon, Umbrella,
  Music, Ticket, CreditCard, DollarSign, Gift, Heart, Star,
  Flag, Anchor, Briefcase, Home, User, Users, Smartphone,
  Wifi, Battery, Watch, LucideIcon
} from 'lucide-react';
import { IconName, Trip } from './types';
import { v4 as uuidv4 } from 'uuid';

export const ICONS: Record<IconName, LucideIcon> = {
  Plane, Train, Bus, Car, Hotel, Utensils, Coffee, Beer,
  ShoppingBag, Camera, MapPin, Mountain, Sun, Moon, Umbrella,
  Music, Ticket, CreditCard, DollarSign, Gift, Heart, Star,
  Flag, Anchor, Briefcase, Home, User, Users, Smartphone,
  Wifi, Battery, Watch
};

export const ICON_KEYS = Object.keys(ICONS) as IconName[];

// 32 Animal Emojis
export const ANIMAL_EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', 'fox', '🐻', '🐼', 
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', 
  '🐧', '🐦', 'base', '🐺', '🐗', '🐴', '🦄', '🐝', 
  '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️'
].map(e => e === 'fox' ? '🦊' : e === 'base' ? '🐣' : e); 

export const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
];

export const MOCK_WEATHER = {
  tempMin: 15,
  tempMax: 22,
  rainProb: 0,
  condition: '晴朗'
};

export const OSAKA_TRIP: Trip = {
  id: uuidv4(),
  name: '大阪跨年之旅',
  startDate: '2025-12-31',
  endDate: '2026-01-04',
  location: '大阪',
  icon: 'Plane',
  members: [], // Will be populated in App.tsx
  expenses: [],
  todos: [],
  weather: {},
  itinerary: {
    '2025-12-31': [
      { id: uuidv4(), startTime: '12:00', duration: '1h', name: '關西國際機場', note: '', icon: 'Plane', link: 'https://www.google.com/maps/search/?api=1&query=Kansai+International+Airport' },
      { id: uuidv4(), startTime: '13:59', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '15:14', duration: '1h', name: 'HARBS 大丸梅田店', note: '', icon: 'Coffee', link: 'https://www.google.com/maps/search/?api=1&query=HARBS+%E5%A4%A7%E4%B8%B8%E6%A2%85%E7%94%B0%E5%BA%97' },
      { id: uuidv4(), startTime: '16:30', duration: '1h', name: '梅田藍天大樓', note: '', icon: 'Mountain', link: 'https://www.google.com/maps/search/?api=1&query=Umeda+Sky+Building+Osaka' },
      { id: uuidv4(), startTime: '17:53', duration: '1h', name: '心齋橋宮田麵兒-大阪沾麵', note: '', icon: 'Utensils', link: 'https://www.google.com/maps/search/?api=1&query=%E5%BF%83%E9%BD%8B%E6%A9%8B+%E5%AE%AE%E7%94%B0%E9%BA%B5%E5%85%92' },
      { id: uuidv4(), startTime: '19:04', duration: '1h 30m', name: '道頓堀', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Dotonbori' },
      { id: uuidv4(), startTime: '20:49', duration: '1h', name: '四天王寺', note: '', icon: 'MapPin', link: 'https://www.google.com/maps/search/?api=1&query=%E5%9B%9B%E5%A4%A9%E7%8E%8B%E5%AF%BA' },
      { id: uuidv4(), startTime: '22:02', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com.maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
    ],
    '2026-01-01': [
      { id: uuidv4(), startTime: '06:00', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '07:27', duration: '12h', name: '日本環球影城', note: '', icon: 'Ticket', link: 'https://www.google.com/maps/search/?api=1&query=Universal+Studios+Japan' },
      { id: uuidv4(), startTime: '19:46', duration: '1h', name: 'どうとんぼり神座 ユニバーサルシティビル店', note: '', icon: 'Utensils', link: 'https://www.google.com/maps/search/?api=1&query=%E3%81%A9%E3%81%86%E3%81%A8%E3%82%93%E3%81%BC%E3%82%8A%E7%A5%9E%E5%BA%A7+%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E3%82%B7%E3%83%86%E3%82%A3%E3%83%93%E3%83%AB%E5%BA%97' },
      { id: uuidv4(), startTime: '21:07', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
    ],
    '2026-01-02': [
      { id: uuidv4(), startTime: '09:30', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '10:53', duration: '1h', name: '大起水產 迴轉壽司 道頓堀店', note: '', icon: 'Utensils', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E8%B5%B7%E6%B0%B4%E7%94%A2+%E5%B7%BB%E8%BD%89%E5%A3%BD%E5%8F%B8+%E9%81%93%E9%A0%93%E5%A0%80' },
      { id: uuidv4(), startTime: '11:58', duration: '25m', name: 'Kakuozan Fruit Daifuku Benzaiten', note: '', icon: 'Coffee', link: 'https://www.google.com/maps/search/?api=1&query=Kakuozan+Fruit+Daifuku+Benzaiten' },
      { id: uuidv4(), startTime: '12:34', duration: '40m', name: 'Jungle', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Jungle+Osaka' },
      { id: uuidv4(), startTime: '13:25', duration: '20m', name: '新世界本通商店街', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=%E6%96%B0%E4%B8%96%E7%95%8C+%E6%9C%AC%E9%80%9A+%E5%95%86%E5%BA%97%E8%A1%97' },
      { id: uuidv4(), startTime: '13:47', duration: '30m', name: '通天閣', note: '', icon: 'Mountain', link: 'https://www.google.com.maps/search/?api=1&query=%E9%80%9A%E5%A4%A9%E9%96%A3' },
      { id: uuidv4(), startTime: '14:28', duration: '30m', name: '難波八阪神社', note: '', icon: 'MapPin', link: 'https://www.google.com.maps/search/?api=1&query=%E9%9B%A3%E6%B3%A2+%E5%85%AB%E5%9D%AA%E7%A5%9E%E7%A4%BE' },
      { id: uuidv4(), startTime: '15:09', duration: '30m', name: 'AniBirth 心斎橋PARCO店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=AniBirth+Shinsaibashi+PARCO' },
      { id: uuidv4(), startTime: '15:41', duration: '1h', name: 'graniph 心齋橋店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=graniph+Shinsaibashi' },
      { id: uuidv4(), startTime: '16:43', duration: '1h', name: 'Shinsaibashisuji', note: '', icon: 'ShoppingBag', link: 'https://www.google.com.maps/search/?api=1&query=Shinsaibashisuji' },
      { id: uuidv4(), startTime: '17:52', duration: '1h', name: '爐端燒 水掛茶屋 難波店', note: '', icon: 'Utensils', link: 'https://www.google.com.maps/search/?api=1&query=%E7%86%90%E7%AB%AF%E7%87%92+%E6%B0%B4%E6%8E%9B%E8%8C%B6%E5%B1%8B+%E9%9B%A3%E6%B3%A2' },
      { id: uuidv4(), startTime: '18:59', duration: '45m', name: 'UNIQLO 心齋橋筋店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=UNIQLO+Shinsaibashisuji' },
      { id: uuidv4(), startTime: '19:45', duration: '45m', name: 'GU 心齋橋店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com.maps/search/?api=1&query=GU+Shinsaibashi' },
      { id: uuidv4(), startTime: '20:37', duration: '1h', name: '驚安殿堂唐吉訶德 難波千日前店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Donki+Namba+Sennichimae' },
      { id: uuidv4(), startTime: '21:48', duration: '1h', name: '一蘭 難波御堂筋店', note: '', icon: 'Utensils', link: 'https://www.google.com/maps/search/?api=1&query=Ichiran+Namba+Midosuji' },
      { id: uuidv4(), startTime: '23:04', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com.maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
    ],
    '2026-01-03': [
      { id: uuidv4(), startTime: '08:00', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '09:16', duration: '30m', name: '藍瓶咖啡 心齋橋店', note: '', icon: 'Coffee', link: 'https://www.google.com.maps/search/?api=1&query=Blue+Bottle+Coffee+Shinsaibashi' },
      { id: uuidv4(), startTime: '10:06', duration: '1h', name: '梅田 LOFT', note: '', icon: 'ShoppingBag', link: 'https://www.google.com.maps/search/?api=1&query=Umeda+LOFT' },
      { id: uuidv4(), startTime: '11:09', duration: '1h', name: '北新地 とんかつ エペ 阪神梅田店', note: '', icon: 'Utensils', link: 'https://www.google.com.maps/search/?api=1&query=%E5%8C%97%E6%96%B0%E5%9C%B0+%E3%81%A8%E3%82%93%E3%81%8B%E3%81%A4+%E9%98%AA%E6%A9%9F+%E6%A2%85%E7%94%B0' },
      { id: uuidv4(), startTime: '12:15', duration: '1h', name: 'LUCUA Osaka', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=LUCUA+Osaka' },
      { id: uuidv4(), startTime: '13:16', duration: '30m', name: 'Disney Store LUCUA1100 Osaka', note: '', icon: 'ShoppingBag', link: 'https://www.google.com.maps/search/?api=1&query=Disney+Store+LUCUA+1100+Osaka' },
      { id: uuidv4(), startTime: '13:47', duration: '30m', name: '湯姆貓與傑利鼠 (Tom & Jerry store)', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Tom+and+Jerry+store+Osaka' },
      { id: uuidv4(), startTime: '14:18', duration: '30m', name: 'Graniph LUCUA Osaka', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=graniph+LUCUA+Osaka' },
      { id: uuidv4(), startTime: '14:59', duration: '1h', name: 'GRAND GREEN OSAKA', note: '', icon: 'Mountain', link: 'https://www.google.com.maps.search/?api=1&query=Grand+Green+Osaka' },
      { id: uuidv4(), startTime: '16:04', duration: '45m', name: '無印良品 Grand Front Osaka 店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Muji+Grand+Front+Osaka' },
      { id: uuidv4(), startTime: '16:53', duration: '20m', name: 'Jiichiro', note: '', icon: 'Coffee', link: 'https://www.google.com.maps/search/?api=1&query=Jiichiro+Osaka' },
      { id: uuidv4(), startTime: '17:14', duration: '1h', name: 'GRAND FRONT 大阪', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Grand+Front+Osaka' },
      { id: uuidv4(), startTime: '18:17', duration: '1h', name: '友都八喜 相機多媒體 梅田店', note: '', icon: 'Camera', link: 'https://www.google.com.maps/search/?api=1&query=Yodobashi+Camera+Umeda' },
      { id: uuidv4(), startTime: '19:22', duration: '30m', name: 'GRAND Calbee 阪急梅田 B1F 店', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=GRAND+Calbee+Umeda' },
      { id: uuidv4(), startTime: '19:59', duration: '1h', name: 'A Happy Pancake', note: '', icon: 'Coffee', link: 'https://www.google.com.maps/search/?api=1&query=A+Happy+Pancake+Osaka' },
      { id: uuidv4(), startTime: '21:06', duration: '1h', name: 'Niku-no-Asatsu Umeda Ohatsu Tenjin', note: '', icon: 'Utensils', link: 'https://www.google.com.maps/search/?api=1&query=Niku-no-Asatsu+Umeda+Ohatsu+Tenjin' },
      { id: uuidv4(), startTime: '22:16', duration: '30m', name: 'Kitashinchi Sand', note: '', icon: 'Utensils', link: 'https://www.google.com.maps/search/?api=1&query=Kitashinchi+Osaka' },
      { id: uuidv4(), startTime: '22:59', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com.maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
    ],
    '2026-01-04': [
      { id: uuidv4(), startTime: '07:30', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '08:32', duration: '40m', name: '麥當勞 堺筋南久寶寺店', note: '', icon: 'Utensils', link: 'https://www.google.com/maps/search/?api=1&query=McDonald+%E5%A0%BA%E7%AD%8B+%E5%8D%97%E4%B9%85%E5%AF%B6%E5%AF%BA' },
      { id: uuidv4(), startTime: '09:35', duration: '40m', name: '住吉大社', note: '', icon: 'MapPin', link: 'https://www.google.com.maps/search/?api=1&query=Sumiyoshi+Taisha' },
      { id: uuidv4(), startTime: '10:37', duration: '1h', name: '大阪本町都城市酒店', note: '', icon: 'Hotel', link: 'https://www.google.com.maps/search/?api=1&query=%E5%A4%A7%E9%98%AA+%E6%9C%AC%E7%94%BA+%E9%83%BD%E5%9F%8E%E5%B8%82%E9%85%92%E5%BA%97' },
      { id: uuidv4(), startTime: '12:22', duration: '2h 30m', name: 'りんくう Premium Outlets', note: '', icon: 'ShoppingBag', link: 'https://www.google.com/maps/search/?api=1&query=Rinku+Premium+Outlets' },
      { id: uuidv4(), startTime: '15:24', duration: '1h', name: '關西國際機場', note: '', icon: 'Plane', link: 'https://www.google.com.maps/search/?api=1&query=Kansai+International+Airport' },
    ]
  }
};
