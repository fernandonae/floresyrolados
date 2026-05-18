import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createOrderRequest } from "../api/orders";
import { validateCouponRequest } from "../api/coupons";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";


import { 
  FiArrowLeft, FiMapPin, FiCamera, FiClock, 
  FiTag, FiCheck, FiX, FiAlertCircle
} from "react-icons/fi";
import { Cannabis } from "lucide-react";



// Cámbialo por el link de Render (sin el /api al final para sockets)
const socket = io("https://floresyrolados.onrender.com");
const MIN_HOURS_AHEAD = 3;

function CheckoutPage() {
  const { cart, cartTotal, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [minTime, setMinTime] = useState("");
  const [outfitPhoto, setOutfitPhoto] = useState(null);
  const [outfitPreview, setOutfitPreview] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | 'valid' | 'invalid'
  const [discount, setDiscount] = useState(0);
  const [gpsGranted, setGpsGranted] = useState(false);
  const [coords, setCoords] = useState(null);
  const watchIdRef = useRef(null);

  // Calcular hora mínima (ahora + 3 horas)
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + MIN_HOURS_AHEAD);
    const formatted = now.toISOString().slice(0, 16);
    setMinTime(formatted);
    setScheduledTime(formatted);
  }, []);

  // Pedir GPS al montar y vigilar si lo quitan
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGpsGranted(true);
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        // Si quitan el GPS, mandamos alerta al admin
        setGpsGranted(false);
        socket.emit("cliente:gps-desactivado", {
          clienteNombre: user?.username || "Cliente",
        });
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleOutfitPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOutfitPhoto(file);
      setOutfitPreview(URL.createObjectURL(file));
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateCouponRequest(couponCode);
      setDiscount(res.data.discount);
      setCouponStatus('valid');
    } catch {
      setDiscount(0);
      setCouponStatus('invalid');
    }
  };

  const discountedTotal = (cartTotal - (cartTotal * discount / 100)).toFixed(2);

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!gpsGranted || !coords) {
      alert("🚨 Debes permitir el GPS para continuar.");
      return;
    }

    if (!outfitPhoto) {
      alert("📸 Debes subir una foto de cómo vienes vestido.");
      return;
    }

    setLoading(true);

    try {
      // Convertir foto a base64
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const outfitBase64 = await toBase64(outfitPhoto);

      const finalOrder = {
        products: cart.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        phone,
        deliveryAddress: address,
        customerLocation: coords,
        paymentMethod: 'cash',
        orderNote,
        scheduledTime,
        discountCode: couponStatus === 'valid' ? couponCode : null,
        discountAmount: discount,
        outfitPhoto: outfitBase64,
      };

      const res = await createOrderRequest(finalOrder);

      if (res.status === 200 || res.status === 201) {
        clearCart();
        alert("🚀 ¡Pedido enviado! El administrador lo verá en el mapa.");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("🚨 Error al enviar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-black mb-6 uppercase italic">Tu carrito está vacío</h2>
        <Link to="/" className="text-green-500 border-2 border-green-500 px-8 py-3 rounded-full font-black uppercase">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        <div className="space-y-8">
          <div>
            <Link to="/" className="text-zinc-500 flex items-center gap-2 hover:text-green-500 transition-all mb-8 uppercase text-[10px] font-black">
              <FiArrowLeft /> Volver al dispensario
            </Link>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">Checkout</h1>
          </div>

          {/* ALERTA GPS */}
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${gpsGranted ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'}`}>
            <FiMapPin />
            {gpsGranted ? "GPS Activo — Te estamos localizando" : "GPS Requerido — Activa tu ubicación"}
          </div>
           
          <form onSubmit={handleOrder} className="space-y-5">

            {/* TELÉFONO */}
            <div className="relative">
              <span className="absolute left-4 top-4 text-zinc-500 font-black text-sm">+52</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 p-4 pl-16 rounded-2xl w-full font-bold text-sm outline-none focus:border-green-500 text-white"
                placeholder="WHATSAPP"
              />
            </div>

            {/* DIRECCIÓN */}
            <div className="relative">
              <FiMapPin className="absolute left-4 top-4 text-green-500" />
              <textarea
                required
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 p-4 pl-12 rounded-2xl w-full font-bold text-sm resize-none outline-none focus:border-green-500"
                placeholder="REFERENCIA VISUAL (Ej: Portón blanco frente al parque)..."
              />
            </div>

            {/* NOTA DEL PEDIDO */}
            <textarea
              rows="2"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl w-full font-bold text-sm resize-none outline-none focus:border-green-500"
              placeholder="¿QUÉ ESTÁS PIDIENDO? Confirma tu pedido aquí..."
            />

            {/* HORA DEL PEDIDO */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-zinc-500 ml-2 uppercase tracking-widest flex items-center gap-2">
                <FiClock /> Hora de entrega (mínimo {MIN_HOURS_AHEAD}h de anticipación)
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                min={minTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl w-full font-bold text-sm outline-none focus:border-green-500 text-white"
              />
            </div>

            {/* FOTO DE OUTFIT */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-zinc-500 ml-2 uppercase tracking-widest flex items-center gap-2">
                <FiCamera /> Foto de cómo vienes vestido
              </label>
              <input type="file" accept="image/*" onChange={handleOutfitPhoto} className="hidden" id="outfit-upload" />
              <label
                htmlFor="outfit-upload"
                className="w-full h-40 bg-black border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 overflow-hidden transition-all"
              >
                {outfitPreview ? (
                  <img src={outfitPreview} className="w-full h-full object-cover" alt="Outfit" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <FiCamera size={28} />
                    <span className="text-[9px] font-black uppercase">Subir foto</span>
                  </div>
                )}
              </label>
            </div>

            {/* CUPÓN */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FiTag className="absolute left-4 top-4 text-zinc-500" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); setDiscount(0); }}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 pl-12 rounded-2xl w-full font-bold text-sm outline-none focus:border-green-500 uppercase"
                  placeholder="CÓDIGO DE DESCUENTO"
                />
              </div>
              <button
                type="button"
                onClick={handleValidateCoupon}
                className="bg-zinc-800 hover:bg-zinc-700 px-6 rounded-2xl font-black text-[10px] uppercase transition-all"
              >
                Aplicar
              </button>
            </div>

            {/* STATUS CUPÓN */}
            {couponStatus === 'valid' && (
              <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase ml-2">
                <FiCheck /> Cupón aplicado — {discount}% de descuento
              </div>
            )}
            {couponStatus === 'invalid' && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase ml-2">
                <FiX /> Cupón inválido o expirado
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !gpsGranted}
              className={`w-full bg-white text-black font-black py-6 rounded-[2.5rem] uppercase italic text-2xl hover:bg-green-500 transition-all ${(loading || !gpsGranted) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Procesando..." : `Confirmar • $${discount > 0 ? discountedTotal : cartTotal}`}
            </button>

          </form>
        </div>

        {/* RESUMEN */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[50px] h-fit sticky top-24">
          <h2 className="text-2xl font-black uppercase italic mb-6">Tu Pedido</h2>
          {cart.map(item => (
  <div key={item._id} className="flex justify-between items-center mb-4 group">
    <div className="flex items-center gap-3">
      <button
  onClick={() => removeFromCart(item._id)}
  className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
>
 <Cannabis size={16}/>
</button>
      <span className="text-xs font-bold uppercase">{item.name} x{item.quantity}</span>
    </div>
    <span className="text-green-500 font-black">${(item.price * item.quantity).toFixed(2)}</span>
  </div>
))}
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <div className="flex justify-between text-zinc-500 text-xs font-bold">
              <span>Subtotal</span>
              <span>${cartTotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500 text-xs font-bold">
                <span>Descuento ({discount}%)</span>
                <span>-${(cartTotal * discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2">
              <span className="font-black italic">TOTAL</span>
              <span className="text-2xl font-black text-green-500">${discount > 0 ? discountedTotal : cartTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;
