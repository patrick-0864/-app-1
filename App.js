import React, { useState, useEffect, useMemo } from 'react';

import { initializeApp } from 'firebase/app';

import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';

import { 

  MapPin, 

  Navigation, 

  Calendar, 

  CreditCard, 

  Info, 

  Phone, 

  Train, 

  Utensils, 

  ShoppingBag, 

  Sun, 

  CloudRain, 

  Cloud,

  Trash2,

  Plus,

  ChevronRight,

  Globe,

  Languages,

  Anchor,

  Camera,

  Map as MapIcon

} from 'lucide-react';



// --- Firebase Configuration ---

const firebaseConfig = JSON.parse(__firebase_config || '{}');

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);



// --- Styles & Constants ---

const THEME = {

  bg: "bg-[#F9F8F6]", 

  card: "bg-white",

  textMain: "text-[#2C2C2C]",

  textSub: "text-[#8E8E93]",

  accent: "text-[#C14444]", 

  line: "border-[#E5E5EA]",

};



// Mock Data from PDF

// Update: Added 'image' property with high-quality Unsplash URLs

const ITINERARY = [

  {

    id: 1,

    day: "Sat",

    date: "14",

    month: "SEP",

    title: "東京到着",

    subtitle: "六本木藝術三角漫遊",

    weather: { code: 'sunny', high: 26, low: 20, hourly: [22, 24, 26, 25, 23] },

    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop", // Tokyo Tower / City

    events: [

      { time: "12:00", type: "flight", title: "抵達東京成田機場 (NRT)", subtitle: "入境手續 • 領取行李", note: "建議預留 60-90 分鐘通關" },

      { time: "13:00", type: "transport", title: "前往六本木", subtitle: "京成成田 SKY ACCESS", note: "往「西馬込/羽田」方向 → 大門站轉乘大江戶線", price: "¥1,480", nav: "六本木駅" },

      { time: "15:00", type: "hotel", title: "Check-in: 六本木飯店", subtitle: "辦理入住", note: "寄放行李後輕裝出門", nav: "六本木駅" },

      { 

        time: "16:00", 

        type: "sightseeing", 

        title: "六本木之丘", 

        subtitle: "Mori Art Museum & City View", 

        note: "東京鐵塔最佳拍攝點", 

        highlight: true,

        nav: "六本木ヒルズ",

        jpText: "展望台のチケット売り場はどこですか？"

      },

      { 

        time: "19:00", 

        type: "food", 

        title: "晚餐：六本木周邊", 

        subtitle: "居酒屋 / 西式料理", 

        note: "推薦前往「西麻布」區域覓食", 

        nav: "西麻布 交差点",

        jpText: "おすすめのメニューは何ですか？" 

      }

    ]

  },

  {

    id: 2,

    day: "Sun",

    date: "15",

    month: "SEP",

    title: "箱根・熱海",

    subtitle: "黃金環線與海上花火",

    weather: { code: 'cloudy', high: 24, low: 19, hourly: [20, 21, 23, 24, 22] },

    image: "https://images.unsplash.com/photo-1576675784201-1e711b26466f?q=80&w=1000&auto=format&fit=crop", // Hakone Shrine

    warning: "國定假日人多，請務必提早出發",

    events: [

      { time: "07:00", type: "transport", title: "移動至箱根", subtitle: "六本木 → 新宿 → 小田原", note: "避開人潮，越早越好", nav: "小田原駅" },

      { 

        time: "09:00", 

        type: "ticket", 

        title: "購買周遊券 & 寄物", 

        subtitle: "小田原站", 

        note: "買「箱根周遊券(小田原版)」¥5,000。行李寄放箱根湯本。", 

        highlight: true,

        jpText: "箱根フリーパス（小田原発）をください。",

        nav: "小田原駅"

      },

      { time: "09:30", type: "sightseeing", title: "雕刻之森美術館", subtitle: "戶外藝術", note: "憑周遊券折價 ¥100", nav: "箱根 彫刻の森美術館" },

      { time: "13:00", type: "sightseeing", title: "箱根海賊觀光船", subtitle: "桃源台港 → 元箱根港", note: "欣賞蘆之湖風光", nav: "桃源台港" },

      { time: "14:30", type: "sightseeing", title: "箱根神社", subtitle: "水中鳥居", note: "人氣打卡點，排隊需時", nav: "箱根神社", highlight: true },

      { time: "18:30", type: "transport", title: "前往熱海", subtitle: "JR 東海道本線", note: "取行李後移動", nav: "熱海駅" },

      { 

        time: "20:20", 

        type: "activity", 

        title: "熱海海上花火大會", 

        subtitle: "熱海陽光海灘", 

        note: "20分鐘的璀璨煙火，請提早佔位", 

        highlight: true, 

        nav: "熱海サンビーチ",

        jpText: "花火が見える場所はどこですか？"

      }

    ]

  },

  {

    id: 3,

    day: "Mon",

    date: "16",

    month: "SEP",

    title: "三島・伊豆",

    subtitle: "天空步道與富士絕景",

    weather: { code: 'sunny', high: 25, low: 18, hourly: [19, 22, 25, 24, 21] },

    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=1000&auto=format&fit=crop", // Mt Fuji

    events: [

      { 

        time: "09:00", 

        type: "activity", 

        title: "三島天空步道", 

        subtitle: "Mishima Skywalk", 

        note: "日本最長吊橋，體驗高空滑索", 

        highlight: true,

        nav: "三島スカイウォーク",

        jpText: "ロングジップスライドのチケットをください。"

      },

      { time: "12:30", type: "food", title: "午餐：三島鰻魚飯", subtitle: "三島駅周邊", note: "三島名物，水質好鰻魚無土味", nav: "三島駅 うなぎ" },

      { 

        time: "14:45", 

        type: "sightseeing", 

        title: "伊豆全景公園", 

        subtitle: "碧テラス (Ao Terrace)", 

        note: "網美必拍，俯瞰駿河灣", 

        highlight: true,

        nav: "伊豆パノラマパーク"

      }

    ]

  },

  {

    id: 4,

    day: "Tue",

    date: "17",

    month: "SEP",

    title: "伊豆高原",

    subtitle: "大室山與溫泉旅館",

    weather: { code: 'cloudy', high: 23, low: 19, hourly: [20, 22, 23, 22, 20] },

    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000&auto=format&fit=crop", // Green nature

    events: [

      { time: "09:00", type: "transport", title: "前往伊東", subtitle: "寄放行李", note: "購買「伊東觀光一日券」¥1,300", nav: "伊東駅" },

      { 

        time: "10:30", 

        type: "sightseeing", 

        title: "大室山", 

        subtitle: "抹茶布丁山", 

        note: "搭纜車登頂，火山口散步", 

        highlight: true,

        nav: "大室山",

        jpText: "リフト券を大人2枚ください。"

      },

      { time: "12:30", type: "food", title: "午餐：大室軽食堂", subtitle: "山腳下", note: "當地食材定食", nav: "大室軽食堂" },

      { 

        time: "16:00", 

        type: "hotel", 

        title: "Check-in: 界 Anjin", 

        subtitle: "星野集團", 

        note: "全客室海景，體驗航海主題", 

        highlight: true,

        nav: "星野リゾート 界 アンジン"

      }

    ]

  },

  {

    id: 5,

    day: "Wed",

    date: "18",

    month: "SEP",

    title: "返回東京",

    subtitle: "海景列車與新宿之夜",

    weather: { code: 'rain', high: 22, low: 18, hourly: [19, 20, 22, 21, 20] },

    image: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1000&auto=format&fit=crop", // Shinjuku Night

    events: [

      { time: "11:00", type: "relax", title: "飯店悠閒時光", subtitle: "界 Anjin", note: "享受最後的溫泉與海景" },

      { 

        time: "13:00", 

        type: "transport", 

        title: "特急 踊り子号", 

        subtitle: "伊東 → 新宿", 

        note: "直達新宿，無需轉車", 

        nav: "新宿駅"

      },

      { time: "16:00", type: "sightseeing", title: "新宿御苑 / 東京都廳", subtitle: "都市散策", note: "視天氣決定", nav: "新宿御苑" },

      { 

        time: "19:00", 

        type: "food", 

        title: "晚餐：思出横丁", 

        subtitle: "新宿西口", 

        note: "體驗昭和風情串燒街", 

        highlight: true,

        nav: "思い出横丁",

        jpText: "おまかせの焼き鳥をください。"

      }

    ]

  },

  {

    id: 6,

    day: "Thu",

    date: "19",

    month: "SEP",

    title: "歸途",

    subtitle: "最後採購 & 機場",

    weather: { code: 'sunny', high: 27, low: 22, hourly: [23, 25, 27, 26, 24] },

    image: "https://images.unsplash.com/photo-1565626424178-c699f660d2b7?q=80&w=1000&auto=format&fit=crop", // Japan Street/Shopping

    events: [

      { time: "10:00", type: "shopping", title: "新宿購物", subtitle: "伊勢丹 / 高島屋", note: "伴手禮採購", nav: "伊勢丹 新宿店" },

      { time: "13:00", type: "transport", title: "前往成田機場", subtitle: "N'EX 成田特快", note: "約 90 分鐘", nav: "成田空港" },

      { time: "16:00", type: "flight", title: "航班報到", subtitle: "回程", note: "Safe flight!" }

    ]

  }

];



// --- Helpers ---

const getWeatherIcon = (code, className) => {

  if (code === 'sunny') return <Sun className={className} />;

  if (code === 'cloudy') return <Cloud className={className} />;

  if (code === 'rain') return <CloudRain className={className} />;

  return <Sun className={className} />;

};



const getEventIcon = (type) => {

  switch (type) {

    case 'flight': return <Globe size={18} />;

    case 'transport': return <Train size={18} />;

    case 'hotel': return <Navigation size={18} />;

    case 'food': return <Utensils size={18} />;

    case 'sightseeing': return <Camera size={18} />;

    case 'shopping': return <ShoppingBag size={18} />;

    case 'ticket': return <CreditCard size={18} />;

    case 'activity': return <Anchor size={18} />;

    default: return <Info size={18} />;

  }

};



// --- Components ---



// 1. Date Selector

const DateSelector = ({ days, activeDayId, onSelect }) => {

  return (

    <div className="sticky top-0 z-20 bg-[#F9F8F6]/95 backdrop-blur-sm border-b border-gray-200/50 pb-2 pt-safe-top">

      <div className="flex justify-between items-center px-4 py-2">

        <span className="text-xs font-serif tracking-widest text-gray-500 uppercase">Family Trip</span>

        <span className="text-xs font-serif font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-600">2024</span>

      </div>

      <div className="flex overflow-x-auto px-4 gap-6 no-scrollbar snap-x pb-2">

        {days.map((d) => {

          const isActive = d.id === activeDayId;

          return (

            <button

              key={d.id}

              onClick={() => onSelect(d.id)}

              className={`flex flex-col items-center min-w-[3rem] transition-all duration-300 snap-center ${

                isActive ? "opacity-100 scale-105" : "opacity-40"

              }`}

            >

              <span className="text-[10px] font-bold tracking-widest uppercase mb-1">{d.day}</span>

              <span className={`text-2xl font-serif leading-none ${isActive ? "text-black font-semibold" : "text-gray-500"}`}>

                {d.date}

              </span>

            </button>

          );

        })}

      </div>

    </div>

  );

};



// 2. Point & Speak Modal

const PointAndSpeakModal = ({ text, onClose }) => (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>

    <div className="bg-white p-8 rounded-none w-[90%] max-w-sm text-center relative shadow-2xl">

      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50"></div>

      <p className="text-xs text-gray-400 tracking-widest uppercase mb-6">Point & Speak</p>

      <h3 className="text-3xl font-serif font-bold text-gray-900 leading-normal mb-8">

        {text}

      </h3>

      <p className="text-sm text-gray-500">Tap to close</p>

    </div>

  </div>

);



// 3. Event Card

const EventCard = ({ event, isFirst, isLast }) => {

  const [showPointSpeak, setShowPointSpeak] = useState(false);



  return (

    <div className="flex relative group">

      {/* Timeline Line */}

      <div className="flex flex-col items-center mr-4 w-12 flex-shrink-0 pt-1">

        <span className="text-xs font-mono text-gray-500 font-medium mb-1">{event.time}</span>

        <div className={`w-[1px] flex-grow ${isLast ? 'bg-transparent' : 'bg-gray-200'}`}></div>

      </div>



      {/* Content */}

      <div className={`flex-grow pb-8 relative ${isLast ? '' : ''}`}>

        {/* Dot on Timeline */}

        <div className={`absolute left-[-2.05rem] top-[0.4rem] w-2.5 h-2.5 rounded-full border-2 border-[#F9F8F6] z-10 

          ${event.highlight ? 'bg-[#C14444]' : 'bg-gray-300'}`}></div>



        {/* Card Body */}

        <div className="bg-white rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-transform active:scale-[0.99]">

          

          {/* Header */}

          <div className="flex justify-between items-start mb-2">

            <div className="flex items-center gap-2">

              <span className={`p-1.5 rounded-full ${event.highlight ? 'bg-red-50 text-[#C14444]' : 'bg-gray-50 text-gray-500'}`}>

                {getEventIcon(event.type)}

              </span>

              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{event.type}</span>

            </div>

          </div>



          {/* Title & Info */}

          <h3 className="text-lg font-serif font-bold text-[#2C2C2C] mb-1">{event.title}</h3>

          <p className="text-sm font-medium text-gray-600 mb-2">{event.subtitle}</p>

          

          <div className="text-xs text-gray-500 leading-relaxed bg-[#F9F8F6] p-2.5 rounded border border-gray-100/50">

            {event.note}

          </div>



          {/* Actions - Explicit Navigation Button */}

          <div className="flex gap-2 mt-4">

             {/* Navigation Button */}

             {event.nav && (

              <a 

                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.nav)}`}

                target="_blank"

                rel="noreferrer"

                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[10px] tracking-wide font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors shadow-sm flex-1 justify-center"

              >

                <MapPin size={12} /> Google Maps 導航

              </a>

            )}



             {/* Point & Speak Button */}

             {event.jpText && (

              <button 

                onClick={() => setShowPointSpeak(true)}

                className="flex items-center gap-1.5 px-3 py-2 bg-[#2C2C2C] text-white text-[10px] tracking-wide font-bold uppercase rounded-sm hover:bg-black transition-colors shadow-sm flex-1 justify-center"

              >

                <Languages size={12} /> 日文溝通卡

              </button>

            )}

            

            {event.price && !event.nav && !event.jpText && (

               <div className="px-3 py-2 border border-gray-200 text-gray-500 text-[10px] font-mono rounded-sm">

                 {event.price}

               </div>

            )}

          </div>

        </div>

      </div>



      {showPointSpeak && <PointAndSpeakModal text={event.jpText} onClose={() => setShowPointSpeak(false)} />}

    </div>

  );

};



// 4. Budget Component

const BudgetTracker = ({ user }) => {

  const [items, setItems] = useState([]);

  const [desc, setDesc] = useState('');

  const [amount, setAmount] = useState('');

  const [isAdding, setIsAdding] = useState(false);



  useEffect(() => {

    if (!user) return;

    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'budget_items'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => console.error(err));

  }, [user]);



  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);



  const handleAdd = async (e) => {

    e.preventDefault();

    if(!desc || !amount) return;

    setIsAdding(true);

    try {

      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'budget_items'), {

        desc, amount: Number(amount), createdAt: Timestamp.now()

      });

      setDesc(''); setAmount('');

    } finally { setIsAdding(false); }

  };



  const handleDelete = async(id) => {

    if(confirm('Delete?')) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budget_items', id));

  }



  return (

    <div className="p-4 pb-24 animate-fade-in">

      <div className="bg-[#2C2C2C] text-white p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden">

        <div className="relative z-10 text-center">

          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mb-2">Total Expenses</p>

          <h2 className="text-4xl font-serif font-medium">¥ {total.toLocaleString()}</h2>

        </div>

        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gray-700 rounded-full opacity-30 blur-2xl"></div>

      </div>



      <form onSubmit={handleAdd} className="mb-8">

        <div className="flex gap-2 mb-2">

          <input 

            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"

            placeholder="Item (e.g. Ramen)"

            value={desc}

            onChange={e => setDesc(e.target.value)}

          />

          <div className="relative w-28">

             <span className="absolute left-3 top-3 text-gray-400 text-sm">¥</span>

             <input 

              type="number"

              className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-gray-400"

              placeholder="0"

              value={amount}

              onChange={e => setAmount(e.target.value)}

            />

          </div>

        </div>

        <button 

          disabled={isAdding}

          className="w-full bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"

        >

          {isAdding ? 'Saving...' : '+ Add Expense'}

        </button>

      </form>



      <div className="space-y-3">

        {items.map(item => (

          <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">

            <div>

              <p className="font-medium text-gray-800">{item.desc}</p>

              <p className="text-[10px] text-gray-400 mt-0.5">{item.createdAt?.toDate().toLocaleDateString()}</p>

            </div>

            <div className="flex items-center gap-4">

              <span className="font-mono text-gray-600">¥{item.amount.toLocaleString()}</span>

              <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={16} /></button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};



// 5. Info/Tools Tab

const InfoTab = () => {

  const EMERGENCY = [

    { label: "Police", val: "110", icon: <Phone size={16} /> },

    { label: "Ambulance", val: "119", icon: <Plus size={16} /> },

    { label: "Tourist Hotline", val: "050-3816-2787", icon: <Globe size={16} /> },

  ];



  const CARDS = [

    { jp: "ここへ行ってください", en: "Please take me here", role: "To Driver" },

    { jp: "カードは使えますか？", en: "Can I use credit card?", role: "Payment" },

    { jp: "お会計をお願いします", en: "Check, please", role: "Restaurant" },

  ];



  return (

    <div className="p-4 pb-24 space-y-8 animate-fade-in">

      {/* Visit Japan Web */}

      <a 

        href="https://vjw-lp.digital.go.jp/en/" 

        target="_blank" 

        rel="noreferrer"

        className="block bg-[#C14444] text-white p-6 rounded-xl shadow-lg relative overflow-hidden group"

      >

        <div className="relative z-10 flex justify-between items-center">

          <div>

            <p className="text-xs font-bold tracking-widest opacity-80 mb-1">MUST HAVE</p>

            <h3 className="text-xl font-serif font-bold">Visit Japan Web</h3>

            <p className="text-xs opacity-90 mt-2">Immigration & Customs QR Code</p>

          </div>

          <ChevronRight className="group-hover:translate-x-1 transition-transform" />

        </div>

        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>

      </a>



      {/* Emergency */}

      <div>

        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Emergency</h3>

        <div className="grid grid-cols-2 gap-3">

          {EMERGENCY.map((e, i) => (

            <a key={i} href={`tel:${e.val}`} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-red-200 transition-colors">

              <div className="text-[#C14444] mb-2">{e.icon}</div>

              <span className="text-lg font-bold text-gray-800">{e.val}</span>

              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{e.label}</span>

            </a>

          ))}

        </div>

      </div>



      {/* Translation Cards */}

      <div>

        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Communication Cards</h3>

        <div className="space-y-3">

          {CARDS.map((c, i) => (

            <div key={i} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">

              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{c.role}</p>

              <p className="text-xl font-serif font-bold text-gray-900 mb-1">{c.jp}</p>

              <p className="text-sm text-gray-500 italic">{c.en}</p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};



// --- Main App ---

export default function JapanZenApp() {

  const [activeDayId, setActiveDayId] = useState(1);

  const [tab, setTab] = useState('trip'); // trip, budget, tools

  const [user, setUser] = useState(null);



  const activeDay = useMemo(() => ITINERARY.find(d => d.id === activeDayId), [activeDayId]);



  // Auth Init

  useEffect(() => {

    const init = async () => {

      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {

        await signInWithCustomToken(auth, __initial_auth_token);

      } else {

        await signInAnonymously(auth);

      }

    };

    init();

    return onAuthStateChanged(auth, setUser);

  }, []);



  // Bottom Floating Bar Logic

  const nextEvent = useMemo(() => {

    if(!activeDay) return null;

    return activeDay.events[0];

  }, [activeDay]);



  return (

    <div className={`min-h-screen ${THEME.bg} font-sans text-[#2C2C2C] pb-safe`}>

      

      {/* View Controller */}

      {tab === 'trip' && (

        <>

          <DateSelector days={ITINERARY} activeDayId={activeDayId} onSelect={setActiveDayId} />

          

          <main className="animate-fade-in pb-32">

            {/* Hero Section with Dynamic Image */}

            <div className="relative h-48 mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg bg-gray-900 group">

              {/* Background Image */}

              <img 

                src={activeDay.image} 

                alt={activeDay.title}

                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"

              />

              {/* Dark Gradient Overlay for Text Readability */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              

              {/* Content */}

              <div className="relative z-10 h-full p-6 flex flex-col justify-end text-white">

                 <div className="absolute top-4 right-4 flex flex-col items-end">

                  <div className="flex items-center gap-2">

                    <span className="text-2xl font-light">{activeDay.weather.high}°</span>

                    {getWeatherIcon(activeDay.weather.code, "w-6 h-6")}

                  </div>

                  <div className="flex gap-2 mt-2 text-[10px] opacity-70">

                     {activeDay.weather.hourly.map((t, i) => (

                       <div key={i} className="flex flex-col items-center">

                         <span>{i*3+9}:00</span>

                         <span>{t}°</span>

                       </div>

                     ))}

                  </div>

                </div>

                

                <p className="text-xs font-bold opacity-80 uppercase tracking-[0.2em] mb-1 text-white/90">Day {activeDay.id}</p>

                <h2 className="text-3xl font-serif font-bold mb-1">{activeDay.title}</h2>

                <p className="text-sm opacity-90 font-light">{activeDay.subtitle}</p>

              </div>

            </div>

            

            {activeDay.warning && (

              <div className="mx-4 mt-4 bg-orange-50 border border-orange-100 p-3 rounded-lg flex gap-3 items-center">

                <Info className="text-orange-400 shrink-0" size={16} />

                <p className="text-xs text-orange-800">{activeDay.warning}</p>

              </div>

            )}



            {/* Timeline */}

            <div className="px-4 py-8">

              {activeDay.events.map((event, idx) => (

                <EventCard 

                  key={idx} 

                  event={event} 

                  isFirst={idx === 0}

                  isLast={idx === activeDay.events.length - 1} 

                />

              ))}

            </div>

          </main>



          {/* Floating Bottom Info Bar */}

          <div className="fixed bottom-20 left-4 right-4 z-30">

             <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">

                    <Navigation size={14} />

                  </div>

                  <div className="flex flex-col">

                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Next Stop</span>

                    <span className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{nextEvent?.title}</span>

                  </div>

                </div>

                

                {nextEvent?.nav && (

                   <a 

                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextEvent.nav)}`}

                    className="bg-[#2C2C2C] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wide hover:bg-black transition-colors"

                  >

                    NAVIGATE

                  </a>

                )}

             </div>

          </div>

        </>

      )}



      {tab === 'budget' && <BudgetTracker user={user} />}

      {tab === 'tools' && <InfoTab />}



      {/* Bottom Tab Bar */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe-offset pt-2 px-6 z-40 flex justify-between items-center h-[3.5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">

        <NavButton active={tab === 'trip'} onClick={() => setTab('trip')} icon={Calendar} label="TRIP" />

        <NavButton active={tab === 'budget'} onClick={() => setTab('budget')} icon={CreditCard} label="WALLET" />

        <NavButton active={tab === 'tools'} onClick={() => setTab('tools')} icon={Info} label="GUIDE" />

      </div>

    </div>

  );

}



const NavButton = ({ active, onClick, icon: Icon, label }) => (

  <button 

    onClick={onClick}

    className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${active ? 'text-[#2C2C2C]' : 'text-gray-300 hover:text-gray-400'}`}

  >

    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110 mb-1' : 'mb-1'} />

    <span className="text-[9px] font-bold tracking-widest">{label}</span>

  </button>

);
