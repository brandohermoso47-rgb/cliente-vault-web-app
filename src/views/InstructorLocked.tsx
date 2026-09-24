// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function InstructorLocked({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"14px","textAlign":"center","maxWidth":"520px","margin":"60px auto","padding":"36px 30px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
      <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"52px","height":"52px","borderRadius":"16px","color":"var(--purple)","border":"1px solid var(--purple)","background":"color-mix(in oklch, var(--purple) 16%, transparent)"}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="4" y="11" width="16" height="10" rx="2"></rect>
          <path d="M8 11V7a4 4 0 018 0v4"></path>
        </svg>
      </span>
      <h2 style={{"margin":"0","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"26px","fontWeight":"400","color":"var(--ink)"}}>
        {"Esto es solo para instructores"}
      </h2>
      <p style={{"margin":"0","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)"}}>
        {"El Panel de Instructor (dashboard, alumnos, finanzas y contenido) solo se administra desde una cuenta de instructor o estudio aprobada. Solicita convertirte en instructor desde Planes & Membresía."}
      </p>
      <div onClick={v.goPlanes} style={{"marginTop":"6px","padding":"12px 22px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer"}}>
        {"Ver Planes & Membresía"}
      </div>
    </div>
    </>
  );
}
