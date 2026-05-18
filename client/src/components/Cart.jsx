import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart } = useCart();

  // Calcular el total
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Tu Carrito 🛒</h2>
      
      {cart.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">El carrito está vacío</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-600 text-green-700 font-bold">
                   {item.quantity} x ${item.price}
                </p>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 font-bold hover:text-red-700 px-2"
              >
                Eliminar
              </button>
            </div>
          ))}
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-xl font-black">
              <span>Total:</span>
              <span className="text-green-800">${total.toFixed(2)}</span>
            </div>
            <button className="w-full mt-4 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg">
              Finalizar Compra 🏁
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;