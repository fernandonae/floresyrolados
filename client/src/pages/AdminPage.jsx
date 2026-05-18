import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getOrdersRequest, deleteOrderRequest } from "../api/orders"; 
import { getUsersRequest, updateUserStatusRequest, deleteUserRequest } from "../api/user"; 
import { getCouponsRequest, createCouponRequest, deleteCouponRequest } from "../api/coupons";
import { FiTag, FiBell, FiClock } from "react-icons/fi";

import { useProducts } from "../context/ProductContext"; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  FiCheck, FiX, FiVideo, FiFileText, FiMap, FiUsers, 
  FiPlus, FiPackage, FiImage, FiChevronRight, FiSearch, FiTrash2
} from "react-icons/fi";
import io from "socket.io-client"; // Asegúrate de tener instalado socket.io-client

// --- CONFIGURACIÓN DE ICONOS ---
const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Icono para el repartidor en tiempo real
const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const API_URL = "https://floresyrolados.onrender.com"; 
const socket = io(API_URL);

const categorias = ["Flores", "Extractos", "Comestibles THC", "Pods", "CBD", "Accesorios", "Quimicos", "psocodelicos"];

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && lat !== 0) {
      map.setView([lat, lng], 16, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

function AdminPage() {
  const [tab, setTab] = useState("mapa");
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [deliveryLocations, setDeliveryLocations] = useState({}); // Para GPS en vivo
  const [coupons, setCoupons] = useState([]);
  const [gpsAlerts, setGpsAlerts] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", maxUses: "", expiresAt: "" }); 

  const { createProduct, deleteProduct, getProducts, products } = useProducts();

const [newProduct, setNewProduct] = useState({
  name: "", 
  description: "", 
  price: "", 
  category: categorias[0], // <--- Ahora iniciará con "Flores"
  stock: "", 
  image: ""
});

  const loadData = async () => {
  try {
    const resOrders = await getOrdersRequest();
    setOrders(resOrders.data);
    const resUsers = await getUsersRequest();
    setAllUsers(resUsers.data);
    const resCoupons = await getCouponsRequest();  
    setCoupons(resCoupons.data);
    await getProducts(); // 👈 agrega esta línea
  } catch (error) {
    console.error("Error en carga:", error);
  }
};

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); 

    // ESCUCHAR UBICACIÓN DEL REPARTIDOR EN TIEMPO REAL
    socket.on("admin:actualizar-mapa", (data) => {
      setDeliveryLocations(prev => ({
        ...prev,
        [data.orderId]: { lat: data.lat, lng: data.lng }
      }));
    });

    socket.on("admin:alerta-gps", (data) => {
    setGpsAlerts(prev => [...prev, { ...data, id: Date.now() }]);
    setTimeout(() => {
    setGpsAlerts(prev => prev.filter(a => a.id !== Date.now()));
    }, 8000);
});

    return () => {
      clearInterval(interval);
      socket.off("admin:actualizar-mapa");
      socket.off("admin:alerta-gps");
    };
  }, []);

  const handleDeleteOrder = async (id) => {
    if (window.confirm("¿Cancelar este pedido?")) {
      await deleteOrderRequest(id);
      loadData();
      setSelectedOrder(null);
    }
  };

  const handleDeleteUser = async (id) => {
  if (window.confirm("¿Desactivar este cliente?")) {
    await deleteUserRequest(id);
    loadData();
  }
};

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Seteamos el estado con el ARCHIVO real y la PREVIA para el navegador
    setNewProduct({ 
      ...newProduct, 
      image: file, // 👈 Este es el que va al servidor (Binario)
      preview: URL.createObjectURL(file) // 👈 Este es el que usas en el <img src={...} />
    });
  }
};

 const handleProductSubmit = async (e) => {
  e.preventDefault();
  if (!newProduct.name || newProduct.name.length < 3) return alert("⚠️ El nombre debe tener al menos 3 caracteres");
  if (!newProduct.price) return alert("⚠️ Agrega un precio");
  if (!newProduct.stock) return alert("⚠️ Agrega el stock");
  if (!newProduct.image) return alert("⚠️ Sube una imagen");
  if (!newProduct.image) return alert("Sube imagen");

  // Creamos un FormData para que la imagen se envíe correctamente
  const formData = new FormData();
  formData.append("name", newProduct.name);
  formData.append("description", newProduct.description);
  formData.append("price", Number(newProduct.price));
  formData.append("stock", Number(newProduct.stock));
  formData.append("category", newProduct.category); // <--- Vital que vaya aquí
  formData.append("image", newProduct.image); // El archivo de la imagen

  // Enviamos el formData en lugar del objeto
  const success = await createProduct(formData);

  if(success) {
    alert("🚀 PUBLICADO EN CANNALAND");
    setNewProduct({ 
      name: "", 
      description: "", 
      price: "", 
      category: categorias[0], 
      stock: "", 
      image: null // Limpiamos la imagen
    });
    // Si tienes un input de tipo file, podrías necesitar resetearlo manualmente
    e.target.reset();
  }
};

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER NAV */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h1 className="text-5xl font-black italic tracking-tighter">CENTRAL <span className="text-green-600">ADMIN</span></h1>
          <div className="flex bg-black border border-zinc-900 p-1.5 rounded-[2rem] overflow-x-auto max-w-full">
            <button onClick={() => setTab("mapa")} className={`px-6 py-3 rounded-full text-[10px] font-black transition-all ${tab === "mapa" ? "bg-green-600 text-black" : "text-zinc-600"}`}>MAPA LIVE</button>
            <button onClick={() => setTab("productos")} className={`px-6 py-3 rounded-full text-[10px] font-black transition-all ${tab === "productos" ? "bg-green-600 text-black" : "text-zinc-600"}`}>CATÁLOGO</button>
            <button onClick={() => setTab("clientes")} className={`px-6 py-3 rounded-full text-[10px] font-black transition-all ${tab === "clientes" ? "bg-green-600 text-black" : "text-zinc-600"}`}>CLIENTES</button>
            <button onClick={() => setTab("socios")} className={`px-6 py-3 rounded-full text-[10px] font-black transition-all ${tab === "socios" ? "bg-green-600 text-black" : "text-zinc-600"}`}>SOLICITUDES</button>
            <button onClick={() => setTab("cupones")} className={`px-6 py-3 rounded-full text-[10px] font-black transition-all ${tab === "cupones" ? "bg-green-600 text-black" : "text-zinc-600"}`}>CUPONES</button>
          </div>
        </div>

        {/* --- PESTAÑA: MAPA LIVE --- */}
        {tab === "mapa" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-[40px] p-6 h-[600px] overflow-y-auto space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-4">Pedidos en curso</h3>
              {orders.length === 0 && <p className="text-zinc-700 text-xs text-center mt-20 italic">No hay pedidos activos</p>}
              {orders.map(order => (
                <div 
                  key={order._id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 rounded-3xl cursor-pointer border transition-all relative group ${selectedOrder?._id === order._id ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 bg-black/40'}`}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  <p className="text-green-500 font-black text-[10px]">#{order._id.slice(-6)}</p>
                  <p className="text-xs font-bold text-zinc-300 truncate pr-6">{order.deliveryAddress}</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`text-[8px] px-2 py-1 rounded font-black uppercase ${order.orderStatus === 'delivered' ? 'bg-green-600 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3 h-[600px] rounded-[40px] overflow-hidden border border-zinc-900 shadow-2xl relative">
              <MapContainer center={[19.4326, -99.1332]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {selectedOrder?.customerLocation?.lat && (
                  <RecenterMap lat={selectedOrder.customerLocation.lat} lng={selectedOrder.customerLocation.lng} />
                )}
                
                {orders.map((o) => (
                  <div key={o._id}>
                    {/* Marcador del Cliente */}
                    {o.customerLocation?.lat && (
                      <Marker position={[o.customerLocation.lat, o.customerLocation.lng]} icon={customerIcon}>
                        <Popup>
                          <div className="text-black font-bold p-1">
                            <p className="uppercase text-[10px]">Orden #{o._id.slice(-6)}</p>
                            <p className="text-xs mt-1 text-zinc-600">{o.deliveryAddress}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Marcador del Repartidor (GPS en vivo) */}
                    {deliveryLocations[o._id] && (
                      <Marker position={[deliveryLocations[o._id].lat, deliveryLocations[o._id].lng]} icon={deliveryIcon} />
                    )}
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* --- PESTAÑA: CLIENTES --- */}
{tab === "clientes" && (
  <div className="bg-zinc-900/20 border border-zinc-900 rounded-[40px] p-8 animate-in slide-in-from-bottom-4">
    <h2 className="text-3xl font-black italic uppercase mb-10 text-green-500">
      Clientes <span className="text-white">Registrados</span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allUsers.filter(u => u.status === 'active').map(user => (
        <div key={user._id} className="bg-black/60 border border-zinc-800 p-6 rounded-[2.5rem] hover:border-zinc-700 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            {/* Foto de perfil pequeña si existe */}
            <img src={user.fotoUrl} alt="" className="w-12 h-12 rounded-full border border-zinc-800 object-cover" />
            <div>
              <h4 className="font-black uppercase italic text-lg leading-tight">{user.username}</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{user.email}</p>
            </div>
          </div>

         <div className="flex gap-3 pt-4 border-t border-zinc-900">
  {/* Botón CURP */}
  <button 
    onClick={() => window.open(user.curpUrl)} 
    className="flex-1 group/btn bg-zinc-900/50 hover:bg-green-600/20 border border-zinc-800 hover:border-green-500/50 p-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95"
  >
    <FiFileText className="text-zinc-500 group-hover/btn:text-green-500 transition-colors"/>
    <span className="text-zinc-400 group-hover/btn:text-white">CURP</span>
  </button>

  {/* Botón VIDEO */}
  <button 
    onClick={() => window.open(user.videoUrl)} 
    className="flex-1 group/btn bg-zinc-900/50 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/50 p-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95"
  >
    <FiVideo className="text-zinc-500 group-hover/btn:text-blue-500 transition-colors"/>
    <span className="text-zinc-400 group-hover/btn:text-white">VIDEO</span>
  </button>

  {/* Botón ELIMINAR */}
  <button 
    onClick={() => handleDeleteUser(user._id)} 
    className="flex-1 group/btn bg-zinc-900/50 hover:bg-red-600/20 border border-zinc-800 hover:border-red-500/50 p-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95"
  >
    <FiTrash2 className="text-zinc-500 group-hover/btn:text-red-500 transition-colors"/>
    <span className="text-zinc-400 group-hover/btn:text-white">ELIMINAR</span>
  </button>
</div>
        </div>
      ))}
    </div>
  </div>
)}
{/* --- PESTAÑA: SOLICITUDES (KYC) --- */}
{tab === "socios" && (
  <div className="bg-zinc-900/20 border border-zinc-900 rounded-[40px] p-8 animate-in slide-in-from-right-4">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-black italic uppercase text-yellow-500">
        Solicitudes <span className="text-white">Pendientes</span>
      </h2>
      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
        {allUsers.filter(u => u.status === 'pending').length} En espera
      </span>
    </div>

    <div className="space-y-4">
      {allUsers.filter(u => u.status === 'pending').map(user => (
        <div key={user._id} className="bg-black/40 border border-zinc-800 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-zinc-700 transition-all group">
          
          {/* Info del Aspirante */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center font-black text-xl border-2 border-zinc-900 overflow-hidden">
                {user.fotoUrl ? (
                  <img src={user.fotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.username[0].toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-4 border-black animate-pulse"></div>
            </div>
            <div>
              <p className="font-black uppercase italic text-xl leading-none mb-1">{user.username}</p>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{user.email}</p>
              <p className="text-[9px] text-zinc-600 font-black mt-2">ID: {user._id.slice(-8)}</p>
            </div>
          </div>

          {/* Acciones y Documentos */}
          <div className="flex flex-wrap justify-center gap-3">
            {/* Botón CURP */}
            <button 
              onClick={() => window.open(user.curpUrl)} 
              className="group/btn relative bg-zinc-900 hover:bg-green-600/20 border border-zinc-800 hover:border-green-500/50 text-white p-4 rounded-2xl transition-all active:scale-90"
              title="Ver CURP"
            >
              <FiFileText className="group-hover/btn:text-green-500 transition-colors" size={20}/>
            </button>

            {/* Botón VIDEO */}
            <button 
              onClick={() => window.open(user.videoUrl)} 
              className="group/btn relative bg-zinc-900 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/50 text-white p-4 rounded-2xl transition-all active:scale-90"
              title="Ver Video"
            >
              <FiVideo className="group-hover/btn:text-blue-500 transition-colors" size={20}/>
            </button>

            {/* Botón Aprobar */}
            <button 
              onClick={async () => {
                await updateUserStatusRequest(user._id, 'active');
                loadData(); // Refresca la lista automáticamente
              }} 
              className="bg-green-600 text-black px-8 py-2 rounded-full font-black text-[10px] uppercase hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-95"
            >
              Aprobar Socio
            </button>

            {/* Botón Rechazar */}
            <button 
              onClick={async () => {
                if(window.confirm("¿Rechazar esta solicitud?")) {
                  await updateUserStatusRequest(user._id, 'rejected');
                  loadData();
                }
              }} 
              className="bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-2 rounded-full font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all"
            >
              <FiX size={16}/>
            </button>
          </div>

        </div>
      ))}

      {/* Estado vacío */}
      {allUsers.filter(u => u.status === 'pending').length === 0 && (
        <div className="text-center py-24 bg-zinc-900/10 rounded-[40px] border border-dashed border-zinc-900">
          <p className="text-zinc-700 uppercase font-black tracking-[0.3em] text-sm">No hay trámites pendientes</p>
        </div>
      )}
    </div>
  </div>
)}

{tab === "cupones" && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
    
    {/* FORMULARIO CREAR CUPÓN */}
    <div className="bg-zinc-900/40 border border-zinc-900 p-8 rounded-[40px] h-fit">
      <h2 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">
        Nuevo <span className="text-green-500">Cupón</span>
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="CÓDIGO (ej: CANNA10)"
          value={newCoupon.code}
          onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-green-500 text-white"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="DESCUENTO %"
            value={newCoupon.discount}
            onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-green-500 text-white"
          />
          <input
            type="number"
            placeholder="USOS MÁXIMOS"
            value={newCoupon.maxUses}
            onChange={e => setNewCoupon({...newCoupon, maxUses: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-green-500 text-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-zinc-500 ml-2 uppercase tracking-widest">Fecha de expiración</label>
          <input
            type="datetime-local"
            value={newCoupon.expiresAt}
            onChange={e => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-green-500 text-white"
          />
        </div>
        <button
          onClick={async () => {
            if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiresAt) return alert("Llena todos los campos");
            await createCouponRequest(newCoupon);
            setNewCoupon({ code: "", discount: "", maxUses: "", expiresAt: "" });
            loadData();
          }}
          className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase text-[12px] hover:bg-green-500 transition-all active:scale-95"
        >
          Crear Cupón
        </button>
      </div>
    </div>

    {/* LISTA DE CUPONES */}
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase text-zinc-500">Cupones Activos ({coupons.length})</h3>
      {coupons.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/10 rounded-[40px] border border-dashed border-zinc-900">
          <p className="text-zinc-700 uppercase font-black tracking-widest text-xs">No hay cupones creados</p>
        </div>
      )}
      {coupons.map(coupon => (
        <div key={coupon._id} className="bg-black/60 border border-zinc-800 p-6 rounded-[2.5rem] flex justify-between items-center group hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-green-500 font-black text-lg tracking-widest">{coupon.code}</span>
              <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase">
                {coupon.discount}% OFF
              </span>
              {!coupon.isActive && (
                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase">Inactivo</span>
              )}
            </div>
            <div className="flex gap-4 text-[9px] text-zinc-500 font-bold uppercase">
              <span className="flex items-center gap-1"><FiClock size={10}/> {new Date(coupon.expiresAt).toLocaleDateString()}</span>
              <span>{coupon.usedCount}/{coupon.maxUses} usos</span>
            </div>
          </div>
          <button
            onClick={async () => {
              if (window.confirm("¿Eliminar este cupón?")) {
                await deleteCouponRequest(coupon._id);
                loadData();
              }
            }}
            className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <FiTrash2 size={18}/>
          </button>
        </div>
      ))}
    </div>

  </div>
)}
       {/* --- PESTAÑA: PRODUCTOS --- */}
        {tab === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
            
            <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-900 p-8 rounded-[40px] h-fit">
               <h2 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">
                 Nuevo <span className="text-green-500">Goteo</span>
               </h2>
               
               <form onSubmit={handleProductSubmit} className="space-y-4">
                 <input 
                   type="file" 
                   onChange={handleImageChange} 
                   className="hidden" 
                   id="file-up" 
                   accept="image/*"
                 />
                 
                 <label 
                   htmlFor="file-up" 
                   className="w-full h-48 bg-black border border-dashed border-zinc-800 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:border-green-500 overflow-hidden group transition-all"
                 >
                   {newProduct.preview ? (
                     <img src={newProduct.preview} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <FiImage className="text-4xl text-zinc-800 group-hover:text-green-500 transition-all" />
                   )}
                 </label>

                 <input 
                   type="text" 
                   placeholder="NOMBRE DEL PRODUCTO" 
                   value={newProduct.name} 
                   onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                   className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-green-500 text-white" 
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                   <input 
                     type="number" 
                     placeholder="PRECIO $" 
                     value={newProduct.price} 
                     onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                     className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-green-500 text-white" 
                   />
                   <input 
                     type="number" 
                     placeholder="STOCK" 
                     value={newProduct.stock} 
                     onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                     className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-green-500 text-white" 
                   />
                 </div>

                 {/* --- SELECTOR DE CATEGORÍAS AGREGADO --- */}
                 <div className="flex flex-col gap-2">
                   <label className="text-[9px] font-black text-zinc-500 ml-2 uppercase tracking-[0.2em]">Categoría</label>
                   <select 
                     value={newProduct.category} 
                     onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                     className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-green-500 text-white cursor-pointer appearance-none"
                   >
                     {categorias.map(cat => (
                       <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                     ))}
                   </select>
                 </div>

                 <textarea placeholder="DESCRIPCIÓN BREVE" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-[10px] font-bold h-24 resize-none outline-none focus:border-green-500" />
                 
                 <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase text-[12px] hover:bg-green-500 transition-all active:scale-95">Publicar en Tienda</button>
               </form>
            </div>
{/* --- LISTA DE PRODUCTOS EXISTENTES --- */}
<div className="lg:col-span-2 bg-zinc-900/10 rounded-[40px] border border-zinc-900 p-8">
  <h3 className="text-xs font-black uppercase text-zinc-500 mb-6">
    Productos en Tienda ({products.length})
  </h3>

  {products.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-800">
      <FiPackage size={48} />
      <p className="italic font-bold uppercase tracking-widest text-xs">
        No hay productos publicados...
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
      {products.map(prod => (
        <div key={prod._id} className="bg-black/60 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-zinc-700 transition-all relative">
          
          {/* Contenedor de Imagen y Overlay */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={prod.image?.startsWith('http') ? prod.image : `https://floresyrolados.onrender.com/uploads/${prod.image}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={prod.name}
              onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Sin+Imagen"; }}
            />
            
            {/* Categoría */}
            <div className="absolute top-3 left-3 bg-white text-black text-[8px] font-black px-3 py-1 rounded-full uppercase">
              {prod.category}
            </div>

            {/* Botón eliminar */}
            <button
              onClick={async () => {
                if (window.confirm(`¿Eliminar "${prod.name}" de la tienda?`)) {
                  await deleteProduct(prod._id);
                }
              }}
              className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-10"
            >
              <FiTrash2 size={14}/>
            </button>
          </div>

          {/* Info del producto */}
          <div className="p-5">
            <h4 className="font-black uppercase italic text-sm leading-tight truncate text-white">{prod.name}</h4>
            <div className="flex justify-between items-center mt-3">
              <span className="text-green-500 font-black text-xl">${prod.price}</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Stock: {prod.stock}</span>
            </div>
          </div>

        </div>
      ))}
    </div>
  )}
</div>

  {/* Mini previsualización del nuevo producto abajo */}
  {(newProduct.name || newProduct.preview) && (
    <div className="mt-6 pt-6 border-t border-zinc-900">
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Vista previa del nuevo producto:</p>
      <div className="flex items-center gap-4 bg-black/40 border border-green-500/20 p-4 rounded-2xl">
        {newProduct.preview && (
          <img src={newProduct.preview} className="w-16 h-16 object-cover rounded-xl" alt="Preview"/>
        )}
        <div>
          <p className="font-black uppercase italic text-sm">{newProduct.name || "Sin nombre"}</p>
          <p className="text-green-500 font-black">${newProduct.price || "0"}</p>
          <span className="text-[8px] text-zinc-500 uppercase">{newProduct.category}</span>
        </div>
      </div>
    </div>
  )}
</div>

          </div>
        )}

      </div>
      {gpsAlerts.length > 0 && (
  <div className="fixed top-6 right-6 z-50 space-y-3">
    {gpsAlerts.map(alert => (
      <div key={alert.id} className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
        <FiBell className="animate-bounce" size={20}/>
        <div>
          <p className="font-black text-[10px] uppercase">⚠️ GPS Desactivado</p>
          <p className="text-[9px] opacity-80">{alert.clienteNombre} quitó su ubicación</p>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
}

export default AdminPage;