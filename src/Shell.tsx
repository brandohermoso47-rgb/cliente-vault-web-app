// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from './lib/dc';
import Hero from './views/Hero';
import Feed from './views/Feed';
import Cursos from './views/Cursos';
import Cursos2 from './views/Cursos2';
import Tv from './views/Tv';
import Podcast from './views/Podcast';
import Lives from './views/Lives';
import Reels from './views/Reels';
import Lab from './views/Lab';
import Study from './views/Study';
import Fisico from './views/Fisico';
import Perfil from './views/Perfil';
import Ebooks from './views/Ebooks';
import Grupos from './views/Grupos';
import Muro from './views/Muro';
import Ranking from './views/Ranking';
import Planes from './views/Planes';
import Support from './views/Support';
import InstructorLocked from './views/InstructorLocked';
import Instructor from './views/Instructor';
import Account from './screens/Account';
import Musica from './views/Musica';

export default function Shell({ v }: { v: any }) {
  return (
    <>
    <div style={{"position":"relative","display":"flex","minHeight":"100vh"}}>
      <aside style={sty(`width:${v.asideW ?? ""};flex:0 0 ${v.asideW ?? ""};overflow:hidden;transition:width .24s cubic-bezier(.2,.85,.25,1);${v.chromeBg ?? ""}backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);border-right:1px solid var(--hair);display:flex;flex-direction:column;gap:20px;padding:22px 14px 16px`)}>
        <div onClick={v.toggleNav} title={v.navToggleLabel} style={sty(`align-self:flex-end;display:flex;align-items:center;justify-content:center;width:30px;height:30px;flex:0 0 30px;border-radius:50%;border:1px solid var(--hair);background:var(--glass-2);${v.chromeInk2 ?? ""}cursor:pointer`)} className={cx(pc("hover", "color:#fff;border-color:var(--pink)"))}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M4 6h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 18h16"></path>
          </svg>
        </div>
        <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"2px","padding":"2px 0 18px","borderBottom":"1px solid var(--hair-soft)"}}>
          {v.navOpen && (
            <>
              <img src="uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={sty(v.navLogo)} />
            </>
          )}
          {v.navCollapsed && (
            <>
              <img src="uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={sty(v.navLogo)} />
            </>
          )}
          <div style={sty(v.navKicker)}>
            {"PLATAFORMA DE ENTRENAMIENTO"}
          </div>
        </div>
        <div onClick={v.goPerfil} style={sty(`display:flex;align-items:center;justify-content:center;gap:10px;padding:9px 12px;border-radius:999px;background:var(--glass-2);border:1px solid var(--hair);box-shadow:var(--lg-edge);cursor:pointer;${v.chromeInk ?? ""}transition:border-color .18s ease`)} className={cx(pc("hover", "border-color:color-mix(in oklch, var(--pink) 50%, transparent)"))}>
          <div style={{"width":"34px","height":"34px","borderRadius":"50%","flex":"0 0 34px","background":"linear-gradient(135deg,var(--purple),var(--pink))"}}></div>
          {v.navOpen && (
            <>
              <div style={{"minWidth":"0","flex":"1"}}>
                <div style={sty(`font-size:12px;font-weight:700;${v.chromeInk ?? ""}white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>
                  {"Bailarín Waack On"}
                </div>
                <div style={sty(v.roleLine)}>
                  {v.roleName}
                  {" · Nivel 1"}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{"flex":"0 0 14px","opacity":".6"}}>
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </>
          )}
        </div>
        <nav style={{"display":"flex","flexDirection":"column","gap":"20px","flex":"1"}}>
          <div style={{"display":"flex","flexDirection":"column","gap":"3px"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"7px","padding":"0 12px 8px"}}>
              <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--blue)"}}></span>
              <span style={sty(v.navGroupLabel)}>
                {"ENTRENAR"}
              </span>
            </div>
            <div onClick={v.goDashboard} style={sty(v.navDashboard)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--blue)","border":"1px solid var(--blue)","background":"color-mix(in oklch, var(--blue) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                  <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                  <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                  <rect x="3" y="16" width="7" height="5" rx="1"></rect>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Dashboard"}
              </span>
            </div>
            <div onClick={v.goCursos} style={sty(v.navCursos)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--gold)","border":"1px solid var(--gold)","background":"color-mix(in oklch, var(--gold) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 10 12 5 2 10l10 5 10-5Z"></path>
                  <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Clases & Cursos"}
              </span>
            </div>
            <div onClick={v.goLab} style={sty(v.navLab)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--purple)","border":"1px solid var(--purple)","background":"color-mix(in oklch, var(--purple) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m12 3-1.9 5.8L4 10.7l4.6 4-1.3 6 4.7-3.2 4.7 3.2-1.3-6 4.6-4-6.1-1.9L12 3Z"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Laboratorio Freestyle"}
              </span>
            </div>
            <div onClick={v.goFisico} style={sty(v.navFisico)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--blue) 50%, var(--purple))","border":"1px solid color-mix(in oklch, var(--blue) 50%, var(--purple))","background":"color-mix(in oklch, color-mix(in oklch, var(--blue) 50%, var(--purple)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 5v14"></path>
                  <path d="M18 5v14"></path>
                  <path d="M4 9h4"></path>
                  <path d="M16 9h4"></path>
                  <path d="M4 15h4"></path>
                  <path d="M16 15h4"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Cuerpo & Estiramientos"}
              </span>
            </div>
            <div onClick={v.goStudy} style={sty(v.navStudy)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--yellow)","border":"1px solid var(--yellow)","background":"color-mix(in oklch, var(--yellow) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Plan de Estudio"}
              </span>
            </div>
            <div onClick={v.goEbooks} style={sty(v.navEbooks)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--yellow) 60%, var(--gold))","border":"1px solid color-mix(in oklch, var(--yellow) 60%, var(--gold))","background":"color-mix(in oklch, color-mix(in oklch, var(--yellow) 60%, var(--gold)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Manuales"}
              </span>
            </div>
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"3px"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"7px","padding":"0 12px 8px"}}>
              <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--pink)"}}></span>
              <span style={sty(v.navGroupLabel)}>
                {"COMUNIDAD"}
              </span>
            </div>
            <div onClick={v.goLives} style={sty(v.navLives)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--pink)","border":"1px solid var(--pink)","background":"color-mix(in oklch, var(--pink) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4.9 19.1a10 10 0 0 1 0-14.2"></path>
                  <path d="M7.8 16.2a6 6 0 0 1 0-8.4"></path>
                  <circle cx="12" cy="12" r="2"></circle>
                  <path d="M16.2 7.8a6 6 0 0 1 0 8.4"></path>
                  <path d="M19.1 4.9a10 10 0 0 1 0 14.2"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Lives / En Vivo"}
              </span>
              {' '}
              <span style={{"display":"inline-flex","alignItems":"center","gap":"5px","fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".1em","color":"#fff","background":"var(--pink)","padding":"3px 7px","borderRadius":"999px"}}>
                <span style={{"width":"4px","height":"4px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                {"VIVO"}
              </span>
            </div>
            <div onClick={v.goTv} style={sty(v.navTv)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--pink) 55%, var(--purple))","border":"1px solid color-mix(in oklch, var(--pink) 55%, var(--purple))","background":"color-mix(in oklch, color-mix(in oklch, var(--pink) 55%, var(--purple)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="3"></rect>
                  <path d="m7 3 5 4 5-4"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Waack On TV"}
              </span>
            </div>
            <div onClick={v.goReels} style={sty(v.navReels)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--pink) 60%, var(--blue))","border":"1px solid color-mix(in oklch, var(--pink) 60%, var(--blue))","background":"color-mix(in oklch, color-mix(in oklch, var(--pink) 60%, var(--blue)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="18" rx="3"></rect>
                  <path d="M7 3v18"></path>
                  <path d="M17 3v18"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Waack Reels"}
              </span>
            </div>
            <div onClick={v.goPodcasts} style={sty(v.navPodcasts)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--purple) 55%, var(--blue))","border":"1px solid color-mix(in oklch, var(--purple) 55%, var(--blue))","background":"color-mix(in oklch, color-mix(in oklch, var(--purple) 55%, var(--blue)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="2" width="6" height="11" rx="3"></rect>
                  <path d="M5 10a7 7 0 0 0 14 0"></path>
                  <path d="M12 17v5"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Podcasts"}
              </span>
            </div>
            <div onClick={v.goMuro} style={sty(v.navMuro)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--yellow) 55%, var(--pink))","border":"1px solid color-mix(in oklch, var(--yellow) 55%, var(--pink))","background":"color-mix(in oklch, color-mix(in oklch, var(--yellow) 55%, var(--pink)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.9"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Muro & Retos"}
              </span>
            </div>
            <div onClick={v.goRanking} style={sty(v.navRanking)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--yellow)","border":"1px solid var(--yellow)","background":"color-mix(in oklch, var(--yellow) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z"></path>
                  <path d="M9 20h6"></path>
                  <path d="M12 15v5"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Ranking & Insignias"}
              </span>
            </div>
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"3px"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"7px","padding":"0 12px 8px"}}>
              <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--purple)"}}></span>
              <span style={sty(v.navGroupLabel)}>
                {"CUENTA"}
              </span>
            </div>
            <div onClick={v.goPlanes} style={sty(v.navPlanes)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--gold) 55%, var(--pink))","border":"1px solid color-mix(in oklch, var(--gold) 55%, var(--pink))","background":"color-mix(in oklch, color-mix(in oklch, var(--gold) 55%, var(--pink)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m5 16-2-9 6 4 3-6 3 6 6-4-2 9H5Z"></path>
                  <path d="M5 20h14"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Planes & Membresía"}
              </span>
            </div>
            <div style={sty(v.navIdle)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","border":"1px solid currentColor","background":"color-mix(in oklch, currentColor 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.7 21a2 2 0 0 1-3.4 0"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Notificaciones"}
              </span>
              {' '}
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","color":"#fff","background":"var(--purple)","padding":"3px 7px","borderRadius":"999px"}}>
                {"3"}
              </span>
            </div>
            <div onClick={v.goGrupos} style={sty(v.navGrupos)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"var(--blue)","border":"1px solid var(--blue)","background":"color-mix(in oklch, var(--blue) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                  <circle cx="10" cy="7" r="4"></circle>
                  <path d="M21 21v-2a4 4 0 0 0-3-3.9"></path>
                  <path d="M16 3.1a4 4 0 0 1 0 7.8"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Grupos"}
              </span>
            </div>
            {v.isRealInstructor && (
              <>
                <div onClick={v.goInstructor} style={sty(v.navInstructor)}>
                  <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--purple) 60%, var(--pink))","border":"1px solid color-mix(in oklch, var(--purple) 60%, var(--pink))","background":"color-mix(in oklch, color-mix(in oklch, var(--purple) 60%, var(--pink)) 16%, transparent)"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 3 2 8l10 5 10-5-10-5Z"></path>
                      <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"></path>
                      <path d="M22 8v6"></path>
                    </svg>
                  </span>
                  {' '}
                  <span style={sty(v.navLabel)}>
                    {"Panel de Instructor"}
                  </span>
                  {' '}
                  {v.navOpen && (
                    <>
                      <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".1em","color":"#fff","background":"var(--purple)","padding":"3px 7px","borderRadius":"999px"}}>
                        {"DOCENTE"}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
            <div onClick={v.goSupport} style={sty(v.navSupport)}>
              <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"9px","color":"color-mix(in oklch, var(--blue) 55%, var(--yellow))","border":"1px solid color-mix(in oklch, var(--blue) 55%, var(--yellow))","background":"color-mix(in oklch, color-mix(in oklch, var(--blue) 55%, var(--yellow)) 16%, transparent)"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </span>
              {' '}
              <span style={sty(v.navLabel)}>
                {"Ayuda & Legal"}
              </span>
            </div>
          </div>
        </nav>
        <div style={sty(v.themeSwitchWrap)}>
          <div onClick={v.setDark} style={sty(v.themeDarkBtn)} title="Oscuro">
            {v.themeDarkLabel}
          </div>
          <div onClick={v.setLight} style={sty(v.themeLightBtn)} title="Claro">
            {v.themeLightLabel}
          </div>
        </div>
      </aside>
      <main style={{"flex":"1","minWidth":"0","display":"flex","flexDirection":"column"}}>
        <header style={sty(`position:relative;z-index:1000;display:flex;align-items:center;gap:18px;padding:15px 32px;border-bottom:1px solid var(--hair);${v.headerBg ?? ""}backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur)`)}>
          <div style={{"display":"flex","alignItems":"baseline","gap":"10px","minWidth":"0","flex":"1"}}>
            <span style={sty(`font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.2em;${v.chromeInk2 ?? ""}text-transform:uppercase`)}>
              {"Waack On"}
            </span>
            <span style={{"color":"var(--ink-3)"}}>
              {"/"}
            </span>
            <span style={sty(`font-size:14px;font-weight:700;${v.chromeInk ?? ""}white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>
              {v.crumb}
            </span>
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
            <div style={sty(`display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);font-size:12px;${v.chromeInk2 ?? ""}cursor:pointer`)} className={cx(pc("hover", "color:#fff"))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.5-3.5"></path>
              </svg>
              {" Buscar "}
            </div>
            <div style={{"position":"relative"}}>
              <div onClick={v.notifToggle} style={sty(`position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);${v.chromeInk2 ?? ""}cursor:pointer`)} className={cx(pc("hover", "color:#fff"))}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.7 21a2 2 0 0 1-3.4 0"></path>
                </svg>
                <span style={{"position":"absolute","top":"7px","right":"9px","width":"6px","height":"6px","borderRadius":"50%","background":"var(--pink)"}}></span>
              </div>
              {v.notifOpen && (
                <>
                  <div onClick={v.notifClose} style={{"position":"fixed","inset":"0","zIndex":"2000"}}></div>
                  <div style={{"position":"absolute","top":"50px","right":"0","zIndex":"2001","width":"310px","borderRadius":"22px","border":"1px solid color-mix(in oklch, var(--blue) 45%, transparent)","background":"#0B0A10","boxShadow":"0 30px 70px -26px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.06), 0 0 34px -14px var(--blue)","padding":"16px","animation":"rise3d .28s cubic-bezier(.2,.85,.25,1)"}}>
                    <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"rgba(255,255,255,.6)","textTransform":"uppercase"}}>
                        {"Notificaciones"}
                      </div>
                      <div style={{"flex":"1"}}></div>
                      <div onClick={v.notifReadAll} style={{"fontSize":"11px","fontWeight":"700","color":"var(--blue)","cursor":"pointer"}}>
                        {"Marcar leídas"}
                      </div>
                    </div>
                    <div style={{"display":"flex","flexDirection":"column","gap":"6px","marginTop":"12px","maxHeight":"320px","overflowY":"auto"}}>
                      {(v.notifList ?? []).map((n: any, $index: number) => (
                        <Fragment key={$index}>
                          <div onClick={n?.read} style={sty(n?.row)} className={cx(pc("hover", "background:rgba(255,255,255,.08)"))}>
                            <span style={sty(n?.dot)}></span>
                            {' '}
                            <div style={{"flex":"1","minWidth":"0"}}>
                              <div style={{"fontSize":"12.5px","fontWeight":"700","color":"#FFFFFF","lineHeight":"1.35","textWrap":"pretty"}}>
                                {n?.title}
                              </div>
                              <div style={{"fontSize":"11.5px","lineHeight":"1.5","color":"rgba(255,255,255,.75)","marginTop":"3px","textWrap":"pretty"}}>
                                {n?.text}
                              </div>
                              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".1em","color":"rgba(255,255,255,.5)","marginTop":"5px","textTransform":"uppercase"}}>
                                {n?.time}
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{"position":"relative"}}>
              <div onClick={v.acctToggle} style={sty(v.acctAvatar)}>
                {v.myInitial}
              </div>
              {v.acctOpen && (
                <>
                  <div onClick={v.acctClose} style={{"position":"fixed","inset":"0","zIndex":"2000"}}></div>
                  <div style={{"position":"absolute","top":"50px","right":"0","zIndex":"2001","width":"280px","borderRadius":"22px","border":"1px solid color-mix(in oklch, var(--pink) 60%, transparent)","background":"#0B0A10","boxShadow":"0 30px 70px -26px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.06), 0 0 34px -12px var(--pink)","padding":"16px","animation":"rise3d .28s cubic-bezier(.2,.85,.25,1)"}}>
                    <div style={{"display":"flex","alignItems":"center","gap":"12px"}}>
                      <div style={sty(v.myDropAvatar)}>
                        {v.myInitial}
                      </div>
                      <div style={{"flex":"1","minWidth":"0"}}>
                        <div style={{"fontSize":"13.5px","fontWeight":"700","color":"#FFFFFF","overflowWrap":"anywhere"}}>
                          {v.myDisplayName}
                        </div>
                        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"rgba(255,255,255,.6)","marginTop":"3px","overflowWrap":"anywhere"}}>
                          {v.myHandle}
                        </div>
                      </div>
                    </div>
                    <div style={{"display":"flex","alignItems":"center","gap":"8px","marginTop":"12px","flexWrap":"wrap"}}>
                      <span style={sty(v.roleBadge)}>
                        {v.roleShort}
                      </span>
                      <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"rgba(255,255,255,.6)","textTransform":"uppercase"}}>
                        {"Nivel 2"}
                      </span>
                    </div>
                    <div style={{"height":"1px","background":"rgba(255,255,255,.16)","margin":"14px 0"}}></div>
                    <div style={{"display":"flex","flexDirection":"column","gap":"2px"}}>
                      {(v.acctLinks ?? []).map((a: any, $index: number) => (
                        <Fragment key={$index}>
                          <div onClick={a?.go} style={sty(a?.style)} className={cx(pc("hover", "background:rgba(255,255,255,.12);color:#fff"))}>
                            <span style={{"flex":"1"}}>
                              {a?.label}
                            </span>
                            {' '}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{"flex":"0 0 14px","opacity":".55"}}>
                              <path d="m9 6 6 6-6 6"></path>
                            </svg>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div style={{"height":"1px","background":"rgba(255,255,255,.16)","margin":"12px 0"}}></div>
                    <div onClick={v.logout} style={{"marginTop":"8px","padding":"11px 14px","borderRadius":"14px","textAlign":"center","fontSize":"12px","fontWeight":"700","color":"#14111A","border":"1px solid var(--pink)","background":"var(--pink)","cursor":"pointer","transition":"filter .18s ease"}} className={cx(pc("hover", "filter:brightness(1.1)"))}>
                      {"Cerrar sesión"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <div style={{"flex":"1","padding":"32px","overflow":"auto"}}>
        {v.showHero && <Hero v={v} />}
        {v.isFeed && <Feed v={v} />}
        {v.isCursos && <Cursos v={v} />}
        {v.isCursos && <Cursos2 v={v} />}
        {v.isTv && <Tv v={v} />}
        {v.isPodcast && <Podcast v={v} />}
        {v.isLives && <Lives v={v} />}
        {v.isReels && <Reels v={v} />}
        {v.isLab && <Lab v={v} />}
        {v.isStudy && <Study v={v} />}
        {v.isFisico && <Fisico v={v} />}
        {v.isPerfil && <Perfil v={v} />}
        {v.isEbooks && <Ebooks v={v} />}
        {v.isGrupos && <Grupos v={v} />}
        {v.isMuro && <Muro v={v} />}
        {v.isRanking && <Ranking v={v} />}
        {v.isPlanes && <Planes v={v} />}
        {v.isSupport && <Support v={v} />}
        {v.isInstructorLocked && <InstructorLocked v={v} />}
        {v.isInstructor && <Instructor v={v} />}
        {v.isCuenta && <Account go={v.goView} />}
        {v.isMusica && <Musica go={v.goView} />}
        </div>
      </main>
    </div>
    </>
  );
}
