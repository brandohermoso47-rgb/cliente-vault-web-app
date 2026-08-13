import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chrome, ArrowRight, Eye, EyeOff, AlertCircle, Globe, Sparkles, CheckCircle2, User, UserCheck, Instagram, Sparkle } from 'lucide-react';
import { z } from 'zod';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Language, translations, languageNames } from '../lib/translations';
import Logo from './Logo';

// Zod Profile Schema Definition
const createProfileSchema = (lang: Language) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(2, {
        message: lang === 'es' ? 'El nombre debe tener al menos 2 caracteres.' : 'First Name must be at least 2 characters.',
      }),
    lastName: z
      .string()
      .trim()
      .min(2, {
        message: lang === 'es' ? 'El apellido debe tener al menos 2 caracteres.' : 'Last Name must be at least 2 characters.',
      }),
    instagram: z
      .string()
      .trim()
      .min(2, {
        message: lang === 'es' ? 'El usuario de Instagram es obligatorio.' : 'Instagram handle is required.',
      })
      .refine(
        (val) => /^[a-zA-Z0-9._@]+$/.test(val),
        {
          message:
            lang === 'es'
              ? 'El usuario de Instagram solo puede contener letras, números, puntos, guiones bajos o @.'
              : 'Instagram handle can only contain letters, numbers, dots, underscores, or @.',
        }
      ),
  });

interface LoginViewProps {
  onGuestMode: () => void;
  onSuccess: (user: any) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LoginView({ onGuestMode, onSuccess, language, onLanguageChange }: LoginViewProps) {
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(false);
  const [pendingAuthUser, setPendingAuthUser] = useState<any>(null);

  // Profile fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');

  // Auth fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  // Handle Initial Email Auth (Sign In or Account Creation)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);

    if (isSignUpMode) {
      if (!firstName.trim() || !lastName.trim() || !email || !password) {
        setError(
          language === 'es'
            ? 'Por favor ingresa tu nombre, apellido, correo y contraseña.'
            : 'Please enter your first name, last name, email, and password.'
        );
        return;
      }
    } else {
      if (!email || !password) {
        setError(language === 'es' ? 'Por favor completa todos los campos.' : 'Please fill in all fields.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUpMode) {
        // Step 1: Create Auth user
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setPendingAuthUser(result.user);
        // Transition to Profile Setup Form step
        setShowProfileSetup(true);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(result.user);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(
          language === 'es'
            ? 'Este correo ya está registrado. Por favor inicia sesión.'
            : 'Email already in use. Please log in.'
        );
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(
          language === 'es' 
            ? 'Credenciales no encontradas. Puedes hacer clic en Registrarse o Continuar en Modo Invitado.' 
            : 'Invalid credentials. You can click Sign Up or Continue as Guest.'
        );
      } else {
        // Fallback for offline or local test
        if (isSignUpMode) {
          const fallbackUser = {
            uid: 'usr_' + Date.now(),
            email,
            displayName: `${firstName.trim()} ${lastName.trim()}`
          };
          setPendingAuthUser(fallbackUser);
          setShowProfileSetup(true);
        } else {
          onSuccess({
            uid: 'usr_' + Date.now(),
            email,
            displayName: email.split('@')[0]
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Final Profile Setup Form Submission
  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate profile fields with Zod schema
    const schema = createProfileSchema(language);
    const validationResult = schema.safeParse({
      firstName,
      lastName,
      instagram,
    });

    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message ||
        (language === 'es' ? 'Por favor ingresa datos válidos.' : 'Please enter valid profile data.');
      setError(firstError);
      return;
    }

    setLoading(true);

    const { firstName: validFirstName, lastName: validLastName, instagram: rawInstagram } = validationResult.data;
    const fullName = `${validFirstName} ${validLastName}`;
    const cleanInstagram = rawInstagram.startsWith('@') ? rawInstagram : `@${rawInstagram}`;
    const cleanNickname = `@${validFirstName.toLowerCase()}_${validLastName.toLowerCase()}`.replace(/\s+/g, '');

    const userId = pendingAuthUser?.uid || `usr_${Date.now()}`;

    // Update Firebase Auth display name if possible
    if (pendingAuthUser && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: fullName });
      } catch (upErr) {
        console.warn('Could not update Auth displayName:', upErr);
      }
    }

    // Save Profile Document in Firestore `users/{uid}`
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          id: userId,
          name: fullName,
          firstName: validFirstName,
          lastName: validLastName,
          instagram: cleanInstagram,
          email: pendingAuthUser?.email || email.trim(),
          nickname: cleanNickname,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          role: undefined,
          subscribedInstructorIds: [],
          completedLessons: [],
          points: 0,
          billingStatus: 'cancelled',
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Could not save user profile to Firestore:', fsErr);
    }

    setLoading(false);
    // Redirect to Dashboard via onSuccess
    onSuccess(pendingAuthUser || { uid: userId, displayName: fullName, email });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(language === 'es' ? 'Ingresa tu correo para restablecer la contraseña.' : 'Enter your email to reset password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setResetSent(true); // Confirmation UI
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (isSignUpMode) {
        const nameParts = (result.user.displayName || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setPendingAuthUser(result.user);
        setShowProfileSetup(true);
      } else {
        onSuccess(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Inicio de sesión con Google cancelado por el usuario.");
      } else if (err.code === 'auth/popup-blocked') {
        setError(
          language === 'es' 
            ? 'La ventana emergente fue bloqueada. Habilita las ventanas emergentes o usa Modo Invitado.' 
            : 'The popup was blocked. Please enable popups or use Guest Mode.'
        );
      } else {
        console.error("Error logging in with Google:", err);
        const fallbackUser = { uid: 'google_guest', displayName: 'Bailarín Waack On', email: 'dancer@waackon.com' };
        if (isSignUpMode) {
          setPendingAuthUser(fallbackUser);
          setShowProfileSetup(true);
        } else {
          onSuccess(fallbackUser);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-white font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Soft Ambient Background Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-pink-600/10 via-purple-600/10 to-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Floating Glassmorphism Box */}
        <div className="bg-[#121622]/60 border border-white/20 rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col items-center space-y-6 relative overflow-hidden">
          
          {/* Subtle top glare highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* 3D Metallic "WAACK ON" Logo Header */}
          <div className="flex flex-col items-center justify-center select-none py-1 w-full">
            <Logo variant="full" className="w-64 h-auto" />
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 2: PROFILE SETUP FORM (AFTER SIGN-UP) */}
            {showProfileSetup ? (
              <motion.form
                key="profile-setup-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCompleteProfileSubmit}
                className="w-full space-y-4"
              >
                <div className="text-center space-y-1 pb-2 border-b border-white/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9C349]/20 border border-[#E9C349]/40 text-[#E9C349] text-[10px] font-mono font-black uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'Crear Perfil de Bailarín' : 'Create Dancer Profile'}</span>
                  </div>
                  <h3 className="text-base font-black text-white font-mono uppercase pt-1">
                    {language === 'es' ? 'Completa tus Datos' : 'Complete Your Profile'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'es' ? 'Agrega tu nombre, apellido e Instagram para conectarte con la comunidad.' : 'Add your first name, last name, and Instagram to connect.'}
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-[#E9C349]" />
                    {language === 'es' ? 'Nombre *' : 'First Name *'}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={language === 'es' ? 'Ej. Marilyn' : 'e.g. Marilyn'}
                    required
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-[#E9C349]/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#E9C349]" />
                    {language === 'es' ? 'Apellido *' : 'Last Name *'}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={language === 'es' ? 'Ej. Monroe' : 'e.g. Monroe'}
                    required
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-[#E9C349]/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-400" />
                    {language === 'es' ? 'Usuario de Instagram *' : 'Instagram Handle *'}
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@marilyn_waack"
                    required
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-pink-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === 'es' ? 'Campo obligatorio. Se sincronizará con tu documento de usuario en Firestore.' : 'Required field. Will sync with your user document in Firestore.'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Save Profile Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#FF007A] text-white font-black text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(255,40,104,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">{language === 'es' ? 'Guardando Perfil...' : 'Saving Profile...'}</span>
                  ) : (
                    <>
                      <span>{language === 'es' ? 'Guardar Perfil e Ingresar' : 'Save Profile & Enter'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* STEP 1: INITIAL LOGIN / SIGN UP FORM */
              <motion.form
                key="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailAuth}
                className="w-full space-y-4"
              >
                {/* First Name & Last Name Fields (Shown when Signing Up) */}
                {isSignUpMode && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase">
                        {language === 'es' ? 'Nombre' : 'First Name'}
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={language === 'es' ? 'Ej. Marilyn' : 'e.g. Marilyn'}
                        required={isSignUpMode}
                        className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/40 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase">
                        {language === 'es' ? 'Apellido' : 'Last Name'}
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={language === 'es' ? 'Ej. Monroe' : 'e.g. Monroe'}
                        required={isSignUpMode}
                        className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/40 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase">
                    {language === 'es' ? 'Correo Electrónico' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'es' ? 'tu@correo.com' : 'your@email.com'}
                    required
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/40 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1 uppercase">
                    {language === 'es' ? 'Contraseña' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/40 rounded-2xl px-5 py-3.5 pr-12 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                {!isSignUpMode && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-slate-300 hover:text-white transition-colors font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Reset Sent Message */}
                {resetSent && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Correo enviado para restablecer tu contraseña.</span>
                  </div>
                )}

                {/* Primary Gradient Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#FF007A] text-white font-black text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(255,40,104,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">{language === 'es' ? 'Cargando...' : 'Loading...'}</span>
                  ) : isSignUpMode ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{language === 'es' ? 'Registrarse y Configurar Perfil' : 'Sign Up & Setup Profile'}</span>
                    </>
                  ) : (
                    <span>{language === 'es' ? 'Iniciar Sesión' : 'Log In'}</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle between Log In and Sign Up (Only shown when not in profile setup step) */}
          {!showProfileSetup && (
            <div className="text-center text-xs text-slate-300 pt-1">
              {isSignUpMode ? (
                <span>
                  {language === 'es' ? '¿Ya tienes una cuenta?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(false);
                      setError(null);
                    }}
                    className="font-bold text-white hover:underline cursor-pointer ml-1"
                  >
                    {language === 'es' ? 'Iniciar Sesión' : 'Log In'}
                  </button>
                </span>
              ) : (
                <span>
                  {language === 'es' ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(true);
                      setError(null);
                    }}
                    className="font-bold text-white hover:underline cursor-pointer ml-1"
                  >
                    {language === 'es' ? 'Registrarse' : 'Sign Up'}
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Alternative Auth Dividers (Only shown when not in profile setup step) */}
          {!showProfileSetup && (
            <div className="w-full pt-4 border-t border-white/10 space-y-3">
              
              {/* Google Login Option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-red-400" />
                <span>Iniciar Sesión con Google</span>
              </button>

              {/* Guest Mode Direct Access */}
              <button
                type="button"
                onClick={onGuestMode}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Continuar como Invitado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

          {/* Language Selector */}
          <div className="pt-2 flex items-center justify-between w-full text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono uppercase">
              <Globe className="w-3.5 h-3.5 text-slate-300" /> Idioma:
            </span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-black/40 text-white border border-white/20 rounded-lg text-xs py-0.5 px-2 outline-none cursor-pointer font-bold"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code} className="bg-[#121212] text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer brand credit */}
        <p className="text-center text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-6">
          © 2026 WAACK ON • GLOBAL DANCE PORTAL
        </p>
      </motion.div>
    </div>
  );
}

