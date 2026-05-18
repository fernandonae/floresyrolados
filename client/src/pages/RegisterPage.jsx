import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiUser, FiMail, FiLock, FiCamera, FiVideo, 
  FiFileText, FiArrowLeft, FiCheckCircle, FiLoader, FiX, FiAlertCircle 
} from "react-icons/fi";

const FileInput = ({ icon: Icon, label, registerName, setter, fileName, isCamera = false, register, formErrors, trigger, setValue }) => {
  const handleClear = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setter(""); 
    setValue(registerName, null);
    await trigger(registerName);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative">
        <label className={`flex flex-col gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-dashed transition group cursor-pointer ${formErrors[registerName] ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 hover:border-green-500'}`}>
          <div className="flex items-center gap-3">
            <Icon className={`${fileName ? 'text-green-500' : 'text-zinc-500'} text-xl group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">{label}</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={isCamera ? "image/*" : registerName === "video" ? "video/*" : "image/*,application/pdf"}
            capture={isCamera ? "user" : undefined}
            {...register(registerName, { 
              required: "Requerido",
              onChange: async (e) => {
                const file = e.target.files[0];
                if (file) {
                  setter(file.name);
                  await trigger(registerName);
                }
              }
            })} 
          />
          {fileName ? (
            <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold bg-green-950/30 px-3 py-2 rounded-xl mt-1 border border-green-500/20">
              <FiCheckCircle className="flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500 italic">Clic para seleccionar</span>
          )}
        </label>
        {fileName && (
          <button type="button" onClick={handleClear} className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-xl hover:bg-red-500 transition-all z-10">
            <FiX size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

function RegisterPage() {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors: formErrors } } = useForm();
  const { signup, errors: serverErrors } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [fotoName, setFotoName] = useState("");
  const [curpName, setCurpName] = useState("");
  const [videoName, setVideoName] = useState("");

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Enviamos todos los campos de texto (Incluyendo nombre, apellidos, colonia, etc)
      Object.keys(values).forEach(key => {
        if (key !== 'foto' && key !== 'video' && key !== 'curp_file') {
          formData.append(key, values[key]);
        }
      });

      // Archivos (deben coincidir con el upload.fields del router)
      if (values.foto?.[0]) formData.append("foto", values.foto[0]);
      if (values.video?.[0]) formData.append("video", values.video[0]);
      if (values.curp_file?.[0]) formData.append("curp_file", values.curp_file[0]);

      const res = await signup(formData);
      if (res) {
        setIsRegistered(true);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-12 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-black border border-zinc-800 rounded-[40px] p-6 md:p-10 shadow-2xl overflow-hidden">
        
        {isRegistered ? (
          <div className="py-16 text-center space-y-8 animate-in fade-in duration-500">
            <FiCheckCircle className="text-green-500 text-9xl mx-auto animate-bounce" />
            <h1 className="text-5xl font-black text-white italic uppercase">¡Enviado!</h1>
            <p className="text-zinc-400">Tu solicitud está en revisión.</p>
            <Link to="/" className="inline-block bg-white text-black font-black px-10 py-4 rounded-full uppercase italic">Inicio</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="md:col-span-2 text-center mb-6">
               <h1 className="text-4xl font-black text-white italic uppercase">Registro de <span className="text-green-600">Socio</span></h1>
               {serverErrors && serverErrors.map((error, i) => (
                 <div key={i} className="bg-red-500/10 text-red-500 border border-red-500/50 p-2 rounded-lg mt-4 text-xs uppercase font-bold">{error}</div>
               ))}
            </div>

            <div className="space-y-6">
              <input {...register("nombre", { required: true })} placeholder="Nombre" className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none transition" />
              <input {...register("apellidos", { required: true })} placeholder="Apellidos" className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none transition" />
              <div className="flex gap-4">
                <input type="number" {...register("edad", { required: true, min: 18 })} placeholder="Edad" className="w-24 bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-4 text-white focus:border-green-600 outline-none" />
                <input {...register("curp_text", { required: true, minLength: 18, maxLength: 18 })} placeholder="CURP (18 CARACTERES)" className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none uppercase" />
              </div>
              <input type="email" {...register("email", { required: true })} placeholder="Email" className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none" />
              <input type="password" {...register("password", { required: true, minLength: 6 })} placeholder="Contraseña" className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none" />
            </div>

            <div className="space-y-6">
              <input {...register("direccion", { required: true })} placeholder="Calle y Número" className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none" />
              <div className="flex gap-4">
                <input {...register("colonia", { required: true })} placeholder="Colonia" className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-6 text-white focus:border-green-600 outline-none" />
                <input {...register("cp", { required: true })} placeholder="C.P." className="w-24 bg-[#0a0a0a] border border-zinc-800 rounded-2xl py-3.5 px-4 text-white focus:border-green-600 outline-none" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FileInput icon={FiCamera} label="Foto Selfie" registerName="foto" setter={setFotoName} fileName={fotoName} register={register} formErrors={formErrors} trigger={trigger} setValue={setValue} isCamera={true} />
                <FileInput icon={FiFileText} label="Identificación" registerName="curp_file" setter={setCurpName} fileName={curpName} register={register} formErrors={formErrors} trigger={trigger} setValue={setValue} />
                <FileInput icon={FiVideo} label="Video Seguridad" registerName="video" setter={setVideoName} fileName={videoName} register={register} formErrors={formErrors} trigger={trigger} setValue={setValue} />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-full text-xl shadow-lg transition-all uppercase italic disabled:bg-zinc-800">
                {isSubmitting ? "Enviando..." : "Enviar Solicitud ✅"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;