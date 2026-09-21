// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Planes({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      {v.planMsg && (
        <>
          <div style={{"padding":"14px 18px","borderRadius":"16px","border":"1px solid var(--hair)","background":"var(--glass)","fontSize":"13px","lineHeight":"1.5","color":"var(--ink)"}}>
            {v.planMsg}
          </div>
        </>
      )}
      {v.planPickerOpen && (
        <>
          <div onClick={v.planPickerClose} style={{"position":"fixed","inset":"0","zIndex":"3000","background":"rgba(0,0,0,.6)","display":"flex","alignItems":"center","justifyContent":"center","padding":"24px"}}>
            <div onClick={v.planPickerStop} style={{"width":"100%","maxWidth":"440px","maxHeight":"80vh","overflow":"auto","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"#0B0A10","boxShadow":"0 30px 70px -26px rgba(0,0,0,.9)"}}>
              <div style={{"fontSize":"16px","fontWeight":"800","color":"#fff"}}>
                {"Elige tu instructor"}
              </div>
              <div style={{"fontSize":"12.5px","lineHeight":"1.5","color":"rgba(255,255,255,.65)","margin":"6px 0 14px"}}>
                {"Tu suscripción de cátedra da acceso a todos sus cursos y a su sala de chat."}
              </div>
              <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                {(v.planPickerList ?? []).map((t: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={t?.pick} style={{"display":"flex","flexDirection":"column","gap":"3px","padding":"13px 15px","borderRadius":"16px","border":"1px solid rgba(255,255,255,.16)","background":"rgba(255,255,255,.05)","cursor":"pointer"}} className={cx(pc("hover", "background:rgba(255,255,255,.12)"))}>
                      <span style={{"fontSize":"13.5px","fontWeight":"700","color":"#fff"}}>
                        {t?.name}
                      </span>
                      <span style={{"fontSize":"11.5px","color":"rgba(255,255,255,.6)"}}>
                        {t?.role}
                      </span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <div style={{"display":"flex","flexDirection":"column","gap":"16px","padding":"24px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}>
          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Tu rol actual"}
          </span>
          <span style={sty(v.roleBadge)}>
            {v.roleShort}
          </span>
        </div>
        <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"34px","letterSpacing":"-0.01em","color":"var(--ink)"}}>
          {v.roleName}
        </div>
        <p style={{"margin":"0","fontSize":"13.5px","lineHeight":"1.6","color":"var(--ink-2)","maxWidth":"620px","textWrap":"pretty"}}>
          {v.roleDesc}
        </p>
        {v.showRoleDemo && (
          <>
            <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(240px,1fr))","gap":"12px"}}>
              <div onClick={v.togglePlatform} style={sty(v.subPlatformStyle)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{"flex":"0 0 16px"}}>
                  <path d="M4 12l5 5L20 6"></path>
                </svg>
                {' '}
                <span style={{"flex":"1"}}>
                  {"Suscripción de plataforma"}
                </span>
              </div>
              <div onClick={v.toggleInstructor} style={sty(v.subInstructorStyle)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{"flex":"0 0 16px"}}>
                  <path d="M4 12l5 5L20 6"></path>
                </svg>
                {' '}
                <span style={{"flex":"1"}}>
                  {"Suscripción con instructor"}
                </span>
              </div>
              <div onClick={v.toggleDocente} style={sty(v.subDocenteStyle)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{"flex":"0 0 16px"}}>
                  <path d="M4 12l5 5L20 6"></path>
                </svg>
                {' '}
                <span style={{"flex":"1"}}>
                  {"Modo instructor (docente)"}
                </span>
              </div>
            </div>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","lineHeight":"1.7","color":"var(--ink-3)"}}>
              {"Sin suscripción → Usuario · Plataforma → Usuario Premium · Instructor → Estudiante · Ambas → Estudiante Premium"}
            </div>
          </>
        )}
      </div>
      <div style={{"display":"flex","gap":"6px","padding":"6px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","maxWidth":"340px"}}>
        {(v.cycleTabs ?? []).map((c: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={c?.pick} style={sty(c?.style)}>
              {c?.label}
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"fontSize":"12px","lineHeight":"1.5","color":"var(--ink-3)","maxWidth":"640px"}}>
        {"Precios de referencia en euros. Al pagar verás el importe en tu moneda y los medios de pago disponibles en tu país; los impuestos se calculan según tu país."}
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(290px,1fr))","gap":"22px","alignItems":"stretch"}}>
        {(v.plans ?? []).map((p: any, $index: number) => (
          <Fragment key={$index}>
            <div style={sty(p?.card)}>
              <div style={{"position":"absolute","top":"0","left":"0","right":"0","height":"152px","zIndex":"0"}}>
                <image-slot id={p?.slotId} shape="rect" placeholder={p?.slotHint}></image-slot>
              </div>
              <div style={{"position":"absolute","top":"0","left":"0","right":"0","height":"152px","zIndex":"1","pointerEvents":"none","background":"linear-gradient(180deg, rgba(8,6,11,.12) 0%, rgba(8,6,11,.5) 60%, rgba(8,6,11,.85) 88%, var(--ground) 100%)"}}></div>
              <div style={{"position":"relative","zIndex":"2"}}>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {p?.name}
                </div>
                <div style={{"marginTop":"12px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","letterSpacing":"-0.01em","color":"var(--ink)"}}>
                  {p?.price}
                </div>
              </div>
              <p style={{"margin":"0","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty","position":"relative","zIndex":"2"}}>
                {p?.desc}
              </p>
              <div style={{"display":"flex","flexDirection":"column","gap":"9px","flex":"1","position":"relative","zIndex":"2"}}>
                {(p?.feats ?? []).map((f: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={{"display":"flex","alignItems":"flex-start","gap":"9px","fontSize":"13px","color":"var(--ink)"}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" style={{"flex":"0 0 15px","marginTop":"2px"}}>
                        <path d="M4 12l5 5L20 6"></path>
                      </svg>
                      <span style={{"textWrap":"pretty"}}>
                        {f?.text}
                      </span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div onClick={p?.choose} style={sty(p?.cta)}>
                {p?.ctaLabel}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"16px","padding":"18px 22px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
        <div>
          <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
            {"Método de pago · VISA ···· 4417"}
          </div>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"5px"}}>
            {"Próximo cargo: 12 oct 2026 · 19,00 €"}
          </div>
        </div>
        <div style={{"display":"flex","gap":"10px","flexWrap":"wrap"}}>
          <span style={{"padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "color:var(--ink)"))}>
            {"Ver facturas"}
          </span>
          <span style={{"padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "color:var(--ink)"))}>
            {"Cambiar tarjeta"}
          </span>
        </div>
      </div>
    </div>
    </>
  );
}
