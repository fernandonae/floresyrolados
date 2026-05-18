import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm();
  const { signin, isAuthenticated, errors: serverErrors } = useAuth();
  const navigate = useNavigate();
  
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // EFECTO DE LIMPIEZA TOTAL
  useEffect(() => {
    // Si el usuario entra al login y ya está autenticado, lo mandamos fuera
    if (isAuthenticated) {
      navigate("/");
    }
    
    // Limpieza al montar y desmontar el componente
    reset({ email: "", password: "" });
    
    return () => reset({ email: "", password: "" });
  }, [isAuthenticated, navigate, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await signin(data);
  });

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-zinc-950 px-4 py-12 selection:bg-green-500 selection:text-black">
      <div className="w-full max-w-md bg-black border border-zinc-900 rounded-[45px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">
            ENTRAR<span className="text-green-500">.</span>
          </h1>
          <p className="text-zinc-600 text-[10px] mt-4 font-black uppercase tracking-[0.4em]">Acceso exclusivo socios</p>
        </div>

        {/* ERRORES DEL SERVIDOR */}
        {serverErrors.length > 0 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-3xl flex items-center gap-3 animate-pulse">
            <FiAlertCircle className="text-xl shrink-0" />
            <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
              {serverErrors.map((error, i) => <p key={i}>{error}</p>)}
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        {/* autoComplete="none" y campos falsos ayudan a engañar al auto-completado de Chrome */}
        <form onSubmit={onSubmit} autoComplete="off" className="space-y-6">
          
          {/* Inputs invisibles para engañar al navegador (Honeypot) */}
          <input type="text" style={{display:'none'}} autoComplete="off" />
          <input type="password" style={{display:'none'}} autoComplete="off" />

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-6">Email Corporativo</label>
            <div className="relative group">
              <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-green-500 transition-colors text-xl" />
              <input 
                type="email" 
                {...register("email", { required: "El email es obligatorio" })}
                autoComplete="new-password" 
                className="w-full bg-zinc-950 border border-zinc-900 rounded-[25px] py-5 pl-16 pr-6 text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all placeholder:text-zinc-800 text-sm font-medium"
                placeholder="socio@cannaland.com"
              />
            </div>
            {formErrors.email && <span className="text-[9px] text-red-500 ml-6 font-black uppercase tracking-tighter">{formErrors.email.message}</span>}
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-6">Llave de Acceso</label>
            <div className="relative group">
              <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-green-500 transition-colors text-xl" />
              <input 
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "La contraseña es obligatoria" })}
                autoComplete="new-password"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-[25px] py-5 pl-16 pr-14 text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all placeholder:text-zinc-800 text-sm font-medium"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {formErrors.password && <span className="text-[9px] text-red-500 ml-6 font-black uppercase tracking-tighter">{formErrors.password.message}</span>}
          </div>

          {/* BOTÓN ENTRAR */}
          <button 
            type="submit" 
            className="w-full bg-white hover:bg-green-500 text-black font-black py-5 rounded-[25px] text-xs shadow-2xl active:scale-[0.98] transition-all mt-4 uppercase tracking-[0.3em]"
          >
            Desbloquear Catálogo
          </button>
        </form>

        {/* LOGIN SOCIAL */}
        <div className="relative my-10 flex items-center">
          <div className="flex-grow border-t border-zinc-900"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest">O acceso rápido</span>
          <div className="flex-grow border-t border-zinc-900"></div>
        </div>

        <button className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 py-4 rounded-[25px] flex items-center justify-center gap-3 transition active:scale-[0.98] group">
          <FcGoogle className="text-xl" />
          <span className="text-zinc-500 group-hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">Google Auth</span>
        </button>

        {/* LINK A REGISTRO */}
        <div className="mt-12 text-center">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            ¿Eres nuevo en la comunidad?
          </p>
          <Link to="/register" className="inline-block mt-3 text-white hover:text-green-500 font-black text-xs uppercase tracking-tighter border-b-2 border-green-600/30 hover:border-green-500 transition-all pb-1">
            Crea tu cuenta de socio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;