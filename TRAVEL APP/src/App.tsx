import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar, MapPin, ChevronLeft, Save, Trash2, 
  Wallet, PieChart, Users, ArrowRightLeft, DollarSign, X, Check,
  MoreVertical, Edit3, GripVertical, Sun, Umbrella, Link as LinkIcon,
  Navigation, CheckCircle, Circle, Settings, ListChecks
} from 'lucide-react';
import { Reorder, useDragControls, useMotionValue } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, addDays, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { Trip, Activity, Member, Expense, Currency, EXCHANGE_RATES, IconName, UserProfile, Todo, WeatherData } from './types';
import { ICONS, AVATAR_COLORS, MOCK_WEATHER, ANIMAL_EMOJIS, OSAKA_TRIP } from './constants';
import { getWeatherForecast, categorizeExpenseItem } from './services/geminiService';
import { IconPicker } from './components/IconPicker';

// --- Helper Components ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Avatar: React.FC<{ member: Member; size?: 'sm' | 'md' | 'lg'; showName?: boolean; onClick?: () => void }> = ({ member, size = 'md', showName = false, onClick }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-lg' : size === 'md' ? 'w-10 h-10 text-xl' : 'w-16 h-16 text-3xl';
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <div 
        className={`${sizeClass} rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700 shadow-lg`}
      >
        {member.avatar}
      </div>
      {showName && <span className="text-xs text-zinc-400">{member.name}</span>}
    </div>
  );
};

// --- Main App ---

export default function App() {
  // --- State ---
  const [view, setView] = useState<'LIST' | 'TRIP' | 'EXPENSE' | 'TODO'>('LIST');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('luxe_user');
      return saved ? JSON.parse(saved) : { name: '自己', avatar: ANIMAL_EMOJIS[0] };
    } catch {
      return { name: '自己', avatar: ANIMAL_EMOJIS[0] };
    }
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('luxe_trips');
      let loadedTrips = saved ? JSON.parse(saved) : [];
      // If no trips, load Osaka trip
      if (loadedTrips.length === 0) {
        loadedTrips = [{...OSAKA_TRIP, members: [{ id: 'me', name: userProfile.name, avatar: userProfile.avatar }]}];
      }
      return loadedTrips;
    } catch (e) {
      return [];
    }
  });
  
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  
  // Trip Detail State
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('luxe_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('luxe_user', JSON.stringify(userProfile));
    // Update 'me' member in all trips
    setTrips(prev => prev.map(trip => ({
      ...trip,
      members: trip.members.map(m => m.id === 'me' ? { ...m, name: userProfile.name, avatar: userProfile.avatar } : m)
    })));
  }, [userProfile]);

  // Derived State
  const activeTrip = useMemo(() => trips.find(t => t.id === activeTripId), [trips, activeTripId]);
  
  const tripDates = useMemo(() => {
    if (!activeTrip) return [];
    try {
      const start = parseISO(activeTrip.startDate);
      const end = parseISO(activeTrip.endDate);
      const days = differenceInDays(end, start) + 1;
      return Array.from({ length: Math.max(1, days) }, (_, i) => addDays(start, i));
    } catch (e) {
      return [new Date()];
    }
  }, [activeTrip]);

  const currentItinerary = useMemo(() => {
    if (!activeTrip || tripDates.length === 0) return [];
    const dateKey = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
    return activeTrip.itinerary[dateKey] || [];
  }, [activeTrip, tripDates, selectedDateIndex]);

  // Weather Logic - Persisted
  useEffect(() => {
    if (activeTrip && tripDates.length > 0) {
      const dateStr = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
      
      // Check if weather data already exists in the trip object
      if (!activeTrip.weather?.[dateStr]) {
         // Fetch only if not present
         getWeatherForecast(activeTrip.location, dateStr).then(result => {
             setTrips(prev => prev.map(t => {
                if (t.id === activeTrip.id) {
                   return {
                      ...t,
                      weather: {
                         ...t.weather,
                         [dateStr]: result
                      }
                   };
                }
                return t;
             }));
         });
      }
    }
  }, [activeTrip, selectedDateIndex, tripDates]);

  // Use persisted weather data
  const currentWeather = useMemo(() => {
     if (!activeTrip || tripDates.length === 0) return null;
     const dateStr = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
     return activeTrip.weather?.[dateStr] || null;
  }, [activeTrip, tripDates, selectedDateIndex]);

  // --- Handlers ---

  const handleCreateTrip = (tripData: any) => {
    const newTrip: Trip = {
      id: uuidv4(),
      ...tripData,
      members: [{ id: 'me', name: userProfile.name, avatar: userProfile.avatar }],
      itinerary: {},
      expenses: [],
      todos: [],
      weather: {}
    };
    setTrips([...trips, newTrip]);
    setIsAddTripOpen(false);
  };

  const handleUpdateTrip = (tripData: any) => {
    if (!activeTrip) return;
    const updated = { ...activeTrip, ...tripData };
    setTrips(trips.map(t => t.id === activeTrip.id ? updated : t));
    setIsEditTripOpen(false);
  };

  const handleDeleteTrip = () => {
    if (!activeTrip) return;
    setTrips(trips.filter(t => t.id !== activeTrip.id));
    setIsEditTripOpen(false);
    setActiveTripId(null);
    setView('LIST');
  };

  const handleSaveActivity = (activityData: any) => {
    if (!activeTrip) return;
    const dateKey = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
    const updatedTrip = { ...activeTrip };
    if (!updatedTrip.itinerary[dateKey]) updatedTrip.itinerary[dateKey] = [];

    if (editingActivity) {
      // Edit
      updatedTrip.itinerary[dateKey] = updatedTrip.itinerary[dateKey].map(a => 
        a.id === editingActivity.id ? { ...activityData, id: a.id } : a
      );
    } else {
      // Add
      const newActivity = { ...activityData, id: uuidv4() };
      updatedTrip.itinerary[dateKey].push(newActivity);
    }
    
    // Sort
    updatedTrip.itinerary[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime));

    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
    setIsAddActivityOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (id: string) => {
    if (!activeTrip) return;
    const dateKey = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
    const updatedTrip = { ...activeTrip };
    updatedTrip.itinerary[dateKey] = updatedTrip.itinerary[dateKey].filter(a => a.id !== id);
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
    setIsAddActivityOpen(false);
    setEditingActivity(null);
  };

  const handleReorderActivities = (newOrder: Activity[]) => {
    if (!activeTrip) return;
    const dateKey = format(tripDates[selectedDateIndex], 'yyyy-MM-dd');
    const updatedTrip = { ...activeTrip };
    updatedTrip.itinerary[dateKey] = newOrder;
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
  };

  const handleAddMember = (name: string, avatar: string) => {
    if (!activeTrip) return;
    const newMember: Member = {
      id: uuidv4(),
      name,
      avatar: avatar
    };
    const updatedTrip = { ...activeTrip, members: [...activeTrip.members, newMember] };
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
  };

  const handleSaveExpense = async (data: any) => {
    if (!activeTrip) return;
    
    // Persist currency
    localStorage.setItem('luxe_last_currency', data.currency);

    let updatedExpenses = [...activeTrip.expenses];
    
    if (editingExpense) {
       updatedExpenses = updatedExpenses.map(e => e.id === editingExpense.id ? { ...editingExpense, ...data } : e);
    } else {
       const category = await categorizeExpenseItem(data.item);
       const newExpense: Expense = {
         id: uuidv4(),
         date: new Date().toISOString(),
         category,
         ...data
       };
       updatedExpenses.push(newExpense);
    }

    const updatedTrip = { ...activeTrip, expenses: updatedExpenses };
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
    setIsAddExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (!activeTrip) return;
    const updatedTrip = { ...activeTrip, expenses: activeTrip.expenses.filter(e => e.id !== id) };
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
    setIsAddExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleToggleTodo = (id: string) => {
    if (!activeTrip) return;
    const updatedTodos = (activeTrip.todos || []).map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    const updatedTrip = { ...activeTrip, todos: updatedTodos };
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
  };

  const handleAddTodo = (text: string) => {
    if (!activeTrip) return;
    const newTodo: Todo = { id: uuidv4(), text, completed: false };
    const updatedTrip = { ...activeTrip, todos: [...(activeTrip.todos || []), newTodo] };
    setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
  };

  const handleDeleteTodo = (id: string) => {
     if (!activeTrip) return;
     const updatedTrip = { ...activeTrip, todos: (activeTrip.todos || []).filter(t => t.id !== id) };
     setTrips(trips.map(t => t.id === activeTrip.id ? updatedTrip : t));
  };

  // --- Views ---

  if (view === 'LIST') {
    return (
      <div className="min-h-screen p-6 pb-24 relative">
        <header className="mb-8 mt-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-light tracking-wide text-white">我的旅程</h1>
            <p className="text-zinc-500 mt-2">下一站去哪？</p>
          </div>
          <div className="flex flex-col items-center">
            <Avatar 
               member={{id: 'me', name: userProfile.name, avatar: userProfile.avatar}} 
               size="lg" 
               onClick={() => setIsProfileOpen(true)}
            />
            <span className="text-sm text-zinc-400 mt-1 font-medium">{userProfile.name}</span>
          </div>
        </header>

        <div className="grid gap-4">
          {trips.map(trip => {
            const Icon = ICONS[trip.icon] || MapPin;
            return (
              <div 
                key={trip.id} 
                onClick={() => { setActiveTripId(trip.id); setView('TRIP'); }}
                className="glass-panel p-5 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-primary/50 transition-colors">
                  <Icon className="text-zinc-300 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">{trip.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                    <span>{trip.location}</span>
                    <span>•</span>
                    <span>{trip.startDate}</span>
                  </div>
                </div>
                <ChevronLeft className="rotate-180 text-zinc-600" />
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setIsAddTripOpen(true)}
          className="fixed bottom-8 right-6 w-14 h-14 bg-primary rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>

        <AddTripModal isOpen={isAddTripOpen} onClose={() => setIsAddTripOpen(false)} onSave={handleCreateTrip} />
        <ProfileModal 
           isOpen={isProfileOpen} 
           onClose={() => setIsProfileOpen(false)} 
           profile={userProfile} 
           onSave={setUserProfile} 
        />
      </div>
    );
  }

  // Common Bottom Nav for Trip Views
  const BottomNav = () => (
    <div className="fixed bottom-0 inset-x-0 glass-panel-heavy p-2 pb-6 flex items-center justify-around z-30">
       <button onClick={() => setView('TRIP')} className={`flex flex-col items-center gap-1 p-2 ${view === 'TRIP' ? 'text-primary' : 'text-zinc-500'}`}>
          <MapPin size={24} />
          <span className="text-[10px]">行程</span>
       </button>
       <button onClick={() => setView('EXPENSE')} className={`flex flex-col items-center gap-1 p-2 ${view === 'EXPENSE' ? 'text-primary' : 'text-zinc-500'}`}>
          <Wallet size={24} />
          <span className="text-[10px]">分帳</span>
       </button>
       <button onClick={() => setView('TODO')} className={`flex flex-col items-center gap-1 p-2 ${view === 'TODO' ? 'text-primary' : 'text-zinc-500'}`}>
          <ListChecks size={24} />
          <span className="text-[10px]">待辦</span>
       </button>
    </div>
  );

  if (activeTrip) {
    const activeIconKey = activeTrip.icon;
    const TripIcon = ICONS[activeIconKey] || MapPin;

    return (
      <div className="min-h-screen flex flex-col relative bg-background pb-20">
        {/* Header */}
        <div className="p-4 pt-8 glass-panel-heavy z-10 sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView('LIST')} className="p-2 -ml-2 text-zinc-400 hover:text-white">
              <ChevronLeft />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <TripIcon size={16} className="text-primary" />
                {activeTrip.name}
              </h2>
            </div>
            <button onClick={() => setIsEditTripOpen(true)} className="p-2 text-zinc-400 hover:text-white">
              <Settings size={20} />
            </button>
          </div>

          {view === 'TRIP' && (
            <>
               {/* Date Tabs Moved to Top */}
               <div className="flex overflow-x-auto gap-3 pb-2 mb-4 no-scrollbar">
                {tripDates.map((date, idx) => {
                  const isActive = idx === selectedDateIndex;
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider">{format(date, 'EEE')}</span>
                      <span className="text-xl font-light mt-1">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {view === 'TRIP' && (
          <div className="flex-1 p-4 overflow-y-auto">
             {/* Weather Inside Itinerary - AI Driven & Persisted */}
             <div className="mb-6">
                <div className="flex items-stretch gap-4 mb-2">
                  <div className="flex-1 glass-panel rounded-xl p-3 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                       <span className="text-zinc-400 text-xs">氣溫</span>
                       <Sun size={16} className="text-amber-400" />
                     </div>
                     <div className="mt-2">
                       {currentWeather ? (
                         <>
                            <span className="text-2xl font-light text-white">{currentWeather.data.tempMin}°</span>
                            <span className="text-zinc-500 text-sm mx-1">-</span>
                            <span className="text-2xl font-light text-white">{currentWeather.data.tempMax}°</span>
                         </>
                       ) : (
                          <div className="animate-pulse bg-zinc-800 h-8 w-20 rounded" />
                       )}
                     </div>
                  </div>
                  <div className="flex-1 glass-panel rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <span className="text-zinc-400 text-xs">降雨機率</span>
                       <Umbrella size={16} className="text-blue-400" />
                     </div>
                     <div className="mt-2 text-xl text-white font-light flex items-center justify-between">
                        {currentWeather ? (
                           <>
                              <span>{currentWeather.data.rainProb}%</span>
                              <span className="text-xs text-zinc-400">{currentWeather.data.condition}</span>
                           </>
                        ) : (
                           <div className="animate-pulse bg-zinc-800 h-8 w-10 rounded" />
                        )}
                     </div>
                  </div>
                </div>
                <div className="glass-panel p-2 rounded-lg text-xs text-zinc-300 flex gap-2 items-center min-h-[40px]">
                   <div className="w-1 h-8 bg-primary rounded-full"></div>
                   <p className="italic">{currentWeather ? currentWeather.advice : "正在分析天氣狀況..."}</p>
                </div>
             </div>

            <Reorder.Group axis="y" values={currentItinerary} onReorder={handleReorderActivities}>
              {currentItinerary.map((activity) => (
                <ItineraryCard 
                   key={activity.id} 
                   activity={activity} 
                   onEdit={() => { setEditingActivity(activity); setIsAddActivityOpen(true); }}
                />
              ))}
            </Reorder.Group>
            
            {currentItinerary.length === 0 && (
               <div className="text-center mt-20 text-zinc-600 font-light">
                 <p>尚無行程。</p>
                 <p className="text-sm">點擊 + 新增。</p>
               </div>
            )}
             {/* Floating Action Button */}
            <button 
              onClick={() => { setEditingActivity(null); setIsAddActivityOpen(true); }}
              className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-white active:scale-90 transition-transform z-20"
            >
              <Plus size={28} />
            </button>
          </div>
        )}

        {view === 'EXPENSE' && (
          <ExpenseManager 
            trip={activeTrip} 
            onAddExpense={(data) => handleSaveExpense(data)}
            onEditExpense={(expense) => { setEditingExpense(expense); setIsAddExpenseOpen(true); }}
            onAddMember={handleAddMember}
            activeTripId={activeTripId!}
            onOpenAdd={() => { setEditingExpense(null); setIsAddExpenseOpen(true); }}
          />
        )}

        {view === 'TODO' && (
           <TodoManager 
              todos={activeTrip.todos || []}
              onAdd={handleAddTodo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
           />
        )}

        <BottomNav />

        <EditTripModal 
           isOpen={isEditTripOpen} 
           onClose={() => setIsEditTripOpen(false)} 
           trip={activeTrip} 
           onSave={handleUpdateTrip} 
           onDelete={handleDeleteTrip}
        />

        <AddActivityModal 
           isOpen={isAddActivityOpen} 
           onClose={() => { setIsAddActivityOpen(false); setEditingActivity(null); }} 
           onSave={handleSaveActivity}
           onDelete={handleDeleteActivity}
           initialData={editingActivity}
        />

        <AddExpenseModal 
           isOpen={isAddExpenseOpen} 
           onClose={() => { setIsAddExpenseOpen(false); setEditingExpense(null); }} 
           trip={activeTrip} 
           onSave={handleSaveExpense} 
           onDelete={handleDeleteExpense}
           initialData={editingExpense}
        />
      </div>
    );
  }

  return null;
}

// --- Sub-Components ---

const ItineraryCard: React.FC<{ activity: Activity; onEdit: () => void }> = ({ activity, onEdit }) => {
  const Icon = ICONS[activity.icon] || MapPin;
  const controls = useDragControls();
  
  return (
    <Reorder.Item 
      value={activity} 
      dragListener={false}
      dragControls={controls}
      className="mb-3 relative"
      whileDrag={{ scale: 1.02, zIndex: 50 }}
    >
      <div 
        onClick={onEdit}
        className="glass-panel p-4 rounded-xl flex items-start gap-4 border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 mt-1 cursor-grab active:cursor-grabbing touch-none" onPointerDown={(e) => controls.start(e)}>
           <GripVertical size={16} className="text-zinc-600" />
           <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Icon size={24} /> 
           </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-white font-medium text-lg">{activity.name}</h4>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">{activity.startTime}</span>
          </div>
          <div className="text-sm text-zinc-500 mt-1 flex gap-3">
             <span>停留: {activity.duration}</span>
          </div>
          {activity.note && (
            <div className="mt-3 text-sm text-zinc-400 bg-zinc-900/50 p-2 rounded border-l-2 border-primary">
              {activity.note}
            </div>
          )}
          {activity.link && (
            <div className="flex justify-end mt-2">
              <a 
                href={activity.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                <Navigation size={12} />
                導航
              </a>
            </div>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
};

const TodoManager = ({ todos, onAdd, onToggle, onDelete }: { todos: Todo[], onAdd: (t: string) => void, onToggle: (id: string) => void, onDelete: (id: string) => void }) => {
   const [text, setText] = useState('');
   const incomplete = todos.filter(t => !t.completed);
   const complete = todos.filter(t => t.completed);

   return (
      <div className="flex-1 p-4 flex flex-col h-full pb-24">
         <h2 className="text-xl font-light text-white mb-4">待辦清單</h2>
         
         <div className="flex-1 overflow-y-auto space-y-2">
            {incomplete.map(todo => (
               <div key={todo.id} className="glass-panel p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => onToggle(todo.id)} className="text-zinc-500 hover:text-primary">
                     <Circle size={20} />
                  </button>
                  <span className="flex-1 text-white">{todo.text}</span>
                  <button onClick={() => onDelete(todo.id)} className="text-zinc-600 hover:text-red-400">
                     <Trash2 size={16} />
                  </button>
               </div>
            ))}
            
            {complete.length > 0 && (
               <>
                  <div className="h-[1px] bg-zinc-800 my-4" />
                  <p className="text-xs text-zinc-500 mb-2">已完成</p>
                  {complete.map(todo => (
                     <div key={todo.id} className="glass-panel p-3 rounded-xl flex items-center gap-3 opacity-50">
                        <button onClick={() => onToggle(todo.id)} className="text-emerald-500">
                           <CheckCircle size={20} />
                        </button>
                        <span className="flex-1 text-zinc-400 line-through">{todo.text}</span>
                        <button onClick={() => onDelete(todo.id)} className="text-zinc-600 hover:text-red-400">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  ))}
               </>
            )}
         </div>

         <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
            <input 
               className="flex-1 bg-zinc-800 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary"
               placeholder="輸入待辦事項..."
               value={text}
               onChange={e => setText(e.target.value)}
               onKeyDown={e => { if(e.key === 'Enter' && text) { onAdd(text); setText(''); }}}
            />
            <button 
               onClick={() => { if(text) { onAdd(text); setText(''); }}}
               className="bg-primary px-4 rounded-xl text-white font-medium"
            >
               確認
            </button>
         </div>
      </div>
   );
};

const ExpenseManager = ({ 
  trip, onAddExpense, onEditExpense, onAddMember, activeTripId, onOpenAdd
}: { 
  trip: Trip, onAddExpense: (d: any) => void, onEditExpense: (e: Expense) => void, onAddMember: (n: string, a: string) => void, activeTripId: string, onOpenAdd: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'STATS' | 'BALANCE'>('LIST');
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  
  const groupedExpenses = useMemo(() => {
    const grouped: Record<string, Expense[]> = {};
    trip.expenses.forEach(e => {
      const date = format(parseISO(e.date), 'yyyy-MM-dd');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(e);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [trip.expenses]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="p-4 pt-2 glass-panel-heavy z-20">
         {/* Member Avatars Header */}
         <div className="flex justify-between items-center mb-4">
            <div className="flex -space-x-3 overflow-hidden py-2 px-1">
               {trip.members.map((m, i) => (
                  <div key={m.id} className="relative z-0 hover:z-10 hover:scale-110 transition-transform">
                     <Avatar member={m} />
                  </div>
               ))}
               <button onClick={() => setIsMembersOpen(true)} className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 z-0">
                  <Plus size={16} />
               </button>
            </div>
         </div>

         <div className="flex gap-1 bg-zinc-900/80 p-1 rounded-xl">
          {['LIST', 'STATS', 'BALANCE'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'
              }`}
            >
              {tab === 'LIST' ? '清單' : tab === 'STATS' ? '統計' : '結算'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'LIST' && (
          <div className="space-y-6">
            {groupedExpenses.length === 0 && (
               <div className="text-center text-zinc-600 mt-20">尚無帳務紀錄。</div>
            )}
            {groupedExpenses.map(([date, expenses]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-3">
                   <div className="h-[1px] bg-zinc-800 flex-1"></div>
                   <span className="text-xs text-zinc-500 font-mono">{date}</span>
                   <div className="h-[1px] bg-zinc-800 flex-1"></div>
                </div>
                <div className="space-y-3">
                  {expenses.map(exp => {
                     const payer = trip.members.find(m => m.id === exp.payerId);
                     const amtInTWD = exp.amount * EXCHANGE_RATES[exp.currency as Currency];
                     return (
                      <div 
                        key={exp.id} 
                        onClick={() => onEditExpense(exp)}
                        className="glass-panel p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-zinc-800/50"
                      >
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-zinc-800 text-zinc-400 text-lg`}>
                               {exp.category === 'Food' ? '🍽️' : exp.category === 'Transport' ? '🚕' : exp.category === 'Accommodation' ? '🏨' : exp.category === 'Shopping' ? '🛍️' : '📝'}
                            </div>
                            <div>
                               <p className="text-base text-white">{exp.item}</p>
                               <div className="flex items-center gap-1 mt-1">
                                 <span className="text-xs text-zinc-500">付款人:</span>
                                 {payer && <Avatar member={payer} size="sm" />} 
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-white font-mono text-lg">{exp.amount} <span className="text-xs text-zinc-500">{exp.currency}</span></p>
                            {exp.currency !== 'TWD' && (
                               <p className="text-[10px] text-zinc-600">≈ {Math.round(amtInTWD)} TWD</p>
                            )}
                         </div>
                      </div>
                     );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'STATS' && <ExpenseStats trip={trip} />}
        {activeTab === 'BALANCE' && <ExpenseBalances trip={trip} />}
      </div>

      {activeTab === 'LIST' && (
         <button 
           onClick={onOpenAdd}
           className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white z-30"
         >
           <Plus size={28} />
         </button>
      )}

      <ManageMembersModal isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} trip={trip} onAddMember={onAddMember} />
    </div>
  );
};

// ... ExpenseStats and ExpenseBalances components reuse logic but translated ...
const ExpenseStats = ({ trip }: { trip: Trip }) => {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [currency, setCurrency] = useState<Currency>('TWD');

  const stats = useMemo(() => {
    const data: Record<string, number> = { Food: 0, Transport: 0, Accommodation: 0, Shopping: 0, Other: 0 };
    trip.expenses.forEach(exp => {
      const isRelevant = selectedMember === 'all' || (exp.splitDetails && exp.splitDetails[selectedMember] > 0);
      
      if (isRelevant) {
        let amount = exp.amount * EXCHANGE_RATES[exp.currency as Currency];
        if (selectedMember !== 'all') {
           amount = (exp.splitDetails[selectedMember] || 0) * EXCHANGE_RATES[exp.currency as Currency];
        }
        const displayAmount = amount / EXCHANGE_RATES[currency];
        data[exp.category] += displayAmount;
      }
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name: name === 'Food' ? '飲食' : name === 'Transport' ? '交通' : name === 'Accommodation' ? '住宿' : name === 'Shopping' ? '購物' : '其他', 
      value: Math.round(value) 
    }));
  }, [trip.expenses, selectedMember, currency]);

  const total = stats.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
             onClick={() => setSelectedMember('all')}
             className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                selectedMember === 'all' ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400'
             }`}
          >
             全員
          </button>
          {trip.members.map(m => (
             <button
               key={m.id}
               onClick={() => setSelectedMember(m.id)}
               className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  selectedMember === m.id ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400'
               }`}
             >
               {m.name}
             </button>
          ))}
       </div>

       <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
          <div>
             <p className="text-zinc-500 text-xs uppercase">總支出</p>
             <p className="text-3xl font-light text-white mt-1">{total.toLocaleString()}</p>
          </div>
          <button 
             onClick={() => {
                const curs: Currency[] = ['TWD', 'JPY', 'USD', 'EUR', 'KRW'];
                const idx = curs.indexOf(currency);
                setCurrency(curs[(idx + 1) % curs.length]);
             }}
             className="bg-zinc-800 px-3 py-1 rounded text-xs text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
          >
             {currency} ▼
          </button>
       </div>

       <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={stats}>
                <XAxis dataKey="name" tick={{fill: '#71717a', fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}}
                   itemStyle={{color: '#fff'}}
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AVATAR_COLORS[index % AVATAR_COLORS.length]} />
                  ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};

const ExpenseBalances = ({ trip }: { trip: Trip }) => {
   const balances = useMemo(() => {
      const net: Record<string, number> = {};
      trip.members.forEach(m => net[m.id] = 0);
      trip.expenses.forEach(exp => {
         const amountTWD = exp.amount * EXCHANGE_RATES[exp.currency as Currency];
         net[exp.payerId] += amountTWD;
         Object.entries(exp.splitDetails).forEach(([memberId, shareAmount]) => {
             const shareTWD = shareAmount * EXCHANGE_RATES[exp.currency as Currency];
             net[memberId] -= shareTWD;
         });
      });
      const debts: {from: string, to: string, amount: number}[] = [];
      const debtors = Object.entries(net).filter(([, val]) => val < -1).sort((a, b) => a[1] - b[1]);
      const creditors = Object.entries(net).filter(([, val]) => val > 1).sort((a, b) => b[1] - a[1]);
      let i = 0, j = 0;
      while (i < debtors.length && j < creditors.length) {
         const debtor = debtors[i];
         const creditor = creditors[j];
         const amount = Math.min(Math.abs(debtor[1]), creditor[1]);
         debts.push({ from: debtor[0], to: creditor[0], amount });
         debtor[1] += amount;
         creditor[1] -= amount;
         if (Math.abs(debtor[1]) < 1) i++;
         if (creditor[1] < 1) j++;
      }
      return debts;
   }, [trip]);

   return (
      <div className="space-y-4">
         <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-4">結算</h3>
         {balances.length === 0 && <p className="text-zinc-600 text-center">所有帳務已結清。</p>}
         {balances.map((debt, idx) => {
            const from = trip.members.find(m => m.id === debt.from);
            const to = trip.members.find(m => m.id === debt.to);
            return (
               <div key={idx} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Avatar member={from!} size="sm" />
                     <span className="text-xs text-zinc-500">給</span>
                     <Avatar member={to!} size="sm" />
                  </div>
                  <div className="text-right">
                     <p className="text-emerald-400 font-mono text-lg">{Math.round(debt.amount).toLocaleString()}</p>
                     <p className="text-xs text-zinc-500">TWD</p>
                  </div>
               </div>
            );
         })}
      </div>
   );
};

// --- Modals ---

const ProfileModal = ({ isOpen, onClose, profile, onSave }: any) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  
  // Sync state when profile changes
  useEffect(() => {
     if(isOpen) {
        setName(profile.name);
        setAvatar(profile.avatar);
     }
  }, [isOpen, profile]);

  return (
     <Modal isOpen={isOpen} onClose={onClose} title="編輯個人資料">
        <div className="p-4 space-y-6">
           <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-5xl border-2 border-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                 {avatar}
              </div>
           </div>
           
           <div>
              <p className="text-sm text-zinc-400 mb-2">選擇頭像</p>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto bg-zinc-800/50 p-2 rounded-xl">
                 {ANIMAL_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => setAvatar(emoji)} className={`text-2xl p-1 rounded hover:bg-zinc-700 ${avatar === emoji ? 'bg-zinc-700 ring-1 ring-primary' : ''}`}>
                       {emoji}
                    </button>
                 ))}
              </div>
           </div>

           <div>
              <p className="text-sm text-zinc-400 mb-2">名稱</p>
              <input className="w-full bg-zinc-800 p-3 rounded-lg text-white text-center" value={name} onChange={e => setName(e.target.value)} />
           </div>

           <button onClick={() => { onSave({name, avatar}); onClose(); }} className="w-full bg-primary py-3 rounded-xl text-white font-medium">儲存</button>
        </div>
     </Modal>
  );
};

const AddTripModal = ({ isOpen, onClose, onSave }: any) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [icon, setIcon] = useState<IconName>('Plane');

  const handleSave = () => {
    onSave({ name, location, startDate: start, endDate: end, icon });
    setName(''); setLocation(''); setStart(''); setEnd('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增旅程">
       <div className="space-y-4 p-4">
          <input className="w-full bg-zinc-800 p-3 rounded-lg text-white" placeholder="旅程名稱 (如: 暑假大阪行)" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-zinc-800 p-3 rounded-lg text-white" placeholder="地點 (如: 大阪)" value={location} onChange={e => setLocation(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="bg-zinc-800 p-3 rounded-lg text-white" value={start} onChange={e => setStart(e.target.value)} />
            <input type="date" className="bg-zinc-800 p-3 rounded-lg text-white" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <p className="text-sm text-zinc-400 mt-2">選擇圖示</p>
          <IconPicker selected={icon} onSelect={setIcon} />
          <button onClick={handleSave} className="w-full bg-primary py-3 rounded-xl text-white font-medium mt-4">建立旅程</button>
       </div>
    </Modal>
  );
};

const EditTripModal = ({ isOpen, onClose, trip, onSave, onDelete }: any) => {
   const [name, setName] = useState(trip?.name || '');
   const [icon, setIcon] = useState<IconName>(trip?.icon || 'Plane');

   useEffect(() => {
      if(trip) {
         setName(trip.name);
         setIcon(trip.icon);
      }
   }, [trip]);

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="設定旅程">
         <div className="space-y-4 p-4">
            <div>
               <p className="text-sm text-zinc-400 mb-2">旅程名稱</p>
               <input className="w-full bg-zinc-800 p-3 rounded-lg text-white" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
               <p className="text-sm text-zinc-400 mb-2">圖示</p>
               <IconPicker selected={icon} onSelect={setIcon} />
            </div>
            <button onClick={() => onSave({ name, icon })} className="w-full bg-primary py-3 rounded-xl text-white font-medium mt-4">儲存變更</button>
            <button onClick={onDelete} className="w-full bg-zinc-800 text-red-400 py-3 rounded-xl font-medium mt-2 hover:bg-red-900/20">刪除旅程</button>
         </div>
      </Modal>
   );
};

const AddActivityModal = ({ isOpen, onClose, onSave, onDelete, initialData }: any) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1h');
  const [note, setNote] = useState('');
  const [icon, setIcon] = useState<IconName>('MapPin');
  const [link, setLink] = useState('');

  useEffect(() => {
     if (initialData) {
        setName(initialData.name);
        setTime(initialData.startTime);
        setDuration(initialData.duration);
        setNote(initialData.note);
        setIcon(initialData.icon);
        setLink(initialData.link || '');
     } else {
        setName(''); setTime(''); setDuration('1h'); setNote(''); setIcon('MapPin'); setLink('');
     }
  }, [initialData, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "編輯行程" : "新增行程"}>
      <div className="space-y-4 p-4">
        <input className="w-full bg-zinc-800 p-3 rounded-lg text-white" placeholder="景點名稱" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input type="time" className="bg-zinc-800 p-3 rounded-lg text-white" value={time} onChange={e => setTime(e.target.value)} />
          <input className="bg-zinc-800 p-3 rounded-lg text-white" placeholder="停留時間 (如 2h)" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="flex gap-2 items-center bg-zinc-800 p-3 rounded-lg">
           <LinkIcon size={18} className="text-zinc-500" />
           <input className="flex-1 bg-transparent text-white outline-none text-sm" placeholder="導航連結 (Google Maps URL)" value={link} onChange={e => setLink(e.target.value)} />
        </div>
        <textarea className="w-full bg-zinc-800 p-3 rounded-lg text-white h-24 resize-none" placeholder="筆記..." value={note} onChange={e => setNote(e.target.value)} />
        <p className="text-sm text-zinc-400">選擇圖示</p>
        <IconPicker selected={icon} onSelect={setIcon} />
        
        <div className="flex gap-2 mt-4">
           {initialData && (
              <button onClick={() => onDelete(initialData.id)} className="flex-1 bg-zinc-800 text-red-400 py-3 rounded-xl font-medium hover:bg-red-900/20">刪除</button>
           )}
           <button onClick={() => onSave({ name, startTime: time, duration, note, icon, link })} className="flex-[2] bg-primary py-3 rounded-xl text-white font-medium">儲存</button>
        </div>
      </div>
    </Modal>
  );
};

const AddExpenseModal = ({ isOpen, onClose, trip, onSave, onDelete, initialData }: any) => {
   const [item, setItem] = useState('');
   const [amount, setAmount] = useState('');
   const [currency, setCurrency] = useState<Currency>(() => {
      // Default to saved or TWD
      return (localStorage.getItem('luxe_last_currency') as Currency) || 'TWD';
   });
   const [payer, setPayer] = useState('');
   const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
   const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

   useEffect(() => {
      if (initialData) {
         setItem(initialData.item);
         setAmount(initialData.amount.toString());
         setCurrency(initialData.currency);
         setPayer(initialData.payerId);
         const members = Object.keys(initialData.splitDetails);
         setSelectedMembers(members);
         
         // Reconstruct custom splits for UI
         const custom: Record<string, string> = {};
         Object.entries(initialData.splitDetails).forEach(([id, val]) => {
            // This is a simplification. Real custom values might be hard to distinguish from equal splits perfectly without extra data.
            // But for UI editing, we can just pre-fill.
            custom[id] = val.toString();
         });
         setCustomSplits(custom);

      } else {
         setItem(''); setAmount(''); 
         // Currency set in initializer
         setPayer(trip.members[0]?.id || '');
         setSelectedMembers(trip.members.map(m => m.id));
         setCustomSplits({});
      }
   }, [initialData, isOpen, trip]);

   const handleSave = () => {
      const numAmount = parseFloat(amount);
      if (!item || isNaN(numAmount)) return;

      const splitDetails: Record<string, number> = {};
      
      // Calculate manual sum
      let manualSum = 0;
      const autoMembers: string[] = [];

      selectedMembers.forEach(id => {
         const val = customSplits[id] ? parseFloat(customSplits[id]) : NaN;
         if (!isNaN(val) && customSplits[id] !== '') {
            splitDetails[id] = val;
            manualSum += val;
         } else {
            autoMembers.push(id);
         }
      });

      const remaining = numAmount - manualSum;

      if (autoMembers.length > 0) {
         const share = remaining / autoMembers.length;
         autoMembers.forEach(id => {
             splitDetails[id] = share;
         });
      }

      onSave({ item, amount: numAmount, currency, payerId: payer, splitDetails });
   };

   // Calculate TWD instantly
   const twdVal = amount ? (parseFloat(amount) * EXCHANGE_RATES[currency]).toFixed(0) : '0';

   return (
      <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "編輯帳務" : "新增帳務"}>
         <div className="space-y-4 p-4">
            
            {/* Amount at Top */}
            <div className="flex flex-col items-center justify-center py-4 bg-zinc-800/30 rounded-xl mb-2">
               <div className="flex items-baseline gap-2">
                  <input 
                     type="number" 
                     className="bg-transparent text-4xl text-white text-center w-40 outline-none font-light placeholder-zinc-600" 
                     placeholder="0" 
                     value={amount} 
                     onChange={e => setAmount(e.target.value)} 
                     autoFocus
                  />
                  <select className="bg-transparent text-xl text-primary font-medium outline-none" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                     {Object.keys(EXCHANGE_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               {currency !== 'TWD' && (
                  <p className="text-zinc-500 text-sm mt-1">≈ {twdVal} TWD</p>
               )}
            </div>

            <input className="w-full bg-zinc-800 p-3 rounded-lg text-white" placeholder="品項名稱" value={item} onChange={e => setItem(e.target.value)} />
            
            <div className="space-y-2">
               <p className="text-xs text-zinc-500 uppercase">付款人</p>
               <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {trip.members.map(m => (
                     <div key={m.id} onClick={() => setPayer(m.id)} className={`flex flex-col items-center gap-1 min-w-[50px] cursor-pointer transition-all ${payer === m.id ? 'scale-110' : 'opacity-60'}`}>
                        <div className={`rounded-full p-0.5 ${payer === m.id ? 'bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-transparent'}`}>
                           <Avatar member={m} />
                        </div>
                        <span className={`text-[10px] ${payer === m.id ? 'text-primary' : 'text-zinc-500'}`}>{m.name}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <p className="text-xs text-zinc-500 uppercase">分帳成員 (可手動輸入金額)</p>
               </div>
               <div className="max-h-56 overflow-y-auto space-y-2 bg-zinc-800/30 p-2 rounded-xl">
                  {trip.members.map(m => {
                     const isSelected = selectedMembers.includes(m.id);
                     return (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50">
                           <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => {
                              if (isSelected) setSelectedMembers(prev => prev.filter(id => id !== m.id));
                              else setSelectedMembers(prev => [...prev, m.id]);
                           }}>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-zinc-600'}`}>
                                 {isSelected && <Check size={12} className="text-white" />}
                              </div>
                              <Avatar member={m} size="sm" />
                              <span className="text-sm text-zinc-300">{m.name}</span>
                           </div>
                           
                           {isSelected && (
                              <input 
                                 type="number"
                                 placeholder="平分"
                                 className="w-20 bg-zinc-900 border border-zinc-700 rounded p-1 text-right text-sm text-white focus:border-primary outline-none"
                                 value={customSplits[m.id] || ''}
                                 onChange={e => setCustomSplits({...customSplits, [m.id]: e.target.value})}
                              />
                           )}
                        </div>
                     )
                  })}
               </div>
               <p className="text-[10px] text-zinc-500 text-right mt-1">留空則自動平分剩餘金額</p>
            </div>

            <div className="flex gap-2 mt-4">
               {initialData && (
                  <button onClick={() => onDelete(initialData.id)} className="flex-1 bg-zinc-800 text-red-400 py-3 rounded-xl font-medium hover:bg-red-900/20">刪除</button>
               )}
               <button onClick={handleSave} className="flex-[2] bg-emerald-600 py-3 rounded-xl text-white font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {initialData ? "儲存" : "新增"}
               </button>
            </div>
         </div>
      </Modal>
   );
};

const ManageMembersModal = ({ isOpen, onClose, trip, onAddMember }: any) => {
   const [name, setName] = useState('');
   const [avatar, setAvatar] = useState('');
   
   // Filter available avatars (exclude used ones)
   const usedAvatars = useMemo(() => new Set(trip.members.map((m: Member) => m.avatar)), [trip.members]);
   const availableAvatars = useMemo(() => ANIMAL_EMOJIS.filter(e => !usedAvatars.has(e)), [usedAvatars]);
   
   // Set initial available avatar
   useEffect(() => {
      if (isOpen && availableAvatars.length > 0 && !avatar) {
         setAvatar(availableAvatars[0]);
      }
   }, [isOpen, availableAvatars, avatar]);

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="旅伴管理">
         <div className="p-4 space-y-6">
            <div className="space-y-3">
               {trip.members.map((m: Member) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                     <Avatar member={m} />
                     <span className="text-white flex-1">{m.name}</span>
                     {m.id === 'me' && <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">管理員</span>}
                  </div>
               ))}
            </div>

            <div className="pt-4 border-t border-zinc-800">
               <p className="text-sm text-zinc-400 mb-3">新增成員</p>
               <div className="flex gap-3 items-start">
                   {/* Avatar Selector */}
                   <div className="flex-shrink-0 relative group">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl cursor-pointer">
                         {avatar}
                      </div>
                      <div className="absolute top-14 left-0 w-64 bg-zinc-900 border border-zinc-800 p-2 rounded-xl shadow-xl z-50 grid grid-cols-6 gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity max-h-48 overflow-y-auto">
                          {availableAvatars.map(e => (
                             <button key={e} onClick={() => setAvatar(e)} className="hover:bg-zinc-700 rounded p-1 text-lg">{e}</button>
                          ))}
                      </div>
                   </div>
                   
                   <div className="flex-1 flex gap-2">
                     <input className="flex-1 bg-zinc-800 p-3 rounded-xl text-white outline-none" placeholder="名稱" value={name} onChange={e => setName(e.target.value)} />
                     <button onClick={() => { if(name && avatar) { onAddMember(name, avatar); setName(''); } }} className="bg-zinc-700 px-4 rounded-xl text-white hover:bg-zinc-600 disabled:opacity-50" disabled={!name || !avatar}>新增</button>
                   </div>
               </div>
            </div>
         </div>
      </Modal>
   );
};
